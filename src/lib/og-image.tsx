import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Shared Open Graph image template. Dark, typographic, on-brand.
 * Fonts are read from public/fonts (bundled into the Netlify function via
 * netlify.toml included_files); if reading fails we fall back to the
 * built-in font rather than failing the image.
 */

export const OG_SIZE = { width: 1200, height: 630 };

type FontDef = { name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' };

let cachedFonts: FontDef[] | null | undefined;

function loadFonts(): FontDef[] | undefined {
  if (cachedFonts !== undefined) return cachedFonts ?? undefined;
  try {
    const dir = join(process.cwd(), 'public', 'fonts');
    cachedFonts = [
      { name: 'Inter', data: readFileSync(join(dir, 'Inter-Regular.ttf')), weight: 400, style: 'normal' },
      { name: 'Inter', data: readFileSync(join(dir, 'Inter-SemiBold.ttf')), weight: 600, style: 'normal' },
      { name: 'Inter', data: readFileSync(join(dir, 'Inter-Bold.ttf')), weight: 700, style: 'normal' },
    ];
  } catch {
    cachedFonts = null;
  }
  return cachedFonts ?? undefined;
}

export interface OgTitleLine {
  text: string;
  accent?: boolean;
}

export function brandOgImage({
  eyebrow,
  titleLines,
  footer,
  tag,
}: {
  eyebrow: string;
  titleLines: OgTitleLine[];
  footer: string;
  tag?: string;
}) {
  const totalChars = titleLines.reduce((n, l) => n + l.text.length, 0);
  const fontSize = totalChars > 90 ? 48 : totalChars > 60 ? 56 : 66;
  const fonts = loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          padding: '64px 80px',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '630px',
            background:
              'radial-gradient(circle at 18% 8%, rgba(0,184,212,0.22) 0%, rgba(0,0,0,0) 55%), radial-gradient(circle at 90% 100%, rgba(0,145,234,0.16) 0%, rgba(0,0,0,0) 50%)',
            display: 'flex',
          }}
        />

        {/* Header: brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00B8D4 0%, #0091EA 100%)',
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex', fontSize: '26px', fontWeight: 600, color: '#ffffff' }}>integri.us</div>
        </div>

        {/* Middle: eyebrow + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1020px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '19px',
              fontWeight: 600,
              letterSpacing: '5px',
              color: '#00B8D4',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {titleLines.map((line, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  fontSize: `${fontSize}px`,
                  fontWeight: 700,
                  lineHeight: 1.12,
                  letterSpacing: '-2px',
                  color: line.accent ? '#00B8D4' : '#ffffff',
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: '22px', color: 'rgba(255,255,255,0.5)' }}>{footer}</div>
          {tag ? (
            <div
              style={{
                display: 'flex',
                fontSize: '19px',
                fontWeight: 600,
                color: '#00B8D4',
                border: '1.5px solid rgba(0,184,212,0.45)',
                borderRadius: '999px',
                padding: '8px 22px',
              }}
            >
              {tag}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
    },
  );
}
