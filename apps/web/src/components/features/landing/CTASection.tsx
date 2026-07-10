'use client';

import { useEffect, useRef, useState } from 'react';

export default function CTASection() {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '40px 24px 100px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2520 50%, #1a1a1a 100%)',
          padding: 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 64px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
          transition:
            'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Subtle grain overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            pointerEvents: 'none',
          }}
        />

        {/* Radial glow accent */}
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: '50%',
            height: '80%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200, 194, 162, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Pre-heading */}
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(200, 194, 162, 0.85)',
              marginBottom: '20px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
            }}
          >
            Get started today
          </p>

          {/* Main Heading */}
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 600,
              color: '#f5f0e6',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '18px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s',
            }}
          >
            Ready to digitize<br />your khata?
          </h2>

          {/* Sub-text */}
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '440px',
              margin: '0 auto 36px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s',
            }}
          >
            Join shopkeepers who have switched from paper to Hisab Kitab.
            Free to start, no credit card required.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s',
            }}
          >
            <a
              href="/register"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textDecoration: 'none',
                padding: '14px 32px',
                borderRadius: '100px',
                background: '#f5f0e6',
                boxShadow: '0 2px 16px rgba(245, 240, 230, 0.15)',
                transition:
                  'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 240, 230, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(245, 240, 230, 0.15)';
              }}
            >
              Get started free
            </a>
            <a
              href="#demo"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(245, 240, 230, 0.8)',
                textDecoration: 'none',
                padding: '14px 32px',
                borderRadius: '100px',
                border: '1px solid rgba(245, 240, 230, 0.2)',
                transition:
                  'border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.4)';
                e.currentTarget.style.color = '#f5f0e6';
                e.currentTarget.style.backgroundColor = 'rgba(245, 240, 230, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 240, 230, 0.2)';
                e.currentTarget.style.color = 'rgba(245, 240, 230, 0.8)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              See a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
