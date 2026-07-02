'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

const SWIPE_MIN = 48;
const SWIPE_RATIO = 1.4;

export function useTouchSwipe(
  onNext: () => void,
  onPrev: () => void,
  isRTL: boolean,
  enabled = true
) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const swipingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swipingRef.current = false;
  }, [enabled]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !startRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startRef.current.x;
    const dy = e.touches[0].clientY - startRef.current.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
      swipingRef.current = true;
    }
  }, [enabled]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enabled || !startRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    startRef.current = null;

    const isHorizontal = Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;
    if (!isHorizontal && !swipingRef.current) return;
    swipingRef.current = false;

    const goNext = isRTL ? dx > 0 : dx < 0;
    const goPrev = isRTL ? dx < 0 : dx > 0;
    if (goNext) onNext();
    else if (goPrev) onPrev();
  }, [enabled, isRTL, onNext, onPrev]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const fn = () => setMobile(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [breakpoint]);

  return mobile;
}
