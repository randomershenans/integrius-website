import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface CompletePayload {
  queue_id: string;
  error?: string;
  spec?: {
    id: string;
    cluster_id: string | null;
    title: string;
    slug: string;
    meta_title: string;
    meta_description: string;
    primary_keyword: string;
    article_type: string;
  };
  content?: string;
  excerpt?: string;
  word_count?: number;
  model?: string;
  prompt_tokens?: number;
  output_tokens?: number;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.CMS_JWT_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as CompletePayload;
  const { queue_id } = body;

  if (body.error) {
    await prisma.cms_generation_queue.update({
      where: { id: queue_id },
      data: { status: 'failed', completed_at: new Date(), error: body.error },
    });
    return NextResponse.json({ ok: true });
  }

  const { spec, content, excerpt, word_count, model, prompt_tokens, output_tokens } = body;
  if (!spec || !content) {
    return NextResponse.json({ error: 'Missing spec or content' }, { status: 400 });
  }

  try {
    let slug = spec.slug;
    const existing = await prisma.cms_articles.findUnique({ where: { slug }, select: { id: true } });
    if (existing) slug = `${spec.slug}-${Date.now()}`;

    const article = await prisma.cms_articles.create({
      data: {
        spec_id:          spec.id,
        cluster_id:       spec.cluster_id,
        title:            spec.title,
        slug,
        meta_title:       spec.meta_title,
        meta_description: spec.meta_description,
        primary_keyword:  spec.primary_keyword,
        article_type:     spec.article_type,
        content,
        excerpt,
        word_count,
        status:           'draft',
        ai_generated:     true,
        ai_model:         model,
        ai_prompt_tokens: prompt_tokens,
        ai_output_tokens: output_tokens,
      },
    });

    await prisma.cms_generation_queue.update({
      where: { id: queue_id },
      data: { status: 'done', completed_at: new Date(), article_id: article.id },
    });

    return NextResponse.json({ ok: true, article_id: article.id });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save article';
    await prisma.cms_generation_queue.update({
      where: { id: queue_id },
      data: { status: 'failed', completed_at: new Date(), error: errorMsg },
    });
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
