'use client';

import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="13" />
        <path d="M18 10v8l5 3" />
        <circle cx="18" cy="18" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: 'Real-Time Ledger',
    description:
      'Add a transaction and see the running balance update live — across every device, every screen. Powered by SSE, no page refresh ever needed.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="13" r="4.5" />
        <path d="M5 30c0-5 4-9 9-9s9 4 9 9" />
        <circle cx="25" cy="12" r="3" />
        <path d="M27 20c2.5 0 4.5 2 4.5 4.5V27" />
      </svg>
    ),
    title: 'Multi-User & Roles',
    description:
      'Owner and Staff roles with configurable permissions. Your staff can add transactions — only you can delete them. Know who changed what, when.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4L4 10v12l12 6 12-6V10L16 4z" />
        <line x1="4" y1="10" x2="16" y2="16" />
        <line x1="28" y1="10" x2="16" y2="16" />
        <line x1="16" y1="16" x2="16" y2="28" />
        <polyline points="10 7 16 10 22 7" />
      </svg>
    ),
    title: 'Smart Audit Trail',
    description:
      'Every edit and delete is tracked — who changed it, when, and both old and new values. Soft deletes mean nothing is ever truly lost. 7-day trash/restore.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="28" height="24" rx="2" />
        <line x1="4" y1="12" x2="32" y2="12" />
        <circle cx="10" cy="20" r="2" />
        <line x1="16" y1="19" x2="26" y2="19" />
        <line x1="16" y1="23" x2="22" y2="23" />
      </svg>
    ),
    title: 'Worker & Salary',
    description:
      'Track attendance (present / absent / half-day), calculate pending salary for monthly or daily-wage workers, and record payments — all auditable.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="24" height="22" rx="2" />
        <line x1="6" y1="14" x2="30" y2="14" />
        <line x1="12" y1="8" x2="12" y2="4" />
        <line x1="24" y1="8" x2="24" y2="4" />
        <path d="M14 22l2.5 2.5L21 19" />
      </svg>
    ),
    title: 'Inventory & Expiry',
    description:
      'Products, batches, stock movements with automated expiry alerts. Owner-approval workflow for adjustments and losses. Full stock visibility.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="18" height="24" rx="2" />
        <polyline points="24 10 30 10 30 32 12 32 12 28" />
        <circle cx="15" cy="16" r="4" />
        <path d="M11 23c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      </svg>
    ),
    title: 'AI Paper Migration',
    description:
      'Photograph your old paper khata — AI extracts names and balances. Review everything before committing. Export as CSV even without saving to the app.',
  },
];

export default function FeaturesSection() {
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
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      style={{
        padding: '80px 24px 100px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Section Heading — editorial, asymmetric */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '72px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
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
            Features
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
            Everything your shop needs.<br />
            Nothing it doesn&apos;t.
          </h2>
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#6b6b6b',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            A complete digital ledger with real-time sync, worker management,
            inventory tracking, and AI-powered migration — purpose-built for
            Indian shopkeepers.
          </p>
        </div>

        {/* Feature Cards — 3×2 grid, staggered reveals */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
          className="features-grid"
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              visible={visible}
              delay={i * 80}
            />
          ))}
        </div>
      </div>

      {/* Responsive: 2-col on tablet, 1-col on mobile */}
      <style jsx>{`
        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function FeatureCard({
  feature,
  visible,
  delay,
}: {
  feature: (typeof FEATURES)[number];
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
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        cursor: 'default',
        padding: '28px 24px',
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.04)',
        background: hovered ? 'rgba(0,0,0,0.025)' : 'rgba(0,0,0,0.01)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: hovered ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hovered ? '#1a1a1a' : '#666',
          marginBottom: '18px',
          transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '13.5px',
          lineHeight: 1.7,
          color: '#888',
          transition: 'color 0.3s ease',
          ...(hovered ? { color: '#666' } : {}),
        }}
      >
        {feature.description}
      </p>
    </div>
  );
}
