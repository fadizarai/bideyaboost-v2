'use client';

import { Loader2 } from 'lucide-react';

interface Props {
  imageSrc: string | null;
  pageNum: number;
  totalPages: number;
  loading?: boolean;
  side: 'left' | 'right' | 'single';
  labels: { page: string; of: string };
}

export default function BookPageSheet({
  imageSrc, pageNum, totalPages, loading, side, labels,
}: Props) {
  const isEmpty = pageNum < 1 || pageNum > totalPages;

  return (
    <div
      className={`book-sheet book-sheet-${side} relative flex-1 min-w-0 aspect-[3/4.2] max-h-[72vh]`}
      data-page={pageNum}
    >
      {/* Tranche / ombre reliure */}
      {side === 'left' && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/15 to-transparent z-20 pointer-events-none" />
      )}
      {side === 'right' && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/12 to-transparent z-20 pointer-events-none" />
      )}

      <div className="book-paper h-full w-full overflow-hidden flex flex-col">
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 md:p-3">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f8f6f1] z-10">
              <Loader2 className="w-8 h-8 text-[#243989]/40 animate-spin" />
            </div>
          )}
          {isEmpty ? (
            <div className="h-full w-full bg-[#f8f6f1]" />
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={`${labels.page} ${pageNum}`}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full bg-[#f8f6f1] animate-pulse" />
          )}
        </div>

        {!isEmpty && (
          <footer className="book-page-footer shrink-0 px-4 py-2 flex justify-between items-center text-[10px] text-[#243989]/50 border-t border-[#243989]/8">
            <span className="font-medium tracking-wide">BideyaBoost</span>
            <span>
              {labels.page} {pageNum} {labels.of} {totalPages}
            </span>
          </footer>
        )}
      </div>
    </div>
  );
}
