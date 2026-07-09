'use client';

import { useEffect, useRef, useState } from 'react';

const VALUE_PROPS = [
  {
    accent: '#C84B31',
    title: 'Replace Paper, Keep Simplicity',
    description:
      'Digital doesn\'t mean complicated. Same "who owes what" logic you already know — now with real-time sync across devices, full history, and zero paper waste.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h14l6 6v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <polyline points="20 4 20 10 26 10" />
        <line x1="10" y1="16" x2="22" y2="16" />
        <line x1="10" y1="21" x2="18" y2="21" />
      </svg>
    ),
  },
  {
    accent: '#10B981',
    title: 'Built for Indian Shopkeepers',
    description:
      'Hindi/English toggle, ₹ currency, contact-based ledger model matching how khata works in real life. PWA that works even on patchy networks.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="12" />
        <line x1="4" y1="16" x2="28" y2="16" />
        <path d="M16 4c3.5 3 5.5 7.5 5.5 12s-2 9-5.5 12c-3.5-3-5.5-7.5-5.5-12s2-9 5.5-12z" />
      </svg>
    ),
  },
  {
    accent: '#D4AF37',
    title: 'Your Data, Fully Traceable',
    description:
      'Every edit, every delete is logged with who, when, and what changed. Resolve disputes with confidence. 7-day trash/restore so nothing is ever truly lost.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4L4 10v12l12 6 12-6V10L16 4z" />
        <line x1="4" y1="10" x2="16" y2="16" />
        <line x1="28" y1="10" x2="16" y2="16" />
        <line x1="16" y1="16" x2="16" y2="28" />
      </svg>
    ),
  },
  {
    accent: '#6366F1',
    title: 'Scale Without Worry',
    description:
      'Cursor-based pagination stays fast at any depth. Cached rollups keep dashboards instant even with thousands of transactions. Multi-shop from day one.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 24 14 16 20 20 26 10" />
        <polyline points="22 10 26 10 26 14" />
        <rect x="4" y="4" width="24" height="24" rx="2" />
      </svg>
    ),
  },
];

export default function WhyHisabKitabSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-us"
      style={{
        padding: '100px 24px 80px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Section Heading */}
        <div
          style={{
            marginBottom: '64px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transition:
              'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#888',
              marginBottom: '14px',
            }}
          >
            Why Hisab Kitab
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 600,
              color: '#1a1a1a',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '18px',
            }}
          >
            Built for the way<br />shopkeepers actually work
          </h2>
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6b6b6b',
              maxWidth: '480px',
            }}
          >
            We didn&apos;t just digitize a ledger — we rebuilt bookkeeping around
            the realities of running a shop in India.
          </p>
        </div>

        {/* Value Prop Grid — 2×2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }}
          className="value-grid"
        >
          {VALUE_PROPS.map((prop, i) => (
            <ValueCard key={prop.title} prop={prop} visible={visible} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .value-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function ValueCard({
  prop,
  visible,
  delay,
}: {
  prop: (typeof VALUE_PROPS)[number];
  visible: boolean;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease`,
        padding: '36px 32px',
        borderRadius: '24px',
        border: '1px solid rgba(28, 25, 23, 0.06)',
        background: '#FFFFFF',
        boxShadow: hovered
          ? '0 20px 40px -15px rgba(28, 25, 23, 0.12), 0 0 0 1px rgba(28, 25, 23, 0.02)'
          : '0 4px 20px -10px rgba(28, 25, 23, 0.06)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        ...(hovered ? { transform: 'translateY(-4px)' } : {}),
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: hovered ? '6px' : '4px',
          height: '100%',
          background: prop.accent,
          opacity: hovered ? 1 : 0.6,
          transition: 'all 0.3s ease',
          borderRadius: '0 3px 3px 0',
        }}
      />

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: `${prop.accent}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: prop.accent,
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {prop.icon}
        </div>

        <div>
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '10px',
              letterSpacing: '-0.01em',
            }}
          >
            {prop.title}
          </h3>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#4A4A4A',
            }}
          >
            {prop.description}
          </p>
        </div>
      </div>
    </div>
  );
}
