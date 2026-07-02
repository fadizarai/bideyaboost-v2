import type { FlipSide } from '@/components/guide/BookPageTurn';

type NavCtx = {
  view: 'cover' | 'content' | 'back';
  isWide: boolean;
};

/** Desktop : page gauche fixe, seule la page droite se retourne */
export function resolveFlipSide(action: 'next' | 'prev', ctx: NavCtx): FlipSide {
  if (ctx.view !== 'content') return ctx.isWide ? 'full' : 'single';
  if (!ctx.isWide) return 'single';
  return 'right';
}
