/** Position d'une fiche dans le spread (page PDF gauche ou droite du livre) */
export type SpreadSlot = {
  pdfSide: 'left' | 'right';
  slice: number;
};

/** Flux de lecture : fiches page gauche puis fiches page droite */
export function streamPosToSlots(
  streamPos: number,
  leftCount: number,
  rightCount: number,
): { left: SpreadSlot; right: SpreadSlot | null } {
  const total = leftCount + rightCount;

  function toSlot(global: number): SpreadSlot | null {
    if (global < 0 || global >= total) return null;
    if (global < leftCount) return { pdfSide: 'left', slice: global };
    return { pdfSide: 'right', slice: global - leftCount };
  }

  return {
    left: toSlot(streamPos)!,
    right: toSlot(streamPos + 1),
  };
}

export function maxStreamPos(leftCount: number, rightCount: number): number {
  const total = leftCount + rightCount;
  if (total <= 1) return 0;
  return total - 2;
}

/** Position après feuilletage : l'ancienne page droite devient la page gauche */
export function carryStreamPosAfterSpreadAdvance(
  streamPos: number,
  leftCount: number,
): number {
  const rightGlobal = streamPos + 1;
  if (rightGlobal < leftCount) return rightGlobal;
  return rightGlobal - leftCount;
}

export function resolveSlotPageNum(
  slot: SpreadSlot,
  leftPdfPage: number,
  rightPdfPage: number,
): number {
  return slot.pdfSide === 'left' ? leftPdfPage : rightPdfPage;
}
