'use client';

import { Award, BarChart3, MapPin, Table2, Target, TrendingUp } from 'lucide-react';
import { getRecommendationDisplay } from '@/lib/recommendation-display';
import {
  formatFgGap,
  getComparisonStatusLabel,
  getFgComparison,
  getFgLabels,
  getStudentFgBase,
  getStudentFgWithBonus,
  type InstitutionRec,
} from '@/lib/recommendation-insights';

type Lang = 'tn' | 'fr' | 'en';

type Row = InstitutionRec & {
  score: number;
  risk_tier?: 'Safe' | 'Likely' | 'Reach';
  institution?: string;
  university?: string;
  specialty?: string;
  field?: string;
  id?: string;
  programId?: string;
  admission_probability?: number;
  admissionProbability?: number;
  bonus_applied?: boolean | null;
};

type RiskTierInput = {
  risk_tier?: 'Safe' | 'Likely' | 'Reach';
  admission_probability?: number;
  admissionProbability?: number;
};

const STATUS_STYLES = {
  above: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  within: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  below: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  unknown: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
} as const;

const GAP_STYLES = {
  above: 'text-emerald-400',
  within: 'text-cyan-400',
  below: 'text-amber-400',
  unknown: 'text-slate-500',
} as const;

const CARD_BORDER = {
  above: 'border-emerald-500/15 hover:border-emerald-500/30',
  within: 'border-cyan-500/15 hover:border-cyan-500/30',
  below: 'border-amber-500/15 hover:border-amber-500/30',
  unknown: 'border-slate-800 hover:border-slate-700',
} as const;

type Props = {
  recommendations: Row[];
  studentFg: number | null;
  lang: Lang;
  riskLabel: (tier: string) => string;
  getRiskTier: (rec: RiskTierInput) => 'Safe' | 'Likely' | 'Reach';
  onSelectRecommendation?: (rec: Row) => void;
};

export default function ResultsComparisonTable({
  recommendations,
  studentFg,
  lang,
  riskLabel,
  getRiskTier,
  onSelectRecommendation,
}: Props) {
  const fgLabels = getFgLabels(lang);
  const l = lang;

  const labels = {
    title: l === 'tn' ? 'مقارنة معدل الصيغة الإجمالية (FG) مع الدليل الرسمي' : l === 'fr' ? 'Comparatif FG — Guide officiel' : 'FG comparison — Official guide',
    subtitle: l === 'tn'
      ? 'مقارنة معدلك العام مع معدل آخر شخص تم قبوله في كل مؤسسة جامعية'
      : l === 'fr'
        ? "Votre score FG comparé au dernier admis par établissement (données du guide d'orientation)"
        : 'Your FG score vs last admitted per institution (orientation guide data)',
    match: l === 'tn' ? 'توافق' : l === 'fr' ? 'Compatibilité' : 'Match',
    verdict: l === 'tn' ? 'الحكم' : l === 'fr' ? 'Verdict' : 'Verdict',
    source: l === 'tn' ? 'المصدر: دليل التوجيه الجامعي التونسي' : l === 'fr' ? "Source : Guide officiel de l'orientation universitaire" : 'Source: Official Tunisian orientation guide',
  };

  const formatFg = (v: number | null | undefined) => (v != null ? v.toFixed(2) : '-');

  const rows = recommendations.map((rec, idx) => {
    const display = getRecommendationDisplay(rec, lang);
    const fgBase = getStudentFgBase(rec, studentFg);
    const fgBonus = getStudentFgWithBonus(rec, studentFg);
    const comparison = getFgComparison(
      fgBonus,
      rec.admission_score_last,
      rec.admission_score_min,
      l,
    );
    const tier = getRiskTier(rec);
    const hasGeoBonus =
      (rec.geographic_bonus_applied || rec.bonus_applied) && fgBase != null && fgBonus != null && fgBase !== fgBonus;

    return {
      rec,
      idx,
      display,
      fgBase,
      fgBonus,
      comparison,
      tier,
      hasGeoBonus,
    };
  });

  return (
    <section className="mb-10 rounded-2xl border border-indigo-500/10 bg-slate-950 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-900 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Table2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{labels.title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">{labels.subtitle}</p>
        </div>
        {studentFg != null && (
          <div className="sm:text-right shrink-0 px-4 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/10 self-start sm:self-auto">
            <p className="text-[10px] text-yellow-400/80 uppercase font-bold tracking-wider leading-none mb-1">{fgLabels.your}</p>
            <p className="text-xl font-black text-yellow-400 tabular-nums leading-none">{formatFg(studentFg)}</p>
          </div>
        )}
      </div>

      {/* Unified List of Cards for both mobile and desktop */}
      <div className="space-y-3.5">
        {rows.map(({ rec, idx, display, fgBase, fgBonus, comparison, tier, hasGeoBonus }) => {
          const verdictLabel = getComparisonStatusLabel(comparison.status, l);
          
          return (
            <article
              key={rec.id || rec.programId || idx}
              onClick={() => onSelectRecommendation?.(rec)}
              className={`group relative rounded-xl border bg-slate-900/45 hover:bg-slate-900/70 p-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${CARD_BORDER[comparison.status]}`}
            >
              {/* Institution and Specialty Info */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm font-black text-indigo-300 tabular-nums group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-base leading-snug group-hover:text-indigo-400 transition-colors">
                    {display.title}
                  </h4>
                  {display.subtitle && (
                    <p className="text-xs text-indigo-300/85 mt-1 font-medium">{display.subtitle}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {rec.city && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/60 text-[10px] text-slate-400 border border-slate-900">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                        {rec.city}
                      </span>
                    )}
                    {hasGeoBonus && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        +7% {l === 'tn' ? 'جغرافي' : l === 'fr' ? 'géo' : 'geo'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats and Badges */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-x-6 gap-y-3 pt-3 md:pt-0 border-t border-slate-900/50 md:border-t-0 shrink-0">
                {/* Score du dernier admis */}
                <div className="text-left md:text-center min-w-[90px]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">{fgLabels.last}</span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">{formatFg(rec.admission_score_last)}</span>
                </div>

                {/* Écart */}
                <div className="text-left md:text-center min-w-[70px]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">{fgLabels.gap}</span>
                  <span className={`text-sm font-bold tabular-nums ${GAP_STYLES[comparison.status]}`}>
                    {formatFgGap(comparison.gap)}
                  </span>
                </div>

                {/* Jugement / Verdict */}
                <div className="text-left md:text-center min-w-[100px]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1 md:mb-0.5">{labels.verdict}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLES[comparison.status]}`}>
                    {verdictLabel}
                  </span>
                </div>

                {/* Compatibilité */}
                <div className="text-right min-w-[75px]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">{labels.match}</span>
                  <span className="text-sm font-black text-indigo-400 tabular-nums">{Math.round(rec.score * 100)}%</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-slate-500">
        <span>{labels.source}</span>
        <span className="text-slate-600">
          {l === 'tn' ? 'اللون الأخضر = الصيغة الإجمالية (FG) مع بونوس التنفيل الجغرافي +7% · المقارنة مع عتبة آخر مقبول'
            : l === 'fr' ? 'Vert = FG avec bonif. +7% · Comparaison vs dernier admis'
            : 'Green = FG with +7% bonus · Compared vs last admitted'}
        </span>
      </div>
    </section>
  );
}
