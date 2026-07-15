"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        setError(res.error || "Invalid email or password.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pageFlip {
          0%, 100% { transform: perspective(1200px) rotateY(0deg) scale(1); }
          25% { transform: perspective(1200px) rotateY(-2deg) scale(1.01); }
          50% { transform: perspective(1200px) rotateY(1.5deg) scale(1.02); }
          75% { transform: perspective(1200px) rotateY(-1deg) scale(1.01); }
        }
        @keyframes penHover {
          0%, 100% { transform: translate(0, 0) rotate(-25deg); }
          25% { transform: translate(4px, -6px) rotate(-28deg); }
          50% { transform: translate(-2px, -10px) rotate(-22deg); }
          75% { transform: translate(6px, -4px) rotate(-26deg); }
        }
        @keyframes inkDrop {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
        @keyframes ambientGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ledgerLines {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        .login-hero-image {
          animation: pageFlip 8s ease-in-out infinite;
          filter: drop-shadow(0 25px 50px rgba(0,0,0,0.4));
        }
        .login-pen-overlay {
          animation: penHover 6s ease-in-out infinite;
        }
        .login-ink-dot {
          animation: inkDrop 4s ease-in-out infinite;
        }
        .login-ambient-glow {
          animation: ambientGlow 5s ease-in-out infinite;
        }
        .login-form-enter {
          animation: slideInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .login-hero-enter {
          animation: floatUp 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .login-card-enter {
          animation: scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
          opacity: 0;
        }
        .login-input-focus {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .login-input-focus:focus {
          border-color: #D97706 !important;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1), 0 1px 2px rgba(0,0,0,0.05);
          background-color: #FFFFFF !important;
        }
        .login-btn-hover {
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .login-btn-hover:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(28, 25, 23, 0.3);
          background-color: #2C2A29 !important;
        }
        .login-btn-hover:active:not(:disabled) {
          transform: translateY(0);
        }
        .ledger-line {
          animation: ledgerLines 6s ease-in-out infinite;
        }
        .ledger-line:nth-child(2) { animation-delay: 1s; }
        .ledger-line:nth-child(3) { animation-delay: 2s; }
        .ledger-line:nth-child(4) { animation-delay: 3s; }
      `}</style>

      <main className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden select-none">
        {/* ═══════════════ LEFT: HERO ILLUSTRATION ═══════════════ */}
        <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-[#1C1917] via-[#2C2520] to-[#1A1512] items-center justify-center overflow-hidden">
          {/* Subtle paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }} />

          {/* Radial ambient glow behind the image */}
          <div className="login-ambient-glow absolute w-[500px] h-[500px] rounded-full bg-[#D97706]/15 blur-[120px] pointer-events-none" />

          {/* Secondary warm glow */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#C84B31]/10 blur-[100px] pointer-events-none login-ambient-glow" style={{ animationDelay: '2.5s' }} />

          {/* Decorative ledger lines (horizontal) */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="ledger-line w-[60%] h-[1px] my-[60px]"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.15) 30%, rgba(217,119,6,0.15) 70%, transparent 100%)`,
                }}
              />
            ))}
          </div>

          {/* Hero image container */}
          <div className="login-hero-enter relative z-10 flex flex-col items-center px-8">
            <div className="login-hero-image relative w-[420px] h-[420px] rounded-2xl overflow-hidden">
              <Image
                src="/ledger-hero.png"
                alt="Vintage ledger notebook with pages flipping and a pen hovering above"
                fill
                className="object-cover"
                priority
              />

              {/* Warm overlay to blend */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/60 via-transparent to-[#1C1917]/20 pointer-events-none" />
            </div>

            {/* Pen overlay (SVG) */}
            <div className="login-pen-overlay absolute top-[12%] right-[8%] w-20 h-20 pointer-events-none z-20">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="15" y1="65" x2="60" y2="15" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="60,15 55,25 65,22" fill="#D4AF37" />
                <circle cx="15" cy="65" r="2" fill="#D97706" className="login-ink-dot" />
              </svg>
            </div>

            {/* Small ink dots floating */}
            <div className="login-ink-dot absolute bottom-[30%] left-[20%] w-2 h-2 rounded-full bg-[#D97706]/40 pointer-events-none" style={{ animationDelay: '1s' }} />
            <div className="login-ink-dot absolute top-[40%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#D4AF37]/30 pointer-events-none" style={{ animationDelay: '2s' }} />
            <div className="login-ink-dot absolute bottom-[45%] left-[30%] w-1 h-1 rounded-full bg-[#C84B31]/30 pointer-events-none" style={{ animationDelay: '3s' }} />

            {/* Tagline below image */}
            <div className="mt-10 text-center">
              <p className="font-serif text-2xl text-[#F9F6EE]/90 tracking-wide">
                हर <span className="text-[#D97706] italic">हिसाब</span>, हर <span className="text-[#D4AF37] italic">किताब</span>
              </p>
              <p className="text-sm text-[#F9F6EE]/40 font-sans mt-3 tracking-wider uppercase">
                Your digital khata, modernized
              </p>
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-[#D97706]/20 pointer-events-none" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[#D97706]/20 pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[#D97706]/20 pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-[#D97706]/20 pointer-events-none" />
        </div>

        {/* ═══════════════ RIGHT: LOGIN FORM ═══════════════ */}
        <div className="w-full lg:w-[45%] min-h-screen bg-[#F9F6EE] flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 relative">
          {/* Paper texture */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }} />

          {/* Decorative corner accents (right panel) */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#1C1917]/10 pointer-events-none" />
          <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#1C1917]/10 pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#1C1917]/10 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#1C1917]/10 pointer-events-none" />

          {/* Mobile hero - show on small screens */}
          <div className="lg:hidden mb-8 relative w-full max-w-[280px] h-[200px] mx-auto rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/ledger-hero.png"
              alt="Vintage ledger notebook"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/50 via-transparent to-transparent" />
          </div>

          <div className="login-form-enter w-full max-w-[560px] z-10">
            {/* Branding */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block group">
                <h1 className="font-serif text-4xl font-semibold text-[#1C1917] tracking-tight">
                  हिसाब{" "}
                  <span className="text-[#D97706] font-normal italic group-hover:text-[#B45309] transition-colors duration-300">
                    किताब
                  </span>
                </h1>
              </Link>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="w-8 h-[1px] bg-[#1C1917]/15" />
                <p className="text-[11px] font-sans text-[#5A5A5A] uppercase tracking-[0.25em]">
                  Digital Khata Ledger
                </p>
                <div className="w-8 h-[1px] bg-[#1C1917]/15" />
              </div>
            </div>

            {/* Login card */}
            <div className="login-card-enter bg-white border border-[#1C1917]/8 shadow-xl rounded-2xl px-8 sm:px-12 py-[73px] relative overflow-hidden">
              {/* Amber accent line at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[3px] bg-gradient-to-r from-[#D97706] via-[#D4AF37] to-[#D97706] rounded-b-full" />

              {/* Shimmer effect on accent */}
              <div className="absolute top-0 left-0 w-full h-[3px] overflow-hidden pointer-events-none">
                <div className="w-[40px] h-full bg-white/50" style={{ animation: 'shimmerLine 3s ease-in-out infinite' }} />
              </div>

              <h2 className="text-2xl font-serif font-medium text-[#1C1917] mb-2 text-center">
                Welcome Back
              </h2>
              <p className="text-sm font-sans text-[#6C6967] text-center mb-8">
                Access your secure digital ledger
              </p>

              {/* Error display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3" style={{ animation: 'floatUp 0.3s ease-out' }}>
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs font-medium text-red-700">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className={`text-xs font-sans font-medium uppercase tracking-wider transition-colors duration-200 ${focusedField === 'email' ? 'text-[#D97706]' : 'text-[#3C3937]'
                      }`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className={`w-4 h-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-[#D97706]' : 'text-[#1C1917]/25'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className="login-input-focus w-full bg-[#FBFBFA] border border-[#1C1917]/15 rounded-xl pl-12 pr-6 py-4 text-base text-[#1C1917] placeholder-[#1C1917]/30 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className={`text-xs font-sans font-medium uppercase tracking-wider transition-colors duration-200 ${focusedField === 'password' ? 'text-[#D97706]' : 'text-[#3C3937]'
                      }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className={`w-4 h-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-[#D97706]' : 'text-[#1C1917]/25'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="login-input-focus w-full bg-[#FBFBFA] border border-[#1C1917]/15 rounded-xl pl-12 pr-6 py-4 text-base text-[#1C1917] placeholder-[#1C1917]/30 outline-none"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="login-btn-hover w-full bg-[#1C1917] text-[#F9F6EE] font-sans font-semibold text-base py-4 px-6 rounded-xl flex justify-center items-center gap-2.5 cursor-pointer mt-4 hover:bg-[#2C2A29] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-[#1C1917]/5">
                <p className="text-xs font-sans text-[#6C6967] text-center">
                  New to Hisab Kitab?{" "}
                  <Link
                    href="/register"
                    className="text-[#D97706] hover:text-[#B45309] hover:underline font-semibold ml-1 transition-colors duration-200"
                  >
                    Create a free account
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-[#1C1917]/25">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-sans uppercase tracking-wider">Encrypted</span>
              </div>
              <div className="w-[1px] h-3 bg-[#1C1917]/10" />
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-sans uppercase tracking-wider">Secure</span>
              </div>
              <div className="w-[1px] h-3 bg-[#1C1917]/10" />
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
                <span className="text-[10px] font-sans uppercase tracking-wider">Private</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
