'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Calculator } from 'lucide-react';
import {
  BAC_TYPES, SUBJECTS_BY_BAC, computeBacAverage, computeOrientationScore,
  getAverageBreakdown, getSubjectLabel, isBacCalculatorComplete, isDispensableSportField,
  sectionHasDispensableSport,
  type BacCalcOptions, type BacTypeValue, type OrientationScoreResult,
} from '@/lib/orientation-config';

export interface CalculatorState {
  bacType: BacTypeValue;
  subjects: Record<string, string>;
  average: number | null;
  sportDispensed?: boolean;
  orientationScore: number | null;
  orientationScoreBreakdown: OrientationScoreResult | null;
}

interface Props {
  onChange?: (state: CalculatorState) => void;
  compact?: boolean;
  /** default = tokens app | light = carte blanche | dark = carte sombre v2 | brand = charte accueil */
  variant?: 'default' | 'light' | 'dark' | 'brand';
}

export default function BacCalculator({ onChange, compact, variant = 'default' }: Props) {
  const { currentLanguage, isRTL } = useLanguage();
  const lang = currentLanguage as 'tn' | 'fr' | 'en';
  const light = variant === 'light' || variant === 'brand';
  const dark = variant === 'dark';

  const [bacType, setBacType] = useState<BacTypeValue>('Math');
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [sportDispensed, setSportDispensed] = useState(false);

  const calcOptions: BacCalcOptions = useMemo(
    () => ({ sportDispensed }),
    [sportDispensed]
  );

  const labels = {
    title: lang === 'tn' ? 'حاسبة المعدل و score FG' : lang === 'fr' ? 'Calculateur moyenne & score FG' : 'Average & FG score calculator',
    section: lang === 'tn' ? 'الشعبة' : lang === 'fr' ? 'Section' : 'Section',
    average: lang === 'tn' ? 'المعدل العام (MG)' : lang === 'fr' ? 'Moyenne générale (MG)' : 'General average (MG)',
    fgScore: lang === 'tn' ? 'score FG' : lang === 'fr' ? 'Score' : 'Score',
    fgAvecGeo: lang === 'tn' ? 'score FG مع +7%' : lang === 'fr' ? 'Score avec +7%' : 'Score with +7%',
    breakdown: lang === 'tn' ? 'التفاصيل' : lang === 'fr' ? 'Détail' : 'Breakdown',
    coef: lang === 'tn' ? 'معامل' : lang === 'fr' ? 'Coef.' : 'Coef.',
    grade: lang === 'tn' ? 'النقطة' : lang === 'fr' ? 'Note' : 'Grade',
    sportDispensed: lang === 'tn'
      ? 'معفى(ة) من التربية البدنية'
      : lang === 'fr'
        ? 'Je suis dispensé(e) du sport'
        : 'I am exempt from PE',
    sportDispensedHint: lang === 'tn'
      ? 'معامل التربية البدنية ما يتحسبش في المعدل'
      : lang === 'fr'
        ? 'Le coefficient EPS est exclu du calcul de la moyenne'
        : 'PE coefficient is excluded from the average',
    optionalHint: lang === 'tn'
      ? 'إضافة نقاط فوق 10 فقط، بدون معامل في المقام'
      : lang === 'fr'
        ? 'Option : seuls les points au-dessus de 10 s\'ajoutent, sans coefficient au dénominateur'
        : 'Optional: only points above 10 are added, not counted in the denominator',
  };

  const subjectFields = SUBJECTS_BY_BAC[bacType];
  const showSportCheckbox = sectionHasDispensableSport(bacType);
  const average = useMemo(
    () => computeBacAverage(subjects, bacType, calcOptions),
    [subjects, bacType, calcOptions]
  );
  const scoreBreakdown = useMemo(
    () => computeOrientationScore(subjects, bacType, average, calcOptions),
    [subjects, bacType, average, calcOptions]
  );
  const breakdown = useMemo(
    () => getAverageBreakdown(subjects, bacType, calcOptions),
    [subjects, bacType, calcOptions]
  );
  const isComplete = useMemo(
    () => isBacCalculatorComplete(subjects, bacType, calcOptions),
    [subjects, bacType, calcOptions]
  );

  const getBacLabel = (value: BacTypeValue) => {
    const b = BAC_TYPES.find((x) => x.value === value);
    if (!b) return value;
    return lang === 'tn' ? b.labelAr : lang === 'en' ? b.labelEn : b.labelFr;
  };

  const emitChange = (
    nextType: BacTypeValue,
    nextSubjects: Record<string, string>,
    nextSportDispensed: boolean
  ) => {
    const options: BacCalcOptions = { sportDispensed: nextSportDispensed };
    const avg = computeBacAverage(nextSubjects, nextType, options);
    const fg = computeOrientationScore(nextSubjects, nextType, avg, options);
    onChange?.({
      bacType: nextType,
      subjects: nextSubjects,
      average: avg,
      sportDispensed: nextSportDispensed,
      orientationScore: fg?.orientationScore ?? null,
      orientationScoreBreakdown: fg,
    });
  };

  const updateSubjects = (nextSubjects: Record<string, string>) => {
    setSubjects(nextSubjects);
    emitChange(bacType, nextSubjects, sportDispensed);
  };

  const updateBacType = (nextType: BacTypeValue) => {
    setBacType(nextType);
    setSubjects({});
    setSportDispensed(false);
    emitChange(nextType, {}, false);
  };

  const toggleSportDispensed = (checked: boolean) => {
    setSportDispensed(checked);
    emitChange(bacType, subjects, checked);
  };

  const selectCls = light
    ? 'w-full rounded-xl bg-white border border-gray-300 text-gray-900 px-4 py-3 mb-4 focus:ring-2 focus:ring-[#243989]/30 focus:border-[#243989] outline-none'
    : dark
      ? 'w-full rounded-xl bg-gray-900 border border-gray-600 text-white px-4 py-3 mb-4 focus:ring-2 focus:ring-[#B5E846]/50 outline-none'
      : 'w-full rounded-xl bg-surface border border-border px-4 py-3 mb-4';

  const inputCls = (disabled?: boolean) => [
    'w-20 shrink-0 rounded-lg px-2 py-1.5 text-center text-sm',
    disabled ? 'opacity-40 cursor-not-allowed' : '',
    light
      ? 'bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#243989]/30 focus:border-[#243989] outline-none'
      : dark
        ? 'bg-gray-900 border border-gray-600 text-white focus:ring-2 focus:ring-[#B5E846]/50 outline-none'
        : 'bg-surface border border-border',
  ].join(' ');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={compact ? '' : 'space-y-6'}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${light ? 'bg-[#243989]/10' : dark ? 'bg-[#B5E846]/15' : 'bg-cyan-500/20'}`}>
          <Calculator className={`w-5 h-5 ${light ? 'text-[#243989]' : dark ? 'text-[#B5E846]' : 'text-cyan-400'}`} />
        </div>
        <h2 className={`text-xl font-bold ${light ? 'text-[#243989]' : dark ? 'text-white' : ''}`}>{labels.title}</h2>
      </div>

      <select
        value={bacType}
        onChange={(e) => updateBacType(e.target.value as BacTypeValue)}
        className={selectCls}
      >
        {BAC_TYPES.map((b) => (
          <option key={b.value} value={b.value}>{getBacLabel(b.value)}</option>
        ))}
      </select>

      {showSportCheckbox && (
        <label className={`flex items-start gap-3 mb-4 p-3 rounded-xl cursor-pointer ${
          light ? 'bg-amber-50 border border-amber-200' : dark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-500/10 border border-amber-500/20'
        }`}>
          <input
            type="checkbox"
            checked={sportDispensed}
            onChange={(e) => toggleSportDispensed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#243989] focus:ring-[#243989]/30"
          />
          <span>
            <span className={`block text-sm font-semibold ${light ? 'text-gray-900' : dark ? 'text-white' : ''}`}>
              {labels.sportDispensed}
            </span>
            <span className={`block text-xs mt-0.5 ${light ? 'text-gray-600' : dark ? 'text-gray-400' : 'text-muted'}`}>
              {labels.sportDispensedHint}
            </span>
          </span>
        </label>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        {subjectFields.map((field) => {
          const isSportExcluded = sportDispensed && isDispensableSportField(field, bacType);
          const isOptional = field.optionBonus || field.key === 'optional';
          return (
            <div
              key={field.key}
              className={`flex items-center gap-2 min-w-0 ${isSportExcluded ? 'opacity-50' : ''}`}
            >
              <span className={`flex-1 text-sm truncate ${light ? 'text-gray-800 font-medium' : dark ? 'text-gray-200 font-medium' : ''}`}>
                {getSubjectLabel(field, lang)}
              </span>
              <span className={`text-xs shrink-0 tabular-nums ${light ? 'text-[#243989]/70 font-semibold' : dark ? 'text-[#B5E846]/90 font-semibold' : 'text-muted'}`}>
                {isOptional ? '—' : `×${field.coefficient}`}
              </span>
              <input
                type="number" min={0} max={20} step={0.01}
                placeholder="—"
                disabled={isSportExcluded}
                value={subjects[field.key] || ''}
                onChange={(e) => updateSubjects({ ...subjects, [field.key]: e.target.value })}
                className={inputCls(isSportExcluded)}
              />
            </div>
          );
        })}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl text-center ${
          light
            ? 'bg-[#243989]/5 border border-[#243989]/15'
            : dark
              ? 'bg-gray-900/80 border border-gray-600'
              : 'bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20'
        }`}>
          <p className={`text-sm mb-1 ${light ? 'text-gray-600 font-medium' : dark ? 'text-gray-300 font-medium' : 'text-muted'}`}>{labels.average}</p>
          <p className={`text-3xl font-black ${light ? 'text-[#243989]' : dark ? 'text-[#B5E846]' : 'text-primary'}`} dir="ltr">
            {average != null ? (
              <>
                {average.toFixed(2)}
                <span className={`text-base font-normal ${light ? 'text-gray-500' : dark ? 'text-gray-400' : 'text-muted'}`}> / 20</span>
              </>
            ) : (
              <span className={light ? 'text-gray-400' : dark ? 'text-gray-500' : 'text-muted'}>—</span>
            )}
          </p>
        </div>
        <div className={`p-5 rounded-2xl text-center ${
          light
            ? 'bg-[#243989]/5 border border-[#243989]/15'
            : dark
              ? 'bg-gray-900/80 border border-gray-600'
              : 'bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20'
        }`}>
          <p className={`text-sm mb-1 ${light ? 'text-gray-600 font-medium' : dark ? 'text-gray-300 font-medium' : 'text-muted'}`}>{labels.fgScore}</p>
          <p className={`text-3xl font-black ${light ? 'text-[#243989]' : dark ? 'text-[#B5E846]' : 'text-primary'}`} dir="ltr">
            {isComplete && scoreBreakdown != null ? scoreBreakdown.orientationScore.toFixed(2) : <span className={light ? 'text-gray-400' : dark ? 'text-gray-500' : 'text-muted'}>—</span>}
          </p>
        </div>
        <div className={`p-5 rounded-2xl text-center ${
          light
            ? 'bg-[#B5E846]/10 border border-[#B5E846]/30'
            : dark
              ? 'bg-[#B5E846]/10 border border-[#B5E846]/30'
              : 'bg-gradient-to-br from-[#B5E846]/10 to-primary/10 border border-[#B5E846]/20'
        }`}>
          <p className={`text-sm mb-1 ${light ? 'text-gray-600 font-medium' : dark ? 'text-gray-300 font-medium' : 'text-muted'}`}>{labels.fgAvecGeo}</p>
          <p className={`text-3xl font-black ${light ? 'text-[#243989]' : dark ? 'text-[#B5E846]' : 'text-primary'}`} dir="ltr">
            {isComplete && scoreBreakdown != null ? scoreBreakdown.orientationScoreWithGeo.toFixed(2) : <span className={light ? 'text-gray-400' : dark ? 'text-gray-500' : 'text-muted'}>—</span>}
          </p>
        </div>
      </div>

      {breakdown.lines.length > 0 && !compact && (
        <div className={`rounded-xl border overflow-hidden text-sm mt-4 ${light ? 'border-gray-200' : dark ? 'border-gray-600' : 'border-border'}`}>
          <table className="w-full">
            <thead className={light ? 'bg-gray-50 text-gray-700' : dark ? 'bg-gray-900 text-gray-300' : 'bg-surface/80'}>
              <tr>
                <th className={`p-2 ${isRTL ? 'text-right' : 'text-left'}`}>{labels.section}</th>
                <th className="p-2">{labels.grade}</th>
                <th className="p-2">{labels.coef}</th>
              </tr>
            </thead>
            <tbody className={light ? 'text-gray-800' : dark ? 'text-gray-200' : ''}>
              {breakdown.lines.map((line) => {
                const field = subjectFields.find((f) => f.key === line.subject);
                return (
                  <tr key={line.subject} className={light ? 'border-t border-gray-100' : dark ? 'border-t border-gray-700' : 'border-t border-border/50'}>
                    <td className="p-2">{field ? getSubjectLabel(field, lang) : line.subject}</td>
                    <td className="p-2 text-center tabular-nums">{line.grade}</td>
                    <td className="p-2 text-center tabular-nums">{line.coefficient}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
