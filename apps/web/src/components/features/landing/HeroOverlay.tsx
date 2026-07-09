'use client';

import { useMemo } from 'react';

interface HeroOverlayProps {
  /** Animation progress 0-1 */
  progress: number;
  /** Whether the animation has completed and zoom/release happened */
  animationComplete: boolean;
}

export default function HeroOverlay({ progress, animationComplete }: HeroOverlayProps) {
  // Text appears when ink is dark enough for contrast (~55% progress)
  const show = progress > 0.55;

  // Staggered fade values — 30-50ms feel between elements (mapped to progress %)
  const fade = useMemo(() => {
    if (!show) return { title: 0, subtitle: 0, tagline: 0, cta: 0 };
    const p = Math.min(1, (progress - 0.55) / 0.2);
    return {
      title: Math.min(1, p / 0.25),
      subtitle: Math.min(1, Math.max(0, (p - 0.2) / 0.25)),
      tagline: Math.min(1, Math.max(0, (p - 0.4) / 0.25)),
      cta: Math.min(1, Math.max(0, (p - 0.6) / 0.25)),
    };
  }, [show, progress]);

  return (
    <div
      className={`${animationComplete ? 'absolute' : 'fixed'} inset-0 z-40 pointer-events-none flex items-center`}
      style={{ opacity: show ? 1 : 0 }}
    >
      <div className="w-[45%] flex flex-col" style={{ gap: '1.2rem', marginLeft: '12%', paddingLeft: '22px', marginBottom: "60px" }}>
        {/* Title — editorial serif, confident sizing */}
        <h1
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(44px, 5vw, 76px)',
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            color: '#fff',
            opacity: fade.title,
            transform: `translateY(${(1 - fade.title) * 14}px)`,
            textWrap: 'balance' as unknown as string,
          }}
        >
          Hisab Kitab
        </h1>

        {/* Subtitle — quiet, spaced, caps */}
        <p
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: 'clamp(11px, 1vw, 14px)',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.55)',
            opacity: fade.subtitle,
            transform: `translateY(${(1 - fade.subtitle) * 10}px)`,
          }}
        >
          Digital Ledger App
        </p>

        {/* Tagline — warm, human, conversational */}
        <p
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: 'clamp(14px, 1.05vw, 17px)',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.72)',
            opacity: fade.tagline,
            transform: `translateY(${(1 - fade.tagline) * 10}px)`,
            maxWidth: '340px',
          }}
        >
          Simplify your finances.
          <br />
          Track. Manage. Grow.
        </p>

        {/* CTA — pill, cream on dark ink, hover lifts subtly */}
        <div
          style={{
            opacity: fade.cta,
            transform: `translateY(${(1 - fade.cta) * 10}px)`,
            marginTop: '0.6rem',
          }}
        >
          <button
            className="pointer-events-auto"
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              padding: '14px 32px',
              borderRadius: '100px',
              border: 'none',
              background: '#f5f0e6',
              color: '#1a1a1a',
              cursor: 'pointer',
              boxShadow: '0 2px 20px rgba(0,0,0,0.12)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.12)';
            }}
          >
            Start free trial
          </button>
        </div>
      </div>
    </div>
  );
}
