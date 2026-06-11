import { getAllArticles, getArticle } from '@/lib/content';
import { brandOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Integrius blog article';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);

  return brandOgImage({
    eyebrow: article?.cluster?.name ? `${article.cluster.name} · Integrius blog` : 'Integrius blog',
    titleLines: [{ text: article?.title ?? 'The Integrius Blog' }],
    footer: 'integri.us/blog',
    tag: article ? (article.article_type === 'faq' ? 'FAQ' : 'Guide') : undefined,
  });
}
