'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/features/landing/Navbar';
import ScrollAnimation from '@/components/features/landing/ScrollAnimation';
import HeroOverlay from '@/components/features/landing/HeroOverlay';
import PaperIntro from '@/components/features/landing/PaperIntro';
import HowItWorksSection from '@/components/features/landing/HowItWorksSection';
import FeaturesSection from '@/components/features/landing/FeaturesSection';
import WhyHisabKitabSection from '@/components/features/landing/WhyHisabKitabSection';
import CTASection from '@/components/features/landing/CTASection';
import Footer from '@/components/features/landing/Footer';

// Frame manifest — extracted from reference/0709.mp4
// Frames 1-4 are a pre-roll title card, frames 191+ fade to black
const ANIMATION_CONFIG = {
  startFrame: 5,       // blank paper — skip pre-roll
  endFrame: 190,       // full dashboard — skip black fade
  basePath: '/animation/frames/',
  prefix: 'frame_',
  format: 'webp',
};

export default function LandingPage() {
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  const handleProgress = useCallback((p: number) => {
    setProgress(p);
  }, []);

  const handleComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  const handleReEngage = useCallback(() => {
    setAnimationComplete(false);
  }, []);

  return (
    <main className="bg-[#F9F6EE] paper-texture" style={{ minHeight: '300vh' }}>
      {/* ===== Navbar — hidden during scroll-lock, fades in on completion ===== */}
      <Navbar visible={animationComplete} />

      {/* ===== Scroll-driven ink animation ===== */}
      <ScrollAnimation
        startFrame={ANIMATION_CONFIG.startFrame}
        endFrame={ANIMATION_CONFIG.endFrame}
        basePath={ANIMATION_CONFIG.basePath}
        prefix={ANIMATION_CONFIG.prefix}
        format={ANIMATION_CONFIG.format}
        totalWheelTravel={5000}
        bufferAhead={40}
        bufferBehind={20}
        lerpFactor={0.1}
        onProgress={handleProgress}
        onComplete={handleComplete}
        onReEngage={handleReEngage}
        stickyAfterComplete
      />

      {/* ===== Paper Intro — engaging text on blank paper, fades as ink begins ===== */}
      <PaperIntro progress={progress} />

      {/* ===== Hero Text — fades in at ~55% progress over the dark ink ===== */}
      <HeroOverlay progress={progress} animationComplete={animationComplete} />

      {/* ===== Content Sections & Footer — clean paper-cream backdrop with texture ===== */}
      <div className="relative z-10 bg-[#F9F6EE] paper-texture" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <HowItWorksSection />
        <FeaturesSection />
        <WhyHisabKitabSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
