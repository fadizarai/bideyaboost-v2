'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, BookOpen, Loader2, Download, Rocket,
  Maximize2, Minimize2, List, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useTouchSwipe, useIsMobile } from '@/hooks/useTouchSwipe';
import {
  loadPdfDocument, extractNativePageContent, prefetchPages, buildGuideSectionIndex,
  type NativePageContent,
} from '@/lib/guide-pdf-renderer';
import {
  buildGuidePageNavOptions, resolveDomainSectionForPage,
  type GuideSectionEntry,
} from '@/lib/guide-section-index';
import { getPageSliceCount } from '@/lib/guide-page-slice';
import {
  carryStreamPosAfterSpreadAdvance,
  maxStreamPos,
  resolveSlotPageNum,
  streamPosToSlots,
} from '@/lib/guide-spread-stream';
import BookCover from './BookCover';
import BookNativePage from './BookNativePage';
import BookPageTurn, { type FlipSide } from './BookPageTurn';
import { resolveFlipSide } from '@/lib/guide-book-nav';
import {
  buildReadablePageList,
  maxSpreadIndex as calcMaxSpreadIndex,
  progressFromSpread,
  resolveSpreadPdfPages,
  spreadIndexForPdfPage,
  isMobileGardeSpread,
  GUIDE_GARDE_PAGE,
} from '@/lib/guide-page-map';

const PDF_PATH = '/guides/guide-orientation-2026.pdf';

type GuideLang = 'tn' | 'fr' | 'en';

const LABELS: Record<GuideLang, {
  loading: string; preparing: string; error: string; page: string; of: string;
  prev: string; next: string; swipe: string; download: string; start: string;
  title: string; subtitle: string; cover: string; back: string; fullscreen: string;
  exitFullscreen: string; toc: string;
}> = {
  fr: {
    loading: 'Ouverture du guide…',
    preparing: 'Préparation des pages',
    error: 'Impossible de charger le guide. Réessayez plus tard.',
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    swipe: 'Glissez horizontalement pour tourner les pages',
    download: 'PDF',
    start: 'Commencer mon orientation',
    title: 'Guide officiel 2025',
    subtitle: 'Expérience livre numérique premium',
    cover: 'Couverture',
    back: 'Quatrième de couverture',
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter',
    toc: 'Spécialité / page',
  },
  tn: {
    loading: 'قاعدين نفتحوا الدليل…',
    preparing: 'قاعدين نحضّروا الصفحات',
    error: 'ما نجمناش نحملوا الدليل. عاود جرّب بعد شوية.',
    page: 'صفحة',
    of: 'من',
    prev: 'اللي قبل',
    next: 'اللي بعد',
    swipe: 'اسحب يمين ولا يسار باش تقلّب الصفحات',
    download: 'PDF',
    start: 'ابدأ التوجيه متاعك',
    title: 'الدليل الرسمي 2025',
    subtitle: 'كتاب رقمي باش تقرى الدليل كيما الكتاب الحقيقي',
    cover: 'الغلاف',
    back: 'الغلاف الخلفي',
    fullscreen: 'ملء الشاشة',
    exitFullscreen: 'خروج',
    toc: 'تخصص / صفحة',
  },
  en: {
    loading: 'Opening guide…',
    preparing: 'Preparing pages',
    error: 'Could not load the guide. Please try again later.',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    swipe: 'Swipe horizontally to turn pages',
    download: 'PDF',
    start: 'Start my orientation',
    title: 'Official guide 2025',
    subtitle: 'Premium digital book experience',
    cover: 'Cover',
    back: 'Back cover',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit',
    toc: 'Specialty / page',
  },
};

type ViewMode = 'cover' | 'content' | 'back';

function progressPercent(view: ViewMode, spreadIndex: number, pdfTotal: number, isWide: boolean) {
  if (view === 'cover') return 0;
  if (view === 'back') return 100;
  return progressFromSpread(spreadIndex, pdfTotal, isWide);
}

function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const fn = () => setWide(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return wide;
}

export type GuideBookReaderProps = {
  stickyTopClass?: string;
  orientationHref?: string;
};

