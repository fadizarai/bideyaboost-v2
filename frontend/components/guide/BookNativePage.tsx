'use client';

import { Loader2, Building2, GraduationCap } from 'lucide-react';
import type { NativePageContent } from '@/lib/guide-pdf-renderer';
import { slicePageContent, INSTITUTIONS_PER_SLICE } from '@/lib/guide-page-slice';
import InstitutionCard from './InstitutionCard';

type Lang = 'tn' | 'fr' | 'en';

interface Props {
  content: NativePageContent | null;
  pageNum: number;
  loading?: boolean;
  side: 'left' | 'right' | 'single';
  lang: Lang;
  compact?: boolean;
  verticalHalf?: boolean;
  sliceIndex?: number;
}

const PAGE_HINT: Record<Lang, string> = {
  tn: 'مؤسسة تعليم عالي — شروط القبول',
  fr: 'Établissement — critères d\'admission',
  en: 'Institution — admission criteria',
};

const SECTION_HINT: Record<Lang, string> = {
  tn: 'قطاع التوجيه',
  fr: 'Secteur d\'orientation',
  en: 'Orientation sector',
};

const PAGE_NUM: Record<Lang, string> = {
  tn: 'صفحة',
  fr: 'Page',
  en: 'Page',
};

export default function BookNativePage({
  content,
  pageNum,
  loading,
  side,
  lang,
  compact = false,
  verticalHalf = false,
  sliceIndex = 0,
}: Props) {
  const isEmpty = pageNum < 1;
  const slice = slicePageContent(content, sliceIndex);
  const dir = content?.isArabic !== false ? 'rtl' : 'ltr';
  const fontClass = 'font-[family-name:var(--font-noto-arabic)]';
  const isSectionCover = slice?.isSectionCover ?? false;
  const isInstitutionPage = slice?.isInstitution ?? false;
  const isCompactInstitution = compact || verticalHalf || (side === 'single' && isInstitutionPage);
  const stackInstitutions = slice ? slice.institutions.length > 1 || verticalHalf : false;

  const isSpread = side === 'left' || side === 'right';
  const sheetSize = isSpread
    ? 'h-full max-h-[min(90vh,920px)]'
    : verticalHalf
      ? 'h-full w-full'
      : `w-full max-h-[min(90vh,920px)] ${isInstitutionPage || isSectionCover ? 'min-h-[min(88vh,900px)]' : 'aspect-[3/4.25]'}`;

  return (
    <div className={`book-sheet book-sheet-${side} relative min-w-0 ${isSpread ? 'flex-1' : 'flex-1 w-full'} ${sheetSize}`}>
      {side === 'left' && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/14 to-transparent z-20 pointer-events-none" />
      )}
      {side === 'right' && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent z-20 pointer-events-none" />
      )}

      <div className="book-paper h-full w-full overflow-hidden flex flex-col shadow-inner">
        <div className="shrink-0 h-1 bg-gradient-to-r from-transparent via-[#243989]/20 to-transparent" />

        <div
          className={`flex-1 relative overflow-hidden ${fontClass} ${isInstitutionPage ? (isCompactInstitution ? 'p-2' : 'p-3 md:p-4') : 'p-5 md:p-8'}`}
          dir={dir}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#faf8f4] z-10">
              <Loader2 className="w-8 h-8 text-[#243989]/30 animate-spin" />
            </div>
          )}

          {isEmpty ? (
            <div className="h-full bg-[#faf8f4]" />
          ) : slice ? (
            <>
              {isSectionCover ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 bg-gradient-to-b from-[#243989] via-[#3A52A8] to-[#243989] text-white">
                  <GraduationCap className="w-10 h-10 text-[#B5E846] mb-5 opacity-90" />
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#B5E846]/90 mb-4">
                    {SECTION_HINT[lang]}
                  </p>
                  <div className="w-14 h-1 rounded-full bg-[#B5E846] mb-6" />
                  <h1 className="text-xl sm:text-2xl font-bold leading-relaxed max-w-[95%]">
                    {slice.sectionTitle}
                  </h1>
                  {slice.sectionSubtitle && (
                    <p className="mt-4 text-sm sm:text-base text-blue-100/95 leading-relaxed max-w-[95%]">
                      {slice.sectionSubtitle}
                    </p>
                  )}
                  <p className="mt-auto pt-8 text-[10px] text-white/50 tabular-nums">
                    {PAGE_NUM[lang]} {pageNum}
                  </p>
                </div>
              ) : isInstitutionPage ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-1.5 px-0.5 pb-1 border-b border-[#243989]/10 shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-[#243989]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-[#243989]/70 uppercase tracking-wide line-clamp-1">
                        {slice.domainSection ?? PAGE_HINT[lang]}
                      </p>
                      {slice.domainSectionSubtitle && (
                        <p className="text-[9px] text-[#243989]/45 line-clamp-1">{slice.domainSectionSubtitle}</p>
                      )}
                    </div>
                    {slice.sliceCount > 1 && (
                      <span className="text-[9px] tabular-nums text-[#243989]/45">
                        {slice.sliceIndex + 1}/{slice.sliceCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 pt-1.5 overflow-hidden flex flex-col gap-1.5">
                    {slice.institutions.map((inst, i) => (
                      <InstitutionCard
                        key={`${pageNum}-${slice.sliceIndex}-${i}-${inst.orientationCode || inst.name}`}
                        data={inst}
                        lang={lang}
                        index={slice.sliceIndex * INSTITUTIONS_PER_SLICE + i}
                        compact={isCompactInstitution}
                        fill={slice.institutions.length === 1 && !stackInstitutions}
                        stacked={stackInstitutions}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <article className="guide-native-article h-full flex flex-col overflow-hidden">
                  {slice.sliceIndex === 0 && content?.illustration && (
                    <figure className="mb-3 rounded-xl overflow-hidden border border-[#243989]/12 shadow-md bg-white shrink-0 max-h-[35%]">
                      <img src={content.illustration} alt="" className="w-full h-full object-contain" draggable={false} />
                    </figure>
                  )}

                  {slice.pageTitle && content?.pageType === 'article' && slice.sliceIndex === 0 && (
                    <h1 className="text-lg font-bold text-[#243989] border-b-2 border-[#243989]/12 pb-2 mb-3 shrink-0">
                      {slice.pageTitle}
                    </h1>
                  )}

                  <div className="flex-1 min-h-0 space-y-3 overflow-hidden">
                    {slice.blocks.map((block, i) => {
                      if (block.type === 'title' || block.type === 'heading') {
                        return (
                          <h2 key={i} className="text-base font-bold text-[#3A52A8] mt-1 flex items-center gap-2 line-clamp-2">
                            <span className="w-1 h-4 bg-[#B5E846] rounded-full shrink-0" />
                            {block.text}
                          </h2>
                        );
                      }
                      return (
                        <p key={i} className="text-sm text-[#334155] leading-[1.85] text-justify line-clamp-[8]">
                          {block.text}
                        </p>
                      );
                    })}

                    {slice.blocks.length === 0 && slice.sliceIndex === 0 && !content?.illustration && (
                      <p className="text-sm text-slate-400 text-center py-12">
                        {lang === 'tn' ? 'صفحة غلاف أو رسومية' : 'Cover or graphic page'}
                      </p>
                    )}
                  </div>

                  {slice.sliceCount > 1 && (
                    <p className="shrink-0 text-center text-[9px] text-[#243989]/40 pt-2 tabular-nums">
                      {slice.sliceIndex + 1} / {slice.sliceCount}
                    </p>
                  )}
                </article>
              )}
            </>
          ) : (
            <div className="h-full bg-[#faf8f4] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
