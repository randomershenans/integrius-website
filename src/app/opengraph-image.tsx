import { brandOgImage, OG_SIZE } from '@/lib/og-image';

export const runtime = 'nodejs';
export const alt = 'Integrius: Connect once. Use everywhere. Know everything.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandOgImage({
    eyebrow: 'The self-hosted data product platform',
    titleLines: [
      { text: 'Connect once.' },
      { text: 'Use everywhere.' },
      { text: 'Know everything.', accent: true },
    ],
    footer: 'integri.us',
    tag: 'Self-hosted',
  });
}
