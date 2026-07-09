'use client';

import { useState } from 'react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#careers' },
    { label: 'Contact', href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        padding: '64px 24px 32px',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        {/* Top section — logo + columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '48px',
            marginBottom: '56px',
          }}
          className="footer-grid"
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {/* Monogram Mark */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
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
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  letterSpacing: '-0.02em',
                }}
              >
                Hisab Kitab
              </span>
            </div>
            <p
              style={{
                fontSize: '13.5px',
                lineHeight: 1.7,
                color: '#4A4A4A',
                maxWidth: '260px',
                marginBottom: '20px',
              }}
            >
              The modern digital khatabook for Indian shopkeepers. Replace paper
              with real-time, multi-user, auditable financial records.
            </p>
            {/* Social placeholder row */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {['X', 'LI', 'GH'].map((label) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(28, 25, 23, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#5A5A5A',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(28, 25, 23, 0.08)';
                    e.currentTarget.style.color = '#1a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(28, 25, 23, 0.04)';
                    e.currentTarget.style.color = '#5A5A5A';
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <FooterColumn key={title} title={title} links={links} />
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(28, 25, 23, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '12.5px', color: '#5A5A5A', fontWeight: 400 }}>
            © {new Date().getFullYear()} Hisab Kitab. All rights reserved.
          </p>
          <p style={{ fontSize: '12.5px', color: '#5A5A5A', fontWeight: 400 }}>
            Built with{' '}
            <span style={{ color: '#C84B31' }}>❤️</span>{' '}
            for shopkeepers everywhere
          </p>
        </div>
      </div>

      {/* Responsive: stack footer on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4
        style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#3A3A3A',
          marginBottom: '16px',
        }}
      >
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {links.map((link) => (
          <FooterLink key={link.label} label={link.label} href={link.href} />
        ))}
      </div>
    </div>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '13.5px',
        color: hovered ? '#1a1a1a' : '#5A5A5A',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        fontWeight: 400,
      }}
    >
      {label}
    </a>
  );
}
