'use client';

import { useState, useEffect, useMemo } from 'react';

interface PaperIntroProps {
  /** Animation progress 0-1 from the scroll engine */
  progress: number;
}

/**
 * An engaging intro overlay on the blank paper.
 * Shows a handwritten-feel tagline with typewriter animation,
 * a call to scroll, and a quill/pen decorative element.
 * Fades out as the ink animation begins (~8% progress).
 */
export default function PaperIntro({ progress }: PaperIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  // Stagger the text reveals after mount
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 300);
    const t2 = setTimeout(() => setShowLine2(true), 1200);
    const t3 = setTimeout(() => setShowLine3(true), 2200);
    const t4 = setTimeout(() => setShowScroll(true), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Fade out as scrolling begins
  const opacity = useMemo(() => {
    if (progress < 0.02) return 1;
    return Math.max(0, 1 - progress / 0.12);
  }, [progress]);

  if (opacity <= 0) return null;

  return (
    <div
      className="fixed inset-0 z-35 pointer-events-none flex items-center justify-center"
      style={{ opacity }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
          maxWidth: '600px',
          padding: '0 24px',
        }}
      >
        {/* ─── Decorative quill icon ─── */}
        <div
          style={{
            marginBottom: '28px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.9)',
            transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            stroke="#5a4a3a"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.5 }}
          >
            {/* Simple pen/quill */}
            <path d="M28 4L8 24l-2 8 8-2L34 10c0 0-2-4-6-6z" />
            <line x1="22" y1="10" x2="28" y2="16" />
            <path d="M6 32l2-8" />
          </svg>
        </div>

        {/* ─── Line 1 — the hook ─── */}
        <p
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            fontWeight: 600,
            color: '#3a3225',
            textAlign: 'center',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
            marginBottom: '8px',
          }}
        >
          Your paper khata served you well.
        </p>

        {/* ─── Line 2 — the pivot ─── */}
        <p
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            fontWeight: 600,
            color: '#3a3225',
            textAlign: 'center',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            opacity: showLine2 ? 1 : 0,
            transform: showLine2 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
            marginBottom: '16px',
          }}
        >
          It&apos;s time for an upgrade.
        </p>

        {/* ─── Subtle divider ─── */}
        <div
          style={{
            width: '48px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #5a4a3a44, transparent)',
            marginBottom: '16px',
            opacity: showLine3 ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* ─── Line 3 — the invitation ─── */}
        <p
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: 'clamp(13px, 1.2vw, 16px)',
            fontWeight: 400,
            color: '#6b5e4f',
            textAlign: 'center',
            lineHeight: 1.7,
            opacity: showLine3 ? 1 : 0,
            transform: showLine3 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
            maxWidth: '380px',
            marginBottom: '40px',
          }}
        >
          Watch ink meet innovation — scroll down to see your
          new digital ledger come alive.
        </p>

        {/* ─── Scroll prompt ─── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            opacity: showScroll ? 1 : 0,
            transform: showScroll ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#8a7d6b',
            }}
          >
            Scroll to begin
          </span>

          {/* Animated scroll arrow */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              animation: 'scrollBounce 2s ease-in-out infinite',
            }}
          >
            <svg
              width="20"
              height="28"
              viewBox="0 0 20 28"
              fill="none"
              stroke="#8a7d6b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Mouse outline */}
              <rect x="3" y="1" width="14" height="22" rx="7" />
              {/* Scroll wheel dot — animated via CSS */}
              <line
                x1="10" y1="7" x2="10" y2="11"
                style={{
                  animation: 'scrollWheel 2s ease-in-out infinite',
                }}
              />
            </svg>
            {/* Chevron arrows */}
            <svg
              width="16" height="12"
              viewBox="0 0 16 12"
              fill="none"
              stroke="#8a7d6b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.5 }}
            >
              <polyline points="2 2 8 8 14 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Keyframes for scroll indicators */}
      <style jsx>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes scrollWheel {
          0% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.3; transform: translateY(3px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
