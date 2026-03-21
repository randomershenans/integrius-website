import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { generateArticle } from '@/lib/claude';

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { spec_id } = await req.json() as { spec_id: string };
  if (!spec_id) return NextResponse.json({ error: 'spec_id required' }, { status: 400 });

  const spec = await prisma.cms_article_specs.findUnique({
    where: { id: spec_id },
    include: { cluster: { select: { id: true } } },
  });

  if (!spec) return NextResponse.json({ error: 'Spec not found' }, { status: 404 });

  const siteUrl  = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002';
  const bgFnUrl  = process.env.URL ? `${process.env.URL}/.netlify/functions/generate-background` : null;

  const queueEntry = await prisma.cms_generation_queue.create({
    data: { spec_id, status: 'pending', scheduled_for: new Date() },
  });

  if (bgFnUrl) {
    // Production: fire background function (returns 202 instantly) and respond immediately
    await fetch(bgFnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queue_id: queueEntry.id,
        site_url: siteUrl,
        spec: {
          id:                 spec.id,
          cluster_id:         spec.cluster?.id ?? null,
          title:              spec.title,
          slug:               spec.slug,
          meta_title:         spec.meta_title  ?? spec.title,
          meta_description:   spec.meta_description ?? '',
          primary_keyword:    spec.primary_keyword,
          secondary_keywords: spec.secondary_keywords,
          search_intent:      spec.search_intent,
          article_type:       spec.article_type,
          h2_structure:       spec.h2_structure,
          key_points:         spec.key_points,
          word_count_min:     spec.word_count_min,
          word_count_max:     spec.word_count_max,
          cta_text:           spec.cta_text ?? null,
          internal_links:     spec.internal_links,
        },
      }),
    });
    return NextResponse.json({ queue_id: queueEntry.id, async: true }, { status: 202 });
  }

  // Local dev: run synchronously (no Netlify timeout)
  await prisma.cms_generation_queue.update({
    where: { id: queueEntry.id },
    data: { status: 'generating', started_at: new Date() },
  });

  try {
    const generated = await generateArticle({
      title:              spec.title,
      slug:               spec.slug,
      primary_keyword:    spec.primary_keyword,
      secondary_keywords: spec.secondary_keywords,
      search_intent:      spec.search_intent,
      article_type:       spec.article_type,
      h2_structure:       spec.h2_structure,
      key_points:         spec.key_points,
      word_count_min:     spec.word_count_min,
      word_count_max:     spec.word_count_max,
      cta_text:           spec.cta_text,
      internal_links:     spec.internal_links,
    });

    let slug = spec.slug;
    const existingSlug = await prisma.cms_articles.findUnique({ where: { slug }, select: { id: true } });
    if (existingSlug) slug = `${spec.slug}-${Date.now()}`;

    const article = await prisma.cms_articles.create({
      data: {
        spec_id,
        cluster_id:       spec.cluster?.id,
        title:            spec.title,
        slug,
        meta_title:       spec.meta_title       ?? spec.title,
        meta_description: spec.meta_description ?? '',
        primary_keyword:  spec.primary_keyword,
        article_type:     spec.article_type,
        content:          generated.content,
        excerpt:          generated.excerpt,
        word_count:       generated.word_count,
        status:           'draft',
        ai_generated:     true,
        ai_model:         generated.model,
        ai_prompt_tokens: generated.prompt_tokens,
        ai_output_tokens: generated.output_tokens,
      },
    });

    await prisma.cms_generation_queue.update({
      where: { id: queueEntry.id },
      data: { status: 'done', completed_at: new Date(), article_id: article.id },
    });

    return NextResponse.json({ article }, { status: 201 });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Generation failed';
    await prisma.cms_generation_queue.update({
      where: { id: queueEntry.id },
      data: { status: 'failed', completed_at: new Date(), error: errorMsg },
    });
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
