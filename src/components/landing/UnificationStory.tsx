'use client';

import { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';

/**
 * The scroll-driven centrepiece of the homepage.
 *
 * A 400vh scroll act rendered on a sticky full-screen canvas:
 *   Act 1 (0.00-0.30)  Chaos: 16 source systems scattered, tangled N x M lines to consumers
 *   Act 2 (0.30-0.58)  Unification: sources glide into a column, lines resolve into one layer
 *   Act 3 (0.58-0.84)  Data products: clean endpoints fan out from the layer
 *   Act 4 (0.84-1.00)  Governance: audit-chain pulses travel the layer
 */

const SOURCES = [
  'PostgreSQL', 'MySQL', 'MSSQL', 'Snowflake', 'BigQuery', 'Redshift',
  'MongoDB', 'REST API', 'GraphQL', 'Salesforce', 'Kafka', 'S3',
  'CSV', 'Excel', 'JSON', 'Events',
];

const ENDPOINTS = [
  'GET /v1/customers',
  'GET /v1/orders',
  'GET /v1/revenue',
  'GET /v1/churn-risk',
  'Optic · ask anything',
];

const CYAN = '#00B8D4';
const BLUE = '#0091EA';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  time: number,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, w, h);
  const compact = w < 640;
  const n = SOURCES.length;

  const unify = smooth(0.28, 0.56, p);
  const layer = smooth(0.34, 0.6, p);
  const serve = smooth(0.58, 0.82, p);
  const govern = smooth(0.84, 0.98, p);
  const jitterAmp = reduced ? 0 : (1 - unify) * 6;

  // Consumer anchor points: scattered in chaos, an even right-hand column once serving
  const consumers = ENDPOINTS.map((_, i) => {
    const cx = (0.55 + 0.38 * rand(i * 7 + 3)) * w;
    const cy = (0.12 + 0.74 * rand(i * 7 + 5)) * h;
    const ox = compact ? w * 0.86 : w * 0.8;
    const oy = h * (0.18 + (0.64 * i) / (ENDPOINTS.length - 1));
    return { x: lerp(cx, ox, unify), y: lerp(cy, oy, unify) };
  });

  // Source nodes: scattered in chaos, a tidy left column once unified
  const nodes = SOURCES.map((label, i) => {
    const sx = (0.06 + 0.5 * rand(i * 2 + 1)) * w;
    const sy = (0.1 + 0.8 * rand(i * 2 + 2)) * h;
    const tx = compact ? w * 0.1 : w * 0.16;
    const ty = h * (0.1 + (0.8 * i) / (n - 1));
    const jx = Math.sin(time * (0.6 + rand(i) * 0.8) + i * 2.1) * jitterAmp;
    const jy = Math.cos(time * (0.5 + rand(i + 40) * 0.9) + i * 1.7) * jitterAmp;
    return { label, x: lerp(sx, tx, unify) + jx, y: lerp(sy, ty, unify) + jy };
  });

  // Act 1: the N x M mess
  const chaosAlpha = (1 - unify) * 0.9;
  if (chaosAlpha > 0.01) {
    ctx.lineWidth = 1;
    const links = compact ? 2 : 3;
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < links; k++) {
        const c = consumers[Math.floor(rand(i * 13 + k * 5) * consumers.length)];
        const broken = rand(i * 31 + k) > 0.82;
        ctx.strokeStyle = broken
          ? `rgba(255, 84, 112, ${0.34 * chaosAlpha})`
          : `rgba(255, 255, 255, ${0.13 * chaosAlpha})`;
        const node = nodes[i];
        const mx = (node.x + c.x) / 2 + (rand(i * 3 + k) - 0.5) * w * 0.3;
        const my = (node.y + c.y) / 2 + (rand(i * 5 + k) - 0.5) * h * 0.5;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.quadraticCurveTo(mx, my, c.x, c.y);
        ctx.stroke();
      }
    }
    // Ghost consumer dots in the chaos
    for (const c of consumers) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 * chaosAlpha})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Act 2: the Integrius layer
  const barX = w * 0.5;
  const barW = compact ? 8 : 12;
  const fullBarH = h * 0.72;
  const barH = fullBarH * layer;
  const barTop = h * 0.5 - barH / 2;
  if (layer > 0.01) {
    const grad = ctx.createLinearGradient(0, barTop, 0, barTop + barH);
    grad.addColorStop(0, CYAN);
    grad.addColorStop(1, BLUE);
    ctx.save();
    ctx.shadowColor = 'rgba(0,184,212,0.55)';
    ctx.shadowBlur = 24 * layer;
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, barX - barW / 2, barTop, barW, Math.max(barH, 1), barW / 2);
    ctx.fill();
    ctx.restore();

    // Source -> layer connections, with flowing particles
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      const a = smooth(0.36 + (i / n) * 0.12, 0.62 + (i / n) * 0.12, p);
      if (a <= 0.01) continue;
      const ty = clamp01((node.y - barTop) / Math.max(barH, 1)) * barH + barTop;
      ctx.strokeStyle = `rgba(0,184,212,${0.32 * a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.bezierCurveTo(lerp(node.x, barX, 0.55), node.y, lerp(node.x, barX, 0.6), ty, barX, ty);
      ctx.stroke();
      if (!reduced && a > 0.5) {
        const ft = (time * 0.35 + rand(i * 9) ) % 1;
        const px = lerp(node.x, barX, ft);
        const py = lerp(node.y, ty, smooth(0, 1, ft));
        ctx.fillStyle = `rgba(0,184,212,${0.8 * a})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Act 3: data products fan out
  if (serve > 0.01) {
    ctx.font = `${compact ? 9 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    for (let i = 0; i < ENDPOINTS.length; i++) {
      const c = consumers[i];
      const a = smooth(0.58 + i * 0.04, 0.74 + i * 0.04, p);
      if (a <= 0.01) continue;
      const sy = barTop + (barH * (i + 0.5)) / ENDPOINTS.length;
      ctx.strokeStyle = `rgba(0,145,234,${0.5 * a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(barX, sy);
      const endX = lerp(barX, c.x, a);
      const endY = lerp(sy, c.y, a);
      ctx.bezierCurveTo(lerp(barX, endX, 0.5), sy, lerp(barX, endX, 0.55), endY, endX, endY);
      ctx.stroke();

      if (a > 0.85) {
        const label = ENDPOINTS[i];
        const tw = ctx.measureText(label).width;
        const padX = 10;
        const chipW = tw + padX * 2;
        const chipH = 24;
        const cx = compact ? Math.min(c.x, w - chipW - 6) : c.x;
        const chipAlpha = smooth(0.85, 1, a);
        ctx.fillStyle = `rgba(0,184,212,${0.1 * chipAlpha})`;
        ctx.strokeStyle = `rgba(0,184,212,${0.45 * chipAlpha})`;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, cx - padX, c.y - chipH / 2, chipW, chipH, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(230,250,253,${0.95 * chipAlpha})`;
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, c.y);
      }
    }
  }

  // Act 4: governance pulses along the layer
  if (govern > 0.01 && barH > 10) {
    const pulses = 3;
    for (let i = 0; i < pulses; i++) {
      const ft = reduced ? (i + 0.5) / pulses : (time * 0.18 + i / pulses) % 1;
      const py = barTop + barH * ft;
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 14 * govern;
      ctx.fillStyle = `rgba(255,255,255,${0.9 * govern})`;
      drawRoundedRect(ctx, barX - barW / 2 - 3, py - 3, barW + 6, 6, 3);
      ctx.fill();
      ctx.restore();
    }
    // Chain ticks beside the bar
    ctx.font = `${compact ? 8 : 10}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = `rgba(0,184,212,${0.6 * govern})`;
    const ticks = compact ? 4 : 6;
    for (let i = 0; i < ticks; i++) {
      const ty = barTop + (barH * (i + 0.5)) / ticks;
      ctx.fillText(`#${(2847 + i * 13).toString(16)} ✓`, barX + barW + 14, ty);
    }
  }

  // Source nodes + labels (always on top)
  ctx.font = `${compact ? 8 : 10.5}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    const glow = unify * 0.5 + 0.2;
    ctx.fillStyle = `rgba(0,184,212,${0.55 + glow * 0.45})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, compact ? 2.4 : 3.2, 0, Math.PI * 2);
    ctx.fill();
    if (!compact || unify > 0.6) {
      ctx.fillStyle = `rgba(255,255,255,${0.38 + unify * 0.3})`;
      ctx.textAlign = unify > 0.5 ? 'right' : 'left';
      const dx = unify > 0.5 ? -9 : 9;
      ctx.fillText(node.label, node.x + dx, node.y);
      ctx.textAlign = 'left';
    }
  }
}

