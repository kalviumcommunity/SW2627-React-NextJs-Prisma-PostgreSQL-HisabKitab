'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const FEATURES = [
  {
    image: '/images/feature_ledger.png',
    title: 'Real-Time Ledger',
    color: '#10B981',
    description:
      'Add a transaction and see the running balance update live — across every device, every screen. Powered by SSE, no page refresh ever needed.',
    role: 'Live Financial Tracking',
    services: ['Real-Time Balance', 'SSE Sync', 'Multi-Device', 'Instant Updates'],
  },
  {
    image: '/images/feature_roles.png',
    title: 'Multi-User & Roles',
    color: '#6366F1',
    description:
      'Owner and Staff roles with configurable permissions. Your staff can add transactions — only you can delete them. Know who changed what, when.',
    role: 'Access Management',
    services: ['Owner / Staff Roles', 'Permission Control', 'Activity Logs', 'Secure Access'],
  },
  {
    image: '/images/feature_audit.png',
    title: 'Smart Audit Trail',
    color: '#C84B31',
    description:
      'Every edit and delete is tracked — who changed it, when, and both old and new values. Soft deletes mean nothing is ever truly lost.',
    role: 'Complete Accountability',
    services: ['Change History', 'Soft Deletes', '7-Day Restore', 'Full Transparency'],
  },
  {
    image: '/images/feature_worker.png',
    title: 'Worker & Salary',
    color: '#8B5CF6',
    description:
      'Track attendance (present / absent / half-day), calculate pending salary for monthly or daily-wage workers, and record payments.',
    role: 'Workforce Management',
    services: ['Attendance Tracking', 'Salary Calculation', 'Payment Records', 'Wage Modes'],
  },
  {
    image: '/images/feature_inventory.png',
    title: 'Inventory & Expiry',
    color: '#D4AF37',
    description:
      'Products, batches, stock movements with automated expiry alerts. Owner-approval workflow for adjustments and losses.',
    role: 'Stock Control',
    services: ['Batch Tracking', 'Expiry Alerts', 'Stock Movements', 'Approval Workflow'],
  },
  {
    image: '/images/feature_ai.png',
    title: 'AI Paper Migration',
    color: '#14B8A6',
    description:
      'Photograph your old paper khata — AI extracts names and balances. Review everything before committing. Export as CSV anytime.',
    role: 'Intelligent Digitization',
    services: ['Photo Capture', 'AI Extraction', 'Review & Edit', 'CSV Export'],
  },
];

export default function FeaturesSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress: progress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section
      ref={containerRef}
      id="features"
      style={{
        height: `${FEATURES.length * 80}vh`,
        position: 'relative',
        backgroundColor: '#F9F6EE',
      }}
    >
      <div 
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Section Heading - Static while scrolling */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '60px',
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
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 600,
              color: '#1a1a1a',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '24px',
            }}
          >
            What We Offer
          </h2>
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#6b6b6b',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            A complete digital ledger with real-time sync, worker management,
            inventory tracking, and AI-powered migration.
          </p>
        </div>

        {/* Cards Stack */}
        <div style={{ position: 'relative', width: '100%', height: '450px' }}>
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={i}
              total={FEATURES.length}
              progress={progress}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  total,
  progress,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const rangeStart = (index - 1) / total;
  const rangeEnd = index / total;

  // Make sure input ranges are strictly increasing and bounded within [0, 1]
  const yInput = index === 0 ? [0, 1] : [rangeStart, rangeEnd];
  const yOutput = index === 0 ? ['0vh', '0vh'] : ['100vh', '0vh'];
  const y = useTransform(progress, yInput, yOutput);

  // Each card scales down slightly after it arrives
  const minScale = 1 - (total - 1 - index) * 0.04;
  const scaleInput = rangeEnd >= 1 ? [0, 1] : [rangeEnd, 1];
  const scaleOutput = rangeEnd >= 1 ? [1, 1] : [1, minScale];
  const scale = useTransform(progress, scaleInput, scaleOutput);

  // Cards slide in with a tilt from the start, alternating directions
  const initialTilt = index % 2 === 0 ? -4 : 4;
  const settledTilt = index % 2 === 0 ? -2 : 2;
  
  // Rotate during the slide-in phase so it starts with a larger tilt and settles
  const rotateInput = index === 0 ? [0, 1] : [rangeStart, rangeEnd];
  const rotateOutput = index === 0 ? [settledTilt, settledTilt] : [initialTilt, settledTilt];
  const rotate = useTransform(progress, rotateInput, rotateOutput);

  // Small fade-in for the cards (except the first one which is always visible)
  const opacityInput = index === 0 ? [0, 1] : [rangeStart, rangeStart + 0.01];
  const opacityOutput = index === 0 ? [1, 1] : [0, 1];
  const opacity = useTransform(progress, opacityInput, opacityOutput);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: `${index * 15}px`, // Slight staggering top gap
        left: 0,
        right: 0,
        y,
        scale,
        rotate,
        opacity,
        transformOrigin: 'top center',
        zIndex: index + 1,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRadius: '28px',
          padding: '56px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 0.8fr',
          gap: '48px',
          alignItems: 'center',
          minHeight: '380px',
          boxShadow: '0 -16px 48px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        className="feature-card-inner"
      >
        {/* Column 1 — Index + Title + Description */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#888888',
              marginBottom: '28px',
              fontFamily: 'var(--font-inter), monospace',
              letterSpacing: '0.12em',
              fontWeight: 500,
            }}
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>

          <h3
            style={{
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {feature.title}
          </h3>

          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#bbbbbb',
              maxWidth: '95%',
            }}
          >
            {feature.description}
          </p>

          <div
            style={{
              height: '2px',
              width: '36px',
              backgroundColor: feature.color,
              marginTop: '32px',
              opacity: 0.85,
            }}
          />
        </div>

        {/* Column 2 — Image */}
        <div
          style={{
            position: 'relative',
            height: '280px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}
        >
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Column 3 — Role & Services */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#888888',
                marginBottom: '8px',
              }}
            >
              Role
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#eeeeee',
                lineHeight: 1.4,
              }}
            >
              {feature.role}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#888888',
                marginBottom: '12px',
              }}
            >
              Services
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {feature.services.map((s) => (
                <li
                  key={s}
                  style={{
                    fontSize: '14px',
                    color: '#bbbbbb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: feature.color,
                      flexShrink: 0,
                      opacity: 0.7,
                    }}
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .feature-card-inner {
            grid-template-columns: 1fr !important;
            padding: 40px 28px !important;
            gap: 32px !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
