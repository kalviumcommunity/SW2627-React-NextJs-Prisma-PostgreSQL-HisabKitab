'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollAnimationProps {
  startFrame: number;
  endFrame: number;
  basePath: string;
  prefix: string;
  format: string;
  padDigits?: number;
  bufferAhead?: number;
  bufferBehind?: number;
  lerpFactor?: number;
  totalWheelTravel?: number;
  /** Extra wheel travel for zoom-out after last frame */
  zoomWheelTravel?: number;
  /** Target scale at full zoom-out (0.65 = 65% of viewport) */
  zoomTargetScale?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  /** Called when user scrolls back up and re-enters the animation */
  onReEngage?: () => void;
  stickyAfterComplete?: boolean;
}

export default function ScrollAnimation({
  startFrame,
  endFrame,
  basePath,
  prefix,
  format,
  padDigits = 4,
  bufferAhead = 40,
  bufferBehind = 20,
  lerpFactor = 0.1,
  totalWheelTravel = 5000,
  zoomWheelTravel = 250,
  zoomTargetScale = 0.95,
  onProgress,
  onComplete,
  onReEngage,
  stickyAfterComplete = false,
}: ScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<'locked' | 'zooming' | 'released'>('locked');

  const cbRef = useRef({ onProgress, onComplete, onReEngage });
  useEffect(() => {
    cbRef.current = { onProgress, onComplete, onReEngage };
  }, [onProgress, onComplete, onReEngage]);

  const totalFrames = endFrame - startFrame;

  const engine = useRef({
    cache: new Map<number, HTMLImageElement>(),
    loading: new Set<number>(),
    currentFrame: startFrame,
    targetFrame: startFrame,
    lastDrawn: -1,
    rafId: 0,
    wheelAccum: 0,
    zoomAccum: 0,       // separate accumulator for zoom phase
    completed: false,
    locked: true,
    zooming: false,
    lastReportedProgress: -1,
    lastReportTime: 0,
  });

  const getFrameUrl = useCallback(
    (i: number) => `${basePath}${prefix}${String(i).padStart(padDigits, '0')}.${format}`,
    [basePath, prefix, padDigits, format]
  );

  // Apply zoom transform directly to the container (no React re-render)
  const applyZoom = useCallback((zoomProgress: number) => {
    const container = containerRef.current;
    if (!container) return;
    const scale = 1 - zoomProgress * (1 - zoomTargetScale);
    const radius = zoomProgress * 24; // max 24px border radius
    container.style.transform = `scale(${scale})`;
    container.style.borderRadius = `${radius}px`;
    container.style.overflow = 'hidden';
  }, [zoomTargetScale]);

  const resetZoom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.transform = '';
    container.style.borderRadius = '';
    container.style.overflow = '';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const e = engine.current;

    function drawFrame(index: number) {
      const img = e.cache.get(index);
      if (!img || !canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const iw = img.naturalWidth, ih = img.naturalHeight;
      const ir = iw / ih, cr = w / h;
      let sx = 0, sy = 0, sw = iw, sh = ih;
      if (ir > cr) { sw = ih * cr; sx = (iw - sw) / 2; }
      else { sh = iw / cr; sy = (ih - sh) / 2; }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      e.lastDrawn = index;
    }

    function preloadAround(center: number) {
      const lo = Math.max(startFrame, center - bufferBehind);
      const hi = Math.min(endFrame, center + bufferAhead);
      for (let i = lo; i <= hi; i++) {
        if (!e.cache.has(i) && !e.loading.has(i)) {
          e.loading.add(i);
          const img = new Image();
          img.onload = () => { e.cache.set(i, img); e.loading.delete(i); };
          img.onerror = () => e.loading.delete(i);
          img.src = getFrameUrl(i);
        }
      }
      for (const k of e.cache.keys()) {
        if (k < center - bufferBehind * 4 || k > center + bufferAhead * 4) {
          e.cache.delete(k);
        }
      }
    }

    const shouldSkip = sessionStorage.getItem('hasSeenLandingAnim') === 'true';
    if (!shouldSkip) {
      sessionStorage.setItem('hasSeenLandingAnim', 'true');
    }

    if (shouldSkip) {
      e.currentFrame = endFrame;
      e.targetFrame = endFrame;
      e.completed = true;
      e.locked = false;
      e.zooming = false;
      e.wheelAccum = totalWheelTravel;
      e.zoomAccum = zoomWheelTravel;
      
      applyZoom(1);
      
      if (stickyAfterComplete) {
        setPhase('released');
      }

      cbRef.current.onProgress?.(1);
      cbRef.current.onComplete?.();

      const img = new Image();
      img.onload = () => {
        e.cache.set(endFrame, img);
        drawFrame(endFrame);
        setReady(true);
        preloadAround(endFrame);
      };
      img.src = getFrameUrl(endFrame);
    } else {
      // Lock scroll
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      e.locked = true;

      // Load first frame
      const img1 = new Image();
      img1.onload = () => {
        e.cache.set(startFrame, img1);
        drawFrame(startFrame);
        setReady(true);
        preloadAround(startFrame);
      };
      img1.src = getFrameUrl(startFrame);
    }

    // Render loop
    function tick() {
      const diff = e.targetFrame - e.currentFrame;
      if (Math.abs(diff) > 0.05) {
        e.currentFrame += diff * lerpFactor;
      } else {
        e.currentFrame = e.targetFrame;
      }

      const idx = Math.max(startFrame, Math.min(endFrame, Math.round(e.currentFrame)));
      if (idx !== e.lastDrawn) {
        drawFrame(idx);
      }

      // Throttled progress
      const progress = (idx - startFrame) / totalFrames;
      const now = performance.now();
      if (Math.abs(progress - e.lastReportedProgress) > 0.005 && now - e.lastReportTime > 66) {
        e.lastReportedProgress = progress;
        e.lastReportTime = now;
        cbRef.current.onProgress?.(progress);
      }

      // Frame animation complete → enter zoom phase
      if (idx >= endFrame && !e.completed && !e.zooming) {
        e.zooming = true;
        setPhase('zooming');
      }

      e.rafId = requestAnimationFrame(tick);
    }
    e.rafId = requestAnimationFrame(tick);

    // --- Wheel handler: 3 phases ---
    function onWheel(ev: WheelEvent) {
      const delta = Math.abs(ev.deltaY) > 100 ? ev.deltaY * 0.3 : ev.deltaY;

      // Phase 1: LOCKED — wheel drives frame animation
      if (e.locked && !e.zooming) {
        ev.preventDefault();
        ev.stopPropagation();

        e.wheelAccum = Math.max(0, Math.min(totalWheelTravel, e.wheelAccum + delta));
        const progress = e.wheelAccum / totalWheelTravel;
        e.targetFrame = startFrame + progress * totalFrames;

        preloadAround(Math.round(e.targetFrame));
        return;
      }

      // Phase 2: ZOOMING — wheel drives the zoom-out scale
      if (e.zooming && !e.completed) {
        ev.preventDefault();
        ev.stopPropagation();

        e.zoomAccum = Math.max(0, Math.min(zoomWheelTravel, e.zoomAccum + delta));
        const zoomProgress = e.zoomAccum / zoomWheelTravel;

        applyZoom(zoomProgress);

        // Scrolling back during zoom → un-zoom
        if (e.zoomAccum <= 0) {
          e.zooming = false;
          setPhase('locked');
          resetZoom();
          // Allow frame animation to reverse
          e.wheelAccum = totalWheelTravel + delta;
          e.wheelAccum = Math.max(0, Math.min(totalWheelTravel, e.wheelAccum));
          const progress = e.wheelAccum / totalWheelTravel;
          e.targetFrame = startFrame + progress * totalFrames;
          return;
        }

        // Zoom complete → release
        if (zoomProgress >= 1) {
          e.completed = true;
          e.locked = false;
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          cbRef.current.onProgress?.(1);
          cbRef.current.onComplete?.();

          if (stickyAfterComplete) {
            setPhase('released');
          }
        }
        return;
      }

      // Phase 3: RELEASED — scrolling up at top re-engages
      if (e.completed && ev.deltaY < 0 && window.scrollY <= 0) {
        ev.preventDefault();
        ev.stopPropagation();

        // Re-lock
        e.completed = false;
        e.zooming = true;
        e.locked = true;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);

        cbRef.current.onReEngage?.();
        setPhase('zooming');

        // Start from full zoom, scroll back
        e.zoomAccum = zoomWheelTravel;
        e.wheelAccum = totalWheelTravel;
        e.zoomAccum = Math.max(0, e.zoomAccum + delta);

        const zoomProgress = e.zoomAccum / zoomWheelTravel;
        applyZoom(zoomProgress);
      }
    }

    function onScroll() {
      if (e.locked) window.scrollTo(0, 0);
    }
    function onTouchMove(ev: TouchEvent) {
      if (e.locked) ev.preventDefault();
    }
    function onResize() {
      e.lastDrawn = -1;
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(e.rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Three layout phases:
   * - "locked":    fixed fullscreen, wheel drives frame animation
   * - "zooming":   fixed fullscreen, wheel drives scale transform (zoom-out)
   * - "released":  normal document flow, canvas scrolls away
   */
  const isReleased = phase === 'released';

  return (
    <div
      ref={containerRef}
      className={
        isReleased
          ? 'relative w-full z-0'
          : 'fixed inset-0 z-30'
      }
      style={{
        ...(isReleased ? { height: '100vh' } : {}),
        transformOrigin: 'center center',
        willChange: phase === 'zooming' ? 'transform, border-radius' : 'auto',
      }}
    >
      {/* Loading shimmer */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F9F6EE] z-10">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#3a3a3a]/20 border-t-[#3a3a3a] animate-spin" />
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
