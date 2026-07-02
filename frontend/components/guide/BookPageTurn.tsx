'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export type FlipSide = 'left' | 'right' | 'single' | 'full';

type Props = {
  children: ReactNode;
  outgoing: ReactNode;
  active: boolean;
  direction: number;
  side: FlipSide;
  isWide: boolean;
  onMidpoint: () => void;
  onComplete: () => void;
};

const FLIP_DURATION = 0.72;

function flipOrigin(side: FlipSide, direction: number): string {
  if (side === 'full') return 'center center';
  if (side === 'single') return direction > 0 ? 'left center' : 'right center';
  if (side === 'left') return direction > 0 ? 'right center' : 'left center';
  return direction > 0 ? 'left center' : 'right center';
}

function leafPosition(side: FlipSide, isWide: boolean): string {
  if (side === 'full' || side === 'single' || !isWide) return 'inset-0';
  if (side === 'left') return 'top-0 bottom-0 left-0 w-1/2';
  return 'top-0 bottom-0 right-0 w-1/2';
}

export default function BookPageTurn({
  children,
  outgoing,
  active,
  direction,
  side,
  isWide,
  onMidpoint,
  onComplete,
}: Props) {
  const midpointCalled = useRef(false);
  const rotateY = useMotionValue(0);
  const foldHighlight = useTransform(rotateY, [-180, -90, 0, 90, 180], [0.15, 0.85, 0.2, 0.85, 0.15]);

  useEffect(() => {
    if (!active) return;
    midpointCalled.current = false;
    const from = 0;
    const to = direction > 0 ? -180 : 180;
    rotateY.set(from);

    const controls = animate(rotateY, to, {
      duration: FLIP_DURATION,
      ease: [0.42, 0.02, 0.28, 1],
    });

    return () => controls.stop();
  }, [active, direction, rotateY]);

  useEffect(() => {
    if (!active) return;

    const unsub = rotateY.on('change', (v) => {
      if (midpointCalled.current) return;
      if (Math.abs(v) >= 88) {
        midpointCalled.current = true;
        onMidpoint();
      }
    });

    return unsub;
  }, [active, onMidpoint, rotateY]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(onComplete, FLIP_DURATION * 1000 + 40);
    return () => window.clearTimeout(timer);
  }, [active, onComplete]);

  const origin = flipOrigin(side, direction);
  const pos = leafPosition(side, isWide);
  const leafCls = side === 'right' && isWide ? `${pos} book-flip-leaf--right` : pos;

  return (
    <div className="book-flip-scene relative w-full">
      <div className={`book-flip-base relative z-0 ${isWide ? 'book-flip-base--spread' : ''}`}>{children}</div>

      {active && (
        <motion.div
          className={`book-flip-leaf ${leafCls} z-20`}
          style={{
            rotateY,
            transformOrigin: origin,
            boxShadow: direction > 0
              ? '-16px 0 40px rgba(0,0,0,0.35)'
              : '16px 0 40px rgba(0,0,0,0.35)',
          }}
        >
          <div className="book-flip-leaf-front h-full w-full overflow-hidden">{outgoing}</div>
          <motion.div
            className="book-flip-leaf-back h-full w-full"
            style={{ opacity: foldHighlight }}
          />
        </motion.div>
      )}
    </div>
  );
}