export default function GuideBookReader({
  stickyTopClass = 'top-16',
  orientationHref = '/calcule-score',
}: GuideBookReaderProps = {}) {
  const { currentLanguage, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const lang = (currentLanguage === 'tn' || currentLanguage === 'fr' ? currentLanguage : 'en') as GuideLang;
  const t = LABELS[lang];
  const isWide = useIsWide();
  const isMobile = useIsMobile();

  const [doc, setDoc] = useState<Awaited<ReturnType<typeof loadPdfDocument>> | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prepareProgress, setPrepareProgress] = useState(0);

  const [view, setView] = useState<ViewMode>('cover');
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [streamPos, setStreamPos] = useState(0);
  const [leftSliceIndex, setLeftSliceIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [pageContents, setPageContents] = useState<Record<number, NativePageContent>>({});
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipSide, setFlipSide] = useState<FlipSide>('single');
  const [outgoingSnapshot, setOutgoingSnapshot] = useState<ReactNode>(null);
  const [guideSections, setGuideSections] = useState<GuideSectionEntry[]>([]);
  const pendingNavRef = useRef<(() => void) | null>(null);

  const readablePages = useMemo(() => buildReadablePageList(totalPages), [totalPages]);
  const pageNavOptions = useMemo(
    () => buildGuidePageNavOptions(readablePages, guideSections, lang),
    [readablePages, guideSections, lang],
  );
  const spreadMax = calcMaxSpreadIndex(totalPages, isWide);
  const { left: leftPageNum, right: rightPageNum } = resolveSpreadPdfPages(spreadIndex, totalPages, isWide);
  const mobilePairedContent = !isWide && view === 'content' && !isMobileGardeSpread(spreadIndex, isWide);
  const usesStreamNav = isWide || mobilePairedContent;
  const leftSliceCount = leftPageNum > 0 ? getPageSliceCount(pageContents[leftPageNum] ?? null) : 0;
  const rightSliceCount = rightPageNum > 0
    ? getPageSliceCount(pageContents[rightPageNum] ?? null)
    : 0;
  const currentDisplayPage = view === 'cover' ? 0 : view === 'back' ? totalPages + 1 : leftPageNum;
  const pct = progressPercent(view, spreadIndex, totalPages, isWide);

  const resetSlices = useCallback(() => {
    setStreamPos(0);
    setLeftSliceIndex(0);
  }, []);

  const setSpreadToLastSlices = useCallback((spread: number) => {
    const { left, right } = resolveSpreadPdfPages(spread, totalPages, isWide);
    const pairedMobile = !isWide && spread > 0;
    if (isWide || pairedMobile) {
      const nL = left > 0 ? getPageSliceCount(pageContents[left] ?? null) : 0;
      const nR = right > 0 ? getPageSliceCount(pageContents[right] ?? null) : 0;
      setStreamPos(maxStreamPos(nL, nR));
      return;
    }
    setStreamPos(0);
    if (left > 0) {
      setLeftSliceIndex(Math.max(0, getPageSliceCount(pageContents[left] ?? null) - 1));
    } else {
      setLeftSliceIndex(0);
    }
  }, [pageContents, isWide, totalPages]);

  const navCtx = useMemo(() => ({
    view,
    isWide,
  }), [view, isWide]);

  const renderRightSlotOnly = useCallback((
    sSpread: number,
    sStreamPos: number,
  ) => {
    const { left: lPage, right: rPage } = resolveSpreadPdfPages(sSpread, totalPages, isWide);
    const nL = lPage > 0 ? getPageSliceCount(pageContents[lPage] ?? null) : 0;
    const nR = rPage > 0 ? getPageSliceCount(pageContents[rPage] ?? null) : 0;
    const { right: rightSlot } = streamPosToSlots(sStreamPos, nL, nR);
    if (!rightSlot || lPage <= 0) return null;
    const pageNum = resolveSlotPageNum(rightSlot, lPage, rPage);
    return (
      <BookNativePage
        side="right"
        pageNum={pageNum}
        content={pageContents[pageNum] ?? null}
        loading={loadingPages.has(pageNum)}
        lang={lang}
        compact={isWide}
        sliceIndex={rightSlot.slice}
      />
    );
  }, [isWide, totalPages, pageContents, loadingPages, lang]);

  const renderBookBody = useCallback((
    sView: ViewMode,
    sSpread: number,
    sStreamPos: number,
    sLeftSlice: number,
  ) => {
    const { left: lPage, right: rPage } = resolveSpreadPdfPages(sSpread, totalPages, isWide);

    if (sView === 'cover') {
      return (
        <div className="w-full max-w-md mx-auto aspect-[3/4.25] max-h-[min(85vh,780px)]">
          <BookCover side="front" lang={lang} />
        </div>
      );
    }
    if (sView === 'back') {
      return (
        <div className="w-full max-w-md mx-auto aspect-[3/4.25] max-h-[min(85vh,780px)]">
          <BookCover side="back" lang={lang} />
        </div>
      );
    }

    if (!isWide) {
      if (isMobileGardeSpread(sSpread, isWide)) {
        return (
          <div className="w-full max-w-md mx-auto">
            <BookNativePage
              side="single"
              pageNum={lPage}
              content={lPage > 0 ? (pageContents[lPage] ?? null) : null}
              loading={lPage > 0 && loadingPages.has(lPage)}
              lang={lang}
              sliceIndex={sLeftSlice}
            />
          </div>
        );
      }

      const nL = lPage > 0 ? getPageSliceCount(pageContents[lPage] ?? null) : 0;
      const nR = rPage > 0 ? getPageSliceCount(pageContents[rPage] ?? null) : 0;
      const { left: leftSlot, right: rightSlot } = streamPosToSlots(sStreamPos, nL, nR);
      const leftPdf = resolveSlotPageNum(leftSlot, lPage, rPage);
      const rightPdf = rightSlot ? resolveSlotPageNum(rightSlot, lPage, rPage) : -1;

      return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-1.5 h-[min(90vh,920px)]">
          <div className="flex-1 min-h-0">
            <BookNativePage
              key={`M-L-${leftPdf}-${leftSlot.slice}`}
              side="single"
              pageNum={leftPdf}
              content={leftPdf > 0 ? (pageContents[leftPdf] ?? null) : null}
              loading={leftPdf > 0 && loadingPages.has(leftPdf)}
              lang={lang}
              compact
              verticalHalf
              sliceIndex={leftSlot.slice}
            />
          </div>
          {rightSlot && rightPdf > 0 ? (
            <div className="flex-1 min-h-0">
              <BookNativePage
                key={`M-R-${rightPdf}-${rightSlot.slice}`}
                side="single"
                pageNum={rightPdf}
                content={pageContents[rightPdf] ?? null}
                loading={loadingPages.has(rightPdf)}
                lang={lang}
                compact
                verticalHalf
                sliceIndex={rightSlot.slice}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 rounded-xl bg-[#faf8f4] shadow-inner border border-[#243989]/8" />
          )}
        </div>
      );
    }

    const nL = lPage > 0 ? getPageSliceCount(pageContents[lPage] ?? null) : 0;
    const nR = rPage > 0 ? getPageSliceCount(pageContents[rPage] ?? null) : 0;
    const { left: leftSlot, right: rightSlot } = streamPosToSlots(sStreamPos, nL, nR);
    const leftPdf = resolveSlotPageNum(leftSlot, lPage, rPage);
    const rightPdf = rightSlot ? resolveSlotPageNum(rightSlot, lPage, rPage) : -1;

    return (
      <div className="book-spread">
        <BookNativePage
          key={`L-${leftPdf}-${leftSlot.slice}`}
          side="left"
          pageNum={leftPdf}
          content={leftPdf > 0 ? (pageContents[leftPdf] ?? null) : null}
          loading={leftPdf > 0 && loadingPages.has(leftPdf)}
          lang={lang}
          compact
          sliceIndex={leftSlot.slice}
        />
        {rightSlot && rightPdf > 0 ? (
          <BookNativePage
            key={`R-${rightPdf}-${rightSlot.slice}`}
            side="right"
            pageNum={rightPdf}
            content={pageContents[rightPdf] ?? null}
            loading={loadingPages.has(rightPdf)}
            lang={lang}
            compact
            sliceIndex={rightSlot.slice}
          />
        ) : (
          <div className="book-sheet book-sheet-right relative min-h-0">
            <div className="book-paper h-full min-h-[min(88vh,900px)] w-full bg-[#faf8f4] shadow-inner" />
          </div>
        )}
      </div>
    );
  }, [isWide, totalPages, pageContents, loadingPages, lang]);

  const beginAnimatedNav = useCallback((dir: number, side: FlipSide, navFn: () => void) => {
    if (isFlipping) return;
    const useRightLeaf = isWide && view === 'content' && side === 'right';
    setOutgoingSnapshot(
      useRightLeaf
        ? renderRightSlotOnly(spreadIndex, streamPos)
        : renderBookBody(view, spreadIndex, streamPos, leftSliceIndex)
    );
    setDirection(dir);
    setFlipSide(side);
    pendingNavRef.current = navFn;
    setIsFlipping(true);
  }, [isFlipping, isWide, view, renderRightSlotOnly, renderBookBody, spreadIndex, streamPos, leftSliceIndex]);

  const handleFlipMidpoint = useCallback(() => {
    pendingNavRef.current?.();
    pendingNavRef.current = null;
  }, []);

  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false);
    setOutgoingSnapshot(null);
  }, []);

  const applyGoNext = useCallback(() => {
    if (view === 'cover') {
      setView('content');
      setSpreadIndex(0);
      resetSlices();
      return;
    }
    if (view === 'content') {
      if (usesStreamNav) {
        const maxK = maxStreamPos(leftSliceCount, rightSliceCount);
        if (streamPos < maxK) {
          setStreamPos((p) => p + 1);
          return;
        }
        if (spreadIndex < spreadMax) {
          setSpreadIndex((s) => s + 1);
          setStreamPos(carryStreamPosAfterSpreadAdvance(streamPos, leftSliceCount));
          return;
        }
        setView('back');
        return;
      }
      if (leftSliceIndex < leftSliceCount - 1) {
        setLeftSliceIndex((i) => i + 1);
        return;
      }
      if (spreadIndex < spreadMax) {
        setSpreadIndex((s) => s + 1);
        resetSlices();
      } else {
        setView('back');
      }
    }
  }, [view, spreadIndex, spreadMax, leftSliceIndex, leftSliceCount, streamPos, rightSliceCount, usesStreamNav, resetSlices]);

  const applyGoPrev = useCallback(() => {
    if (view === 'back') {
      setView('content');
      setSpreadIndex(spreadMax);
      setSpreadToLastSlices(spreadMax);
      return;
    }
    if (view === 'content') {
      if (usesStreamNav) {
        if (streamPos > 0) {
          setStreamPos((p) => p - 1);
          return;
        }
        if (spreadIndex > 0) {
          const prevSpread = spreadIndex - 1;
          setSpreadIndex(prevSpread);
          setSpreadToLastSlices(prevSpread);
          return;
        }
        setView('cover');
        return;
      }
      if (leftSliceIndex > 0) {
        setLeftSliceIndex((i) => i - 1);
        return;
      }
      if (spreadIndex > 0) {
        const prevSpread = spreadIndex - 1;
        setSpreadIndex(prevSpread);
        setSpreadToLastSlices(prevSpread);
      } else {
        setView('cover');
      }
    }
  }, [view, spreadIndex, leftSliceIndex, streamPos, usesStreamNav, setSpreadToLastSlices]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const pdfDoc = await loadPdfDocument(PDF_PATH);
        if (cancelled) return;
        setDoc(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        await extractNativePageContent(pdfDoc, GUIDE_GARDE_PAGE);
        await extractNativePageContent(pdfDoc, 39);
        if (!cancelled) setPrepareProgress(100);
      } catch {
        if (!cancelled) setError(t.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t.error]);

  const ensurePageContent = useCallback(async (pageNum: number) => {
    if (!doc || pageNum < 1 || pageNum > totalPages || pageContents[pageNum]) return;
    setLoadingPages((prev) => new Set(prev).add(pageNum));
    try {
      const content = await extractNativePageContent(doc, pageNum);
      setPageContents((prev) => ({ ...prev, [pageNum]: content }));
    } finally {
      setLoadingPages((prev) => {
        const next = new Set(prev);
        next.delete(pageNum);
        return next;
      });
    }
  }, [doc, totalPages, pageContents]);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    buildGuideSectionIndex(doc)
      .then((sections) => { if (!cancelled) setGuideSections(sections); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [doc]);

  useEffect(() => {
    if (!doc || view !== 'content') return;
    const pages = usesStreamNav ? [leftPageNum, rightPageNum] : [leftPageNum];
    pages.forEach((p) => { if (p > 0 && p <= totalPages) ensurePageContent(p); });
    if (leftPageNum > 0) prefetchPages(doc, leftPageNum, totalPages);
  }, [doc, view, leftPageNum, rightPageNum, usesStreamNav, totalPages, ensurePageContent]);

  const goNext = useCallback(() => {
    beginAnimatedNav(1, resolveFlipSide('next', navCtx), applyGoNext);
  }, [beginAnimatedNav, navCtx, applyGoNext]);

  const goPrev = useCallback(() => {
    beginAnimatedNav(-1, resolveFlipSide('prev', navCtx), applyGoPrev);
  }, [beginAnimatedNav, navCtx, applyGoPrev]);

  const goToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum === GUIDE_GARDE_PAGE) { setView('cover'); resetSlices(); return; }
    if (pageNum > totalPages) { setView('back'); resetSlices(); return; }
    setView('content');
    setSpreadIndex(spreadIndexForPdfPage(pageNum, totalPages, isWide));
    resetSlices();
    setDirection(pageNum > currentDisplayPage ? 1 : -1);
  };

  const touch = useTouchSwipe(goNext, goPrev, isRTL, true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') (isRTL ? goPrev : goNext)();
      if (e.key === 'ArrowLeft') (isRTL ? goNext : goPrev)();
      if (e.key === 'Escape' && fullscreen) setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRTL, goNext, goPrev, fullscreen]);

  const borderCls = isDark ? 'border-white/20' : 'border-white/30';
  const textMuted = 'text-white/70';
  const textTitle = 'text-[#B5E846]';

  const progressLabel = useMemo(() => {
    if (view === 'cover') return t.cover;
    if (view === 'back') return t.back;
    const section = resolveDomainSectionForPage(guideSections, leftPageNum);
    const sectionTitle = section?.title
      ?? pageContents[leftPageNum]?.sectionTitle
      ?? pageContents[leftPageNum]?.domainSection;
    if (sectionTitle) {
      if (isWide && rightPageNum > 0) {
        return `${sectionTitle} · ${t.page} ${leftPageNum}–${rightPageNum}`;
      }
      return sectionTitle;
    }
    if (isWide && rightPageNum > 0) {
      return `${t.page} ${leftPageNum} – ${rightPageNum}`;
    }
    return `${t.page} ${leftPageNum}`;
  }, [view, isWide, leftPageNum, rightPageNum, t, guideSections, pageContents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="relative w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          <BookOpen className="w-9 h-9 text-white/50" />
          <Loader2 className="w-5 h-5 text-[#B5E846] animate-spin absolute -bottom-1 -right-1" />
        </div>
        <p className="text-white/80">{t.loading}</p>
        {prepareProgress > 0 && prepareProgress < 100 && (
          <div className="w-48 h-1 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-[#B5E846] transition-all" style={{ width: `${prepareProgress}%` }} />
          </div>
        )}
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-red-400 mb-4">{error || t.error}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn-primary px-6 py-2 rounded-full">Retry</button>
      </div>
    );
  }

  const shellCls = fullscreen
    ? 'fixed inset-0 z-[200] bg-[#0a0f1a] flex flex-col items-stretch justify-center p-0 md:p-2'
    : 'max-w-[min(100%,1600px)] mx-auto px-2 sm:px-4 pb-12';

  const canPrev = view !== 'cover' && !isFlipping;
  const canNext = view !== 'back' && !isFlipping;

  const bookContent = renderBookBody(view, spreadIndex, streamPos, leftSliceIndex);

  return (
    <div className={shellCls} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Barre de progression fine */}
      <div className={`${fullscreen ? 'px-4 pt-3' : 'mb-4'} ${isMobile ? `sticky ${stickyTopClass} z-30 bg-[#243989]/80 backdrop-blur-md py-2 rounded-xl` : ''}`}>
        {!fullscreen && (
          <div className="text-center mb-4">
            <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${textTitle} mb-1`}>{t.title}</p>
            <p className={`text-sm ${textMuted}`}>{t.subtitle}</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#243989] to-[#B5E846]"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-white/80 min-w-[4rem] text-end">{progressLabel}</span>
        </div>
        {isMobile && (
          <p className="text-center text-[11px] text-white/60 mt-2 flex items-center justify-center gap-1.5">
            <ChevronsLeft className="w-3.5 h-3.5 opacity-50" />
            {t.swipe}
            <ChevronsRight className="w-3.5 h-3.5 opacity-50" />
          </p>
        )}
      </div>

      {/* Toolbar compact */}
      <div className={`flex items-center justify-between gap-2 mb-3 px-1 ${fullscreen ? 'px-4' : ''}`}>
        <select
          value={view === 'cover' ? 0 : view === 'back' ? totalPages + 1 : leftPageNum}
          onChange={(e) => goToPage(Number(e.target.value))}
          className={`text-xs rounded-lg border ${borderCls} px-2 py-1.5 bg-white/10 text-white max-w-[min(100%,280px)] sm:max-w-[320px] truncate`}
          aria-label={t.toc}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value={0}>{t.cover}</option>
          {pageNavOptions.map(({ page, label }) => (
            <option key={page} value={page}>{label}</option>
          ))}
          <option value={totalPages + 1}>{t.back}</option>
        </select>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setFullscreen((f) => !f)} className={`p-2 rounded-lg border ${borderCls} ${textMuted}`}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a href={PDF_PATH} download className={`p-2 rounded-lg border ${borderCls} ${textMuted}`} title={t.download}>
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Zone livre + swipe tactile */}
      <div
        className={`book-stage book-native book-swipe-zone relative select-none touch-pan-y ${
          fullscreen ? 'flex-1 flex items-center justify-center px-2' : ''
        }`}
        onTouchStart={touch.onTouchStart}
        onTouchMove={touch.onTouchMove}
        onTouchEnd={touch.onTouchEnd}
      >
        <div className="book-ambient absolute inset-0 rounded-3xl pointer-events-none" aria-hidden />

        <div className="relative flex items-center justify-center gap-1 sm:gap-2 w-full max-w-[min(98vw,1680px)] mx-auto px-1">
          {/* Flèche gauche */}
          <button
            type="button"
            onClick={isRTL ? goNext : goPrev}
            disabled={isRTL ? !canNext : !canPrev}
            aria-label={t.prev}
            className={`book-nav-arrow shrink-0 z-50 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border ${borderCls} bg-white/10 backdrop-blur-sm shadow-md text-white transition-all hover:bg-[#B5E846]/20 hover:border-[#B5E846]/40 disabled:opacity-20 disabled:pointer-events-none`}
          >
            <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>

          <div className="book-shell relative flex-1 min-w-0 max-w-[min(96vw,1600px)]">
            <div className="book-spine absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-2.5 z-30 rounded-sm hidden lg:block" />

            <div className={`book-open flex flex-row items-stretch w-full rounded-2xl ${isFlipping ? 'book-open--turning overflow-visible' : 'overflow-hidden'}`}>
              <BookPageTurn
                active={isFlipping}
                direction={direction}
                side={flipSide}
                isWide={isWide}
                outgoing={outgoingSnapshot}
                onMidpoint={handleFlipMidpoint}
                onComplete={handleFlipComplete}
              >
                {bookContent}
              </BookPageTurn>
            </div>
          </div>

          {/* Flèche droite */}
          <button
            type="button"
            onClick={isRTL ? goPrev : goNext}
            disabled={isRTL ? !canPrev : !canNext}
            aria-label={t.next}
            className={`book-nav-arrow shrink-0 z-50 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border ${borderCls} bg-white/10 backdrop-blur-sm shadow-md text-white transition-all hover:bg-[#B5E846]/20 hover:border-[#B5E846]/40 disabled:opacity-20 disabled:pointer-events-none`}
          >
            <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {!fullscreen && (
        <div className="mt-10 text-center">
          <Link href={orientationHref}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#B5E846] text-[#243989] font-bold hover:bg-[#9FD42E] transition-colors shadow-lg shadow-[#B5E846]/20">
            <Rocket className="w-5 h-5" />
            {t.start}
          </Link>
        </div>
      )}
    </div>
  );
}
