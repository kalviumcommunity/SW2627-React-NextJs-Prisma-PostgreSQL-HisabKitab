'use client';

import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Shop',
    description:
      'Register in seconds, name your shop, and invite staff. One account can manage multiple shops — switch between them with a tap.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="14" width="28" height="18" rx="2" />
        <polyline points="4 14 18 4 32 14" />
        <line x1="14" y1="32" x2="14" y2="22" />
        <line x1="22" y1="32" x2="22" y2="22" />
        <line x1="14" y1="22" x2="22" y2="22" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Record Transactions',
    description:
      '"You Gave" or "You Got" — that\'s it. The running balance updates everywhere, instantly. Attach receipts, set due dates, add notes — all in one screen.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="24" height="28" rx="2" />
        <line x1="12" y1="12" x2="24" y2="12" />
        <line x1="12" y1="17" x2="20" y2="17" />
        <line x1="12" y1="22" x2="22" y2="22" />
        <polyline points="15 27 17 29 22 24" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Grow with Confidence',
    description:
      'Analytics dashboard for daily and monthly earnings. PDF exports, shareable ledger links, due-date reminders — everything you need to grow.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="30" height="24" rx="2" />
        <polyline points="8 26 14 18 20 22 28 12" />
        <circle cx="28" cy="12" r="2" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
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
      id="how-it-works"
      style={{
        padding: '100px 24px 80px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Section Heading */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '72px',
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
            How it works
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(30px, 4vw, 48px)',
              fontWeight: 600,
              color: '#1a1a1a',
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
              marginBottom: '18px',
            }}
          >
            Three steps to a<br />digital khata
          </h2>
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6b6b6b',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            No complicated setup. No training needed. If you can maintain a paper
            khata, you can use Hisab Kitab.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
            position: 'relative',
          }}
          className="steps-grid"
        >
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              top: '40px',
              left: '16.67%',
              right: '16.67%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), rgba(0,0,0,0.1), transparent)',
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease 0.4s',
            }}
          />

          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} visible={visible} delay={i * 120} />
          ))}
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </section>
  );
}

function StepCard({
  step,
  visible,
  delay,
}: {
  step: (typeof STEPS)[number];
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
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        textAlign: 'center',
        padding: '32px 20px',
        borderRadius: '20px',
        background: hovered ? 'rgba(0,0,0,0.02)' : 'transparent',
        cursor: 'default',
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: hovered
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
            : 'rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: hovered ? '#f5f0e6' : '#3a3a3a',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {step.icon}
      </div>

      {/* Step Number */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: hovered ? '#1a1a1a' : '#aaa',
          transition: 'color 0.3s ease',
          display: 'block',
          marginBottom: '10px',
        }}
      >
        Step {step.number}
      </span>

      {/* Title */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.65,
          color: '#777',
          transition: 'color 0.3s ease',
          ...(hovered ? { color: '#555' } : {}),
        }}
      >
        {step.description}
      </p>
    </div>
  );
}
