import prisma from '@/lib/prisma';
import { brandOgImage, OG_SIZE } from '@/lib/og-image';

export const runtime = 'nodejs';
export const alt = 'Integrius blog article';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  let title = 'The Integrius Blog';
  let eyebrow = 'Integrius blog';
  let tag: string | undefined;

  try {
    const article = await prisma.cms_articles.findUnique({
      where: { slug: params.slug },
      select: {
        title: true,
        article_type: true,
        status: true,
        cluster: { select: { name: true } },
      },
    });
    if (article && article.status === 'published') {
      title = article.title;
      eyebrow = article.cluster?.name ? `${article.cluster.name} · Integrius blog` : 'Integrius blog';
      tag = article.article_type === 'faq' ? 'FAQ' : 'Guide';
    }
  } catch {
    // Database unavailable: fall back to the brand card rather than failing the image
  }

  return brandOgImage({
    eyebrow,
    titleLines: [{ text: title }],
    footer: 'integri.us/blog',
    tag,
  });
}
