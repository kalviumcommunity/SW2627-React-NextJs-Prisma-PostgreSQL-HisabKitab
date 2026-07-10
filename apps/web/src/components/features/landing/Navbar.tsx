'use client';

import { useState, useEffect, useCallback } from 'react';

interface NavbarProps {
  visible: boolean;
}

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Why Us', href: '#why-us' },
];

export default function Navbar({ visible }: NavbarProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll for glass intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const glassBackground = scrolled
    ? 'rgba(255, 255, 255, 0.85)'
    : 'rgba(255, 255, 255, 0.65)';

  const glassBorder = scrolled
    ? 'rgba(28, 25, 23, 0.12)'
    : 'rgba(28, 25, 23, 0.08)';

  const glassShadow = scrolled
    ? '0 10px 30px -10px rgba(28, 25, 23, 0.12), 0 1px 3px rgba(28, 25, 23, 0.05)'
    : '0 4px 20px -5px rgba(28, 25, 23, 0.05)';

  return (
    <>
      {/* ─── Desktop & Mobile Navbar ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: visible ? 'auto' : 'none',
          padding: '14px 24px',
        }}
      >
        <div
          className="navbar-glass"
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 8px 12px 24px',
            borderRadius: '100px',
            background: glassBackground,
            border: `1px solid ${glassBorder}`,
            boxShadow: glassShadow,
            transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          {/* ─── Logo ─── */}
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {/* Monogram Mark */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#f5f0e6',
                fontFamily: 'var(--font-playfair), Georgia, serif',
                letterSpacing: '-0.02em',
              }}
            >
              HK
            </div>
            <span
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '17px',
                fontWeight: 600,
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
                transition: 'opacity 0.2s ease',
              }}
            >
              Hisab Kitab
            </span>
          </a>

          {/* ─── Desktop Nav Links ─── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: hoveredLink === link.label ? '#1a1a1a' : '#5a5a5a',
                  textDecoration: 'none',
                  transition: 'color 0.25s ease, background-color 0.25s ease',
                  letterSpacing: '0.005em',
                  padding: '7px 14px',
                  borderRadius: '100px',
                  backgroundColor: hoveredLink === link.label ? 'rgba(0,0,0,0.04)' : 'transparent',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ─── Desktop CTAs ─── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            className="hidden md:flex"
          >
            <a
              href="/login"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#3a3a3a',
                textDecoration: 'none',
                padding: '8px 18px',
                borderRadius: '100px',
                border: '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.25s ease',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)';
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Log in
            </a>
            <a
              href="/register"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#f5f0e6',
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
              }}
            >
              Get started free
            </a>
          </div>

          {/* ─── Mobile Hamburger ─── */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: '#1a1a1a',
                borderRadius: '2px',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: '#1a1a1a',
                borderRadius: '2px',
                transition: 'opacity 0.3s ease',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: 'block',
                width: '20px',
                height: '2px',
                background: '#1a1a1a',
                borderRadius: '2px',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
              }}
            />
          </button>
        </div>

        {/* ─── Mobile Dropdown ─── */}
        <div
          className="navbar-glass md:hidden"
          style={{
            maxWidth: '880px',
            margin: '8px auto 0',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(28, 25, 23, 0.12)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            maxHeight: mobileOpen ? '400px' : '0',
            opacity: mobileOpen ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
            pointerEvents: mobileOpen ? 'auto' : 'none',
          }}
        >
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#2a2a2a',
                  textDecoration: 'none',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s ease',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '8px 0' }} />
            <div style={{ display: 'flex', gap: '8px', padding: '4px 0 8px' }}>
              <a
                href="/login"
                style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#2a2a2a',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}
              >
                Log in
              </a>
              <a
                href="/register"
                style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#f5f0e6',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}
              >
                Get started free
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