const ACTS: { range: [number, number]; title: string; body: string; align: 'left' | 'right' | 'center' }[] = [
  {
    range: [0.0, 0.28],
    align: 'left',
    title: 'Sixteen systems. No shared story.',
    body: 'Every team wires its own pipelines. N sources times M consumers: fragile, ungoverned, and one schema change away from breaking.',
  },
  {
    range: [0.31, 0.56],
    align: 'left',
    title: 'Connect once.',
    body: 'Every source plugs into one governed layer. The tangle collapses from N x M integrations to N + M connections.',
  },
  {
    range: [0.59, 0.82],
    align: 'right',
    title: 'Use everywhere.',
    body: 'One stable API per business concept. Versioned contracts, entity-keyed joins across sources, served at sub-50ms from materialized snapshots.',
  },
  {
    range: [0.85, 1.0],
    align: 'center',
    title: 'Know everything.',
    body: 'Every read, change, and approval is chained into a tamper-evident audit log. Walkable proof for regulators, built in from the first record.',
  },
];

function captionStyle(p: number, range: [number, number]): { opacity: number; y: number } {
  const [a, b] = range;
  const fade = 0.05;
  const opacity = Math.min(smooth(a, a + fade, p), 1 - smooth(b - fade, b, p));
  const y = (1 - smooth(a, a + fade, p)) * 24;
  return { opacity, y };
}

const ALIGN_CLASS: Record<'left' | 'right' | 'center', string> = {
  left: 'left-6 md:left-16 items-start text-left',
  right: 'right-6 md:right-16 items-end text-right',
  center: 'left-1/2 -translate-x-1/2 items-center text-center',
};

export function UnificationStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      const p = scrollYProgress.get();
      paint(ctx, width, height, p, performance.now() / 1000, reduced);
      // Captions are driven from the same loop so they can never drift from the canvas
      ACTS.forEach((act, i) => {
        const el = captionRefs.current[i];
        if (!el) return;
        const { opacity, y } = captionStyle(p, act.range);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = act.align === 'center'
          ? `translate(-50%, ${y.toFixed(1)}px)`
          : `translateY(${y.toFixed(1)}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [scrollYProgress]);

  return (
    <section id="story" ref={containerRef} className="relative h-[400vh]" aria-label="How Integrius unifies your data">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {ACTS.map((act, i) => (
          <div
            key={act.title}
            ref={(el) => { captionRefs.current[i] = el; }}
            style={{ opacity: 0 }}
            className={`absolute bottom-14 md:bottom-20 flex flex-col gap-3 max-w-md md:max-w-lg pointer-events-none ${ALIGN_CLASS[act.align]}`}
          >
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">{act.title}</h3>
            <p className="text-sm md:text-lg text-white/60 leading-relaxed">{act.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
