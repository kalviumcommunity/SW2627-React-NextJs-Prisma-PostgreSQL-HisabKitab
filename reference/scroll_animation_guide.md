# Guide: Implementing Scroll-Driven Image Sequence Animation (Option 1)

This guide documents the architecture, implementation steps, and optimization techniques for adding a scroll-driven video-to-image frame animation to the **Hisab Kitab** landing page. It is written to serve as a design spec and implementation manual for future agents or developers working on the repository.

---

## 🏗️ Architecture Overview

The system bypasses direct scroll-seeking on compressed MP4 files (which causes decoding lag) by converting the video frames into a sequential list of optimized image frames.

```
[User Scroll Event]
        │
        ▼
[Compute Frame Index] ──► (scrollY / maxScroll) * totalFrames
        │
        ▼
[Canvas Render Loop]  ──► Draw frame from Preloaded Array to Canvas (using requestAnimationFrame)
```

We support two modes of frame generation:
1. **Dynamic in-memory extraction** (as built in the trial using browser canvas + blob conversion).
2. **Build-time static assets** (exporting video to a series of WebP images using FFmpeg and serving them via the Next.js `public/` directory).

---

## 🛠️ Step-by-Step Implementation in Next.js

When implementing this in the main Next.js application (`apps/web/`), use the following pattern to create a reusable React component.

### 1. The React Component Structure

Create a component at `apps/web/src/components/features/landing/ScrollAnimation.tsx`:

```tsx
import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  videoSrc: string;
  frameCount: number;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({ videoSrc, frameCount }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  // 1. Preload/Extract frames on mount
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    // To use build-time assets, name them sequentially (e.g., frame_0001.webp)
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(4, '0');
      img.src = `/animation/frames/frame_${paddedIndex}.webp`;
      
      img.onload = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / frameCount) * 100));
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsReady(true);
        }
      };
      
      loadedImages.push(img);
    }
  }, [frameCount]);

  // 2. Render target frame on scroll
  useEffect(() => {
    if (!isReady || images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-density screens (retina support)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;

      // Calculate scroll progress relative to the container element
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.scrollHeight - window.innerHeight;
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / containerHeight));

      const frameIndex = Math.min(
        images.length - 1,
        Math.floor(scrollProgress * images.length)
      );

      // Use requestAnimationFrame to sync drawing to screen refresh rates
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = images[frameIndex];
        if (img) {
          ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Draw initial frame

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReady, images]);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {!isReady && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-50">
          <h3>Loading Bookkeeper Ledger Animation...</h3>
          <div className="w-64 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-100" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="mt-2 text-sm text-gray-400">{loadingProgress}%</span>
        </div>
      )}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center">
        <canvas ref={canvasRef} className="w-[80%] h-[70%] object-contain" />
      </div>
    </div>
  );
};
```

---

## ⚡ Performance Optimization Guidelines

When building out the production page, future agents must enforce the following rules:

1. **Throttled Easing**: Never recalculate scroll events on every raw pixel movement. Wrap layout/index updates in `requestAnimationFrame` to target a smooth 60 FPS update loop.
2. **WebP Compression**: Source frames must be encoded as WebP with a quality range of `70-80` to keep individual files below `30KB`.
3. **Responsive Sizing**: Render to a `<canvas>` element using a CSS layout size (e.g. `object-contain`), adjusting internal canvas resolution based on device pixel ratio (`window.devicePixelRatio`).
4. **Mobile Exclusions**: Disable scroll-bound video sequences on mobile viewports (`window.innerWidth < 768px`) to conserve data and prevent CPU overheating. Instead, load a static fallback thumbnail.
