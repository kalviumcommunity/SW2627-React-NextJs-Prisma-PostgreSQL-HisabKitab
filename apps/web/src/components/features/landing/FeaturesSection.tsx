'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

// Wheel delta threshold to trigger the next card
const WHEEL_THRESHOLD = 250;

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [revealedCount, setRevealedCount] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const wheelAccumulator = useRef(0);


  // Detect when section enters viewport and lock scroll
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      if (isLocked || isComplete) return;

      const rect = section.getBoundingClientRect();
      // Lock when the section's top edge is within the viewport
      if (rect.top <= window.innerHeight * 0.5 && rect.bottom > 0) {
        setIsLocked(true);
        // Snap section to the top of the viewport
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLocked, isComplete]);

  // Lock body scroll and hijack wheel when locked
  useEffect(() => {
    if (!isLocked) return;

    // Prevent all native scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    let cooldown = false;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore all input during cooldown — one card per scroll gesture
      if (cooldown) return;

      const delta = e.deltaY;
      wheelAccumulator.current += delta;

      // Scroll down — reveal next card
      if (delta > 0 && wheelAccumulator.current >= WHEEL_THRESHOLD) {
        wheelAccumulator.current = 0;
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 400);

        setRevealedCount((prev) => {
          const next = prev + 1;
          if (next >= FEATURES.length) {
            setIsLocked(false);
            setIsComplete(true);
            return FEATURES.length;
          }
          return next;
        });
      }
      // Scroll up — hide cards
      else if (delta < 0 && wheelAccumulator.current <= -WHEEL_THRESHOLD) {
        wheelAccumulator.current = 0;
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 400);

        setRevealedCount((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setIsComplete(false);
            return 1;
          }
          return prev - 1;
        });
      }
    };

    // Prevent touch scrolling on mobile
    const onTouchMove = (e: TouchEvent) => {
      if (isLocked) e.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
      window.removeEventListener('touchmove', onTouchMove);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isLocked]);

  // Reset when user scrolls back above the section
  useEffect(() => {
    if (!isComplete) return;
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.8) {
        setIsComplete(false);
        setRevealedCount(1);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isComplete]);

  return (
    <section
      ref={sectionRef}
      id="features"
      style={{
        position: 'relative',
        backgroundColor: '#F9F6EE',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
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
          <AnimatePresence>
            {FEATURES.map((feature, i) => {
              if (i >= revealedCount) return null;
              return (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  index={i}
                  total={FEATURES.length}
                  stackPosition={revealedCount - 1 - i}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '40px',
          }}
        >
          {FEATURES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i < revealedCount ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i < revealedCount ? '#1a1a1a' : '#d1d1d1',
                transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  total,
  stackPosition,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  total: number;
  stackPosition: number;
}) {
  // stackPosition: 0 = top (just arrived), 1 = one behind, 2 = further back
  const yShift = stackPosition * 20;

  // Alternating tilt: even cards tilt down-left/up-right, odd cards the opposite
  const tilt = index % 2 === 0 ? 2 : -2;
  // Entry tilt is more exaggerated, settles to subtle
  const entryTilt = index % 2 === 0 ? 6 : -6;

  return (
    <motion.div
      initial={{ y: '120%', opacity: 1, rotate: entryTilt }}
      animate={{
        y: -yShift,
        opacity: 1,
        rotate: tilt,
      }}
      exit={{ y: '120%', opacity: 1, rotate: entryTilt }}
      transition={{
        type: 'spring',
        stiffness: 90,
        damping: 22,
        mass: 1.8,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        transformOrigin: 'bottom center',
        zIndex: total - stackPosition,
        willChange: 'transform',
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
