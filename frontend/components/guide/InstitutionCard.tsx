'use client';

import { MapPin, Hash, Users, GraduationCap } from 'lucide-react';
import type { InstitutionRecord } from '@/lib/guide-institution-parser';

type Lang = 'tn' | 'fr' | 'en';

const L: Record<Lang, Record<string, string>> = {
  tn: {
    specialty: 'الاختصاص',
    city: 'الولاية',
    code: 'كود التوجيه',
    capacity: 'عدد البلاصات',
    bacSection: 'شعبة الباك',
    formula: 'المعادلة',
    lastScore: 'آخر معدل موجّه',
    places: 'بلاصة',
    noScore: '—',
    admissionTitle: 'شروط القبول حسب الشعبة',
  },
  fr: {
    specialty: 'Spécialité',
    city: 'Gouvernorat',
    code: 'Code orientation',
    capacity: 'Places disponibles',
    bacSection: 'Section bac',
    formula: 'Formule FG',
    lastScore: 'Dernier score',
    places: 'places',
    noScore: '—',
    admissionTitle: 'Admission par section',
  },
  en: {
    specialty: 'Specialty',
    city: 'Region',
    code: 'Orientation code',
    capacity: 'Available seats',
    bacSection: 'Bac section',
    formula: 'FG formula',
    lastScore: 'Last admitted score',
    places: 'seats',
    noScore: '—',
    admissionTitle: 'Admission by section',
  },
};

export default function InstitutionCard({
  data,
  lang,
  index,
  compact = false,
  fill = false,
  stacked = false,
}: {
  data: InstitutionRecord;
  lang: Lang;
  index: number;
  compact?: boolean;
  fill?: boolean;
  stacked?: boolean;
}) {
  const t = L[lang];
  const firstScore = data.admissions.find((a) => a.lastScore)?.lastScore;
  const admissionRows = stacked && data.admissions.length > 4
    ? data.admissions.slice(0, 4)
    : data.admissions;
  const showSpecialty = Boolean(data.specialty && data.specialty !== data.name);

  return (
    <article
      className={`institution-card rounded-xl border-2 border-[#243989]/12 bg-white shadow-md overflow-hidden ${compact ? 'text-[13px]' : ''} ${stacked ? 'flex-1 min-h-0 flex flex-col' : ''} ${fill && !stacked ? 'h-full flex flex-col' : ''}`}
      aria-label={data.name}
    >
      <header className={`bg-gradient-to-l from-[#243989] via-[#3A52A8] to-[#243989] text-white shrink-0 ${stacked ? 'px-2.5 py-2' : compact ? 'px-3 py-2.5' : 'px-4 py-3.5'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`shrink-0 rounded bg-[#B5E846] text-[#243989] flex items-center justify-center font-black ${stacked ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'}`}>
                {index + 1}
              </span>
            </div>
            {showSpecialty && (
              <p className={`text-[#B5E846] font-semibold leading-snug mb-1 ${stacked ? 'text-[10px] line-clamp-2' : compact ? 'text-[11px] line-clamp-2' : 'text-xs line-clamp-3'}`}>
                {data.specialty}
              </p>
            )}
            <h3 className={`font-bold leading-snug ${stacked ? 'text-[11px] line-clamp-2' : compact ? 'text-[13px] line-clamp-2' : 'text-base line-clamp-3'}`}>
              {data.name}
            </h3>
          </div>
          {firstScore && (
            <div className={`shrink-0 text-center bg-[#B5E846] rounded-lg ${stacked ? 'px-1 py-0.5 min-w-[46px]' : compact ? 'px-1.5 py-1 min-w-[52px]' : 'px-2 py-1.5 min-w-[64px]'}`}>
              <div className="text-[7px] font-bold text-[#243989]/70 uppercase leading-none">{t.lastScore}</div>
              <div className={`font-black text-[#243989] tabular-nums leading-tight ${stacked ? 'text-xs' : compact ? 'text-sm' : 'text-lg'}`}>{firstScore}</div>
            </div>
          )}
        </div>
      </header>

      {(data.city || data.orientationCode) && (
        <div className={`flex flex-wrap gap-x-2 gap-y-0.5 bg-[#f0f4fa] border-b border-[#243989]/10 text-[#334155] shrink-0 ${stacked ? 'px-2 py-1 text-[9px]' : compact ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-xs'}`}>
          {data.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#243989]" />
              <strong className="text-[#243989]/60">{t.city}:</strong> {data.city}
            </span>
          )}
          {data.orientationCode && (
            <span className="inline-flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#243989]" />
              <strong className="text-[#243989]/60">{t.code}:</strong> {data.orientationCode}
            </span>
          )}
        </div>
      )}

      {data.admissions.length > 0 && (
        <div className={`${stacked ? 'p-1.5' : compact ? 'p-2' : 'p-3'} ${(fill || stacked) ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
          <div className="flex items-center gap-1 mb-1 px-0.5 shrink-0">
            <GraduationCap className={`text-[#243989] ${stacked ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
            <span className={`font-bold text-[#243989] ${stacked ? 'text-[9px]' : compact ? 'text-[10px]' : 'text-xs'}`}>{t.admissionTitle}</span>
          </div>

          <div className={`rounded-lg border border-[#243989]/10 overflow-hidden ${(fill || stacked) ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>
            <div className={`grid grid-cols-[1fr_auto] bg-[#243989]/8 font-bold text-[#243989]/70 uppercase ${stacked ? 'px-1.5 py-0.5 text-[8px]' : compact ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]'}`}>
              <span>{t.bacSection}</span>
              <span>{t.lastScore}</span>
            </div>
            {admissionRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto] items-center gap-1 ${stacked ? 'px-1.5 py-1' : compact ? 'px-2 py-2' : 'px-3 py-2.5'} ${i % 2 === 0 ? 'bg-white' : 'bg-[#faf8f4]'}`}
              >
                <div className="min-w-0">
                  <p className={`font-semibold text-[#243989] leading-snug line-clamp-1 ${stacked ? 'text-[10px]' : compact ? 'text-xs' : 'text-sm'}`}>{row.bacSection}</p>
                  {row.formula && !stacked && (
                    <p className={`text-slate-500 mt-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
                      {t.formula}: <code className="text-[#3A52A8] font-semibold">{row.formula}</code>
                    </p>
                  )}
                </div>
                <span className={`shrink-0 text-center rounded-lg bg-[#B5E846]/25 border border-[#B5E846]/40 text-[#243989] font-black tabular-nums ${stacked ? 'min-w-[48px] px-1 py-0.5 text-xs' : compact ? 'min-w-[56px] px-1.5 py-0.5 text-sm' : 'min-w-[72px] px-2 py-1 text-base'}`}>
                  {row.lastScore ?? t.noScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
