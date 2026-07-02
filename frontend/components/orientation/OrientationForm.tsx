'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, GraduationCap, Brain, MapPin, CheckCircle, Home } from 'lucide-react';
import { postOrientationRecommend } from '@/lib/orientation-api';
import {
  BAC_TYPES, TUNISIAN_CITIES, INTEREST_SUGGESTIONS, buildSubjectsPayload,
  type BacTypeValue, type OrientationScoreResult,
} from '@/lib/orientation-config';
import type { CalculatorState } from '@/components/calculator/BacCalculator';

interface PsychometricProfile {
  scores: Record<string, number>;
  holland_code: string;
  dominant_code?: string;
}

interface Props {
  embedded?: boolean;
  initialAverage?: number;
  calculatorState?: CalculatorState | null;
  orientationScore?: number | null;
  scoreBreakdown?: OrientationScoreResult | null;
  /** @deprecated utiliser orientationScore */
  fgSubjectMean?: number | null;
  resultsPath?: string;
  psychometricTestPath?: string;
  forceDark?: boolean;
  variant?: 'default' | 'brand';
}

export default function OrientationForm({
  embedded,
  initialAverage,
  calculatorState,
  orientationScore: orientationScoreProp,
  scoreBreakdown,
  fgSubjectMean,
  resultsPath = '/results',
  psychometricTestPath = '/psychometric-test',
  forceDark = false,
  variant = 'default',
}: Props) {
  const { t, currentLanguage, isRTL } = useLanguage();
  const { isDark: themeDark } = useTheme();
  const isBrand = variant === 'brand';
  const isDark = !isBrand && (forceDark || themeDark);
  const orientationScore = orientationScoreProp
    ?? calculatorState?.orientationScore
    ?? fgSubjectMean
    ?? null;
  const router = useRouter();
  const lang = currentLanguage;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [psychometricProfile, setPsychometricProfile] = useState<PsychometricProfile | null>(null);
  const [formData, setFormData] = useState({
    bacType: calculatorState?.bacType ?? 'Science',
    bacAverage: calculatorState?.average != null
      ? String(calculatorState.average)
      : initialAverage != null
        ? String(initialAverage)
        : '',
    homeRegion: 'Tunis',
    preferredRegions: [] as string[],
    interests: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('psychometricProfile');
    if (!stored) return;
    try {
      setPsychometricProfile(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (calculatorState) {
      setFormData((f) => ({
        ...f,
        bacType: calculatorState.bacType,
        bacAverage: calculatorState.average != null ? String(calculatorState.average) : f.bacAverage,
      }));
    } else if (initialAverage != null) {
      setFormData((f) => ({ ...f, bacAverage: String(initialAverage) }));
    }
  }, [calculatorState, initialAverage]);

  const getBacTypeLabel = (value: string) => {
    const bacType = BAC_TYPES.find((b) => b.value === value);
    if (!bacType) return value;
    if (lang === 'tn') return bacType.labelAr;
    if (lang === 'en') return bacType.labelEn;
    return bacType.labelFr;
  };

  const toggleInterest = (interest: string) => {
    const list = formData.interests.split(',').map((i) => i.trim()).filter(Boolean);
    if (list.includes(interest)) {
      setFormData({ ...formData, interests: list.filter((i) => i !== interest).join(', ') });
    } else {
      setFormData({ ...formData, interests: [...list, interest].join(', ') });
    }
  };

  const togglePreferredRegion = (region: string) => {
    setFormData((f) => {
      const has = f.preferredRegions.includes(region);
      return {
        ...f,
        preferredRegions: has
          ? f.preferredRegions.filter((r) => r !== region)
          : [...f.preferredRegions, region],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const interestList = formData.interests.split(',').map((i) => i.trim()).filter(Boolean);
      const preferredRegions = formData.preferredRegions.length
        ? formData.preferredRegions
        : [formData.homeRegion];

      const subjects = calculatorState
        ? buildSubjectsPayload(calculatorState.subjects, calculatorState.bacType, {
            sportDispensed: calculatorState.sportDispensed,
          })
        : undefined;

      const data = await postOrientationRecommend({
        bacType: formData.bacType,
        bacAverage: parseFloat(formData.bacAverage),
        region: formData.homeRegion,
        homeRegion: formData.homeRegion,
        preferredRegions,
        includeAlternativeRegions: true,
        interests: interestList,
        psychoVector: psychometricProfile?.scores,
        subjects,
        orientationScoreFg: orientationScore ?? undefined,
        fgSubjectMean: orientationScore ?? undefined,
      });

      sessionStorage.setItem('bideya_recommendations', JSON.stringify(data.recommendations || []));
      sessionStorage.setItem('bideya_advisorSummary', data.advisorSummary || '');
      sessionStorage.setItem('bideya_studentId', data.student?.id || '');
      sessionStorage.setItem('bideya_sessionId', data.sessionId || '');
      sessionStorage.setItem('bideya_studentProfile', JSON.stringify({
        bacType: formData.bacType,
        bacAverage: parseFloat(formData.bacAverage),
        region: formData.homeRegion,
        homeRegion: formData.homeRegion,
        preferredRegions,
        interests: interestList,
        orientationScoreFg: orientationScore ?? undefined,
        fgSubjectMean: orientationScore ?? undefined,
      }));
      if (data.trace) {
        sessionStorage.setItem('bideya_ai_trace', JSON.stringify(data.trace));
      }

      router.push(resultsPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const labelCls = isBrand
    ? 'text-sm font-medium text-[#243989]'
    : `text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`;

  const inputCls = isBrand
    ? 'w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#243989]/30 focus:border-[#243989] outline-none bg-white border-gray-300 text-gray-900'
    : `w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 outline-none ${
        isDark ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
      }`;

  const readonlyCls = `${inputCls} bg-gray-50 cursor-default`;

  const chipCls = (selected: boolean) =>
    selected
      ? isBrand ? 'bg-[#B5E846] text-[#243989] font-medium' : 'bg-yellow-500 text-[#013069] font-medium'
      : isBrand ? 'bg-[#243989]/5 text-[#243989]/80 border border-[#243989]/15' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600';

  const pageShell = isBrand
    ? embedded ? '' : 'relative min-h-screen py-12 px-4 bg-gradient-to-br from-[#243989] via-[#3A52A8] to-[#4E6BC7] overflow-hidden'
    : embedded ? '' : `min-h-screen py-12 px-4 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`;

  const cardCls = isBrand
    ? 'p-8 rounded-3xl border shadow-2xl relative overflow-hidden bg-white/95 backdrop-blur border-white/20'
    : `p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  const regionHint = lang === 'tn'
    ? 'إذا score FG ما يكفيش في الولايات اللي تحبّهم، نعرضولك خيارات في ولايات أخرى. bonus +7% يتطبّق في ولاية الباك ولا الولاية المجاورة إذا الاختصاص ما فماش.'
    : lang === 'fr'
      ? 'Si votre score est insuffisant dans vos régions préférées, d\'autres régions seront aussi proposées. Le bonus +7 % s\'applique dans votre région de bac, ou dans la région voisine si la spécialité n\'y existe pas.'
      : 'If your score is not enough in preferred regions, other regions will also be shown. The +7% bonus applies in your bac region, or in the nearest region if the specialty is unavailable there.';

  return (
    <div className={pageShell} dir={isRTL ? 'rtl' : 'ltr'}>
      {isBrand && !embedded && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#B5E846] rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full filter blur-3xl" />
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${embedded ? '' : 'max-w-2xl'} mx-auto ${isBrand && !embedded ? 'relative z-10' : ''}`}>
        <div className={cardCls}>
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isBrand ? 'from-[#243989] to-[#B5E846]' : 'from-[#013069] to-yellow-500'}`} />

          {!embedded && (
            <div className="flex items-center gap-4 mb-8">
              <GraduationCap className={`w-8 h-8 ${isBrand ? 'text-[#243989]' : isDark ? 'text-yellow-400' : 'text-[#013069]'}`} />
              <h2 className={`text-2xl font-bold ${isBrand ? 'text-[#243989]' : isDark ? 'text-white' : 'text-[#013069]'}`}>
                {lang === 'tn' ? '10 اختيارات التوجيه' : lang === 'fr' ? 'Vos 10 choix' : 'Your 10 choices'}
              </h2>
            </div>
          )}

          {embedded && (
            <h2 className={`text-xl font-bold mb-6 ${isBrand ? 'text-[#243989]' : isDark ? 'text-white' : 'text-[#013069]'}`}>
              {lang === 'tn' ? 'الخطوة 2 — الولايات والاختيارات' : lang === 'fr' ? 'Étape 2 — Régions & choix' : 'Step 2 — Regions & choices'}
            </h2>
          )}

          {psychometricProfile && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
              isBrand ? 'bg-[#B5E846]/10 border-[#B5E846]/30' : isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'
            }`}>
              <CheckCircle className={`w-5 h-5 ${isBrand ? 'text-[#243989]' : 'text-green-500'}`} />
              <p className={`text-sm ${isBrand ? 'text-[#243989] font-medium' : isDark ? 'text-green-400' : 'text-green-700'}`}>
                RIASEC: {psychometricProfile.holland_code || psychometricProfile.dominant_code}
              </p>
            </div>
          )}

          {error && (
            <div className={`mb-6 p-4 rounded-xl border text-sm ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Scores from step 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>{t('form_bac_score')}</label>
                <input
                  type="number" step="0.01" min="0" max="20" required
                  value={formData.bacAverage}
                  onChange={(e) => setFormData({ ...formData, bacAverage: e.target.value })}
                  className={calculatorState ? readonlyCls : inputCls}
                  readOnly={Boolean(calculatorState)}
                />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>
                  {lang === 'tn' ? 'score FG (توجيه)' : lang === 'fr' ? 'Score FG (orientation)' : 'FG orientation score'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={orientationScore != null ? orientationScore.toFixed(2) : '—'}
                  className={readonlyCls}
                />
                {scoreBreakdown != null && scoreBreakdown.mentionBonus > 0 && (
                  <p className="text-xs text-gray-500">
                    {lang === 'fr'
                      ? `Base ${scoreBreakdown.fgBase.toFixed(2)} + bonus mention +${scoreBreakdown.mentionBonus.toFixed(2)} (+${Math.round(scoreBreakdown.mentionRate * 100)}%)`
                      : `Base ${scoreBreakdown.fgBase.toFixed(2)} + mention +${scoreBreakdown.mentionBonus.toFixed(2)} (+${Math.round(scoreBreakdown.mentionRate * 100)}%)`}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>{t('form_bac_type')}</label>
              {calculatorState ? (
                <input type="text" readOnly value={getBacTypeLabel(formData.bacType)} className={readonlyCls} />
              ) : (
                <select value={formData.bacType} onChange={(e) => setFormData({ ...formData, bacType: e.target.value as BacTypeValue })} className={inputCls}>
                  {BAC_TYPES.map((b) => <option key={b.value} value={b.value}>{getBacTypeLabel(b.value)}</option>)}
                </select>
              )}
            </div>

            {/* Home region (bac) */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 ${labelCls}`}>
                <Home className="w-4 h-4" />
                {lang === 'tn' ? 'ولاية الباك (المنطقة الأصلية)' : lang === 'fr' ? 'Gouvernorat du bac (région d\'origine)' : 'Bac governorate (home region)'}
              </label>
              <select
                value={formData.homeRegion}
                onChange={(e) => setFormData({ ...formData, homeRegion: e.target.value })}
                className={inputCls}
                required
              >
                {TUNISIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Preferred study regions (multi) */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 ${labelCls}`}>
                <MapPin className="w-4 h-4" />
                {lang === 'tn' ? 'الولايات اللي تحب تدرس فيها (برشا)' : lang === 'fr' ? 'Régions préférées pour étudier (plusieurs)' : 'Preferred study regions (multiple)'}
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                {TUNISIAN_CITIES.map((city) => {
                  const selected = formData.preferredRegions.includes(city);
                  return (
                    <button key={city} type="button" onClick={() => togglePreferredRegion(city)}
                      className={`px-3 py-1.5 rounded-full text-sm ${chipCls(selected)}`}>
                      {city}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                {formData.preferredRegions.length === 0
                  ? (lang === 'tn' ? 'إذا ما اخترتش، نستعملوا ولاية الباك فقط.' : lang === 'fr' ? 'Si aucune sélection, la région du bac sera utilisée.' : 'If none selected, your bac region will be used.')
                  : `${formData.preferredRegions.length} ${lang === 'tn' ? 'ولاية محددة' : lang === 'fr' ? 'région(s) sélectionnée(s)' : 'region(s) selected'}`}
              </p>
            </div>

            <p className="text-xs text-gray-500 bg-[#243989]/5 border border-[#243989]/10 rounded-xl px-4 py-3">{regionHint}</p>

            <div className="space-y-2">
              <label className={labelCls}>{t('form_interests')}</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_SUGGESTIONS.map((interest) => {
                  const selected = formData.interests.toLowerCase().includes(interest.toLowerCase());
                  return (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm ${chipCls(selected)}`}>
                      {interest}
                    </button>
                  );
                })}
              </div>
              <input type="text" value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} className={inputCls} />
            </div>

            <button type="submit" disabled={loading || !formData.bacAverage}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl disabled:opacity-60 ${
                isBrand
                  ? 'bg-[#B5E846] text-[#243989] hover:bg-[#9FD42E] shadow-lg shadow-[#B5E846]/20'
                  : 'bg-gradient-to-r from-[#013069] to-yellow-500 text-white'
              }`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />}
              {lang === 'tn' ? 'جيب 10 توصيات' : lang === 'fr' ? 'Obtenir mes 10 choix' : 'Get my 10 choices'}
            </button>
          </form>

          {!psychometricProfile && (
            <button type="button" onClick={() => router.push(psychometricTestPath)}
              className={`mt-4 w-full text-sm flex items-center justify-center gap-2 ${
                isBrand ? 'text-[#243989]/70 hover:text-[#243989]' : 'text-indigo-400 hover:text-indigo-300'
              }`}>
              <Brain className="w-4 h-4" />
              {lang === 'tn' ? 'اختبار RIASEC' : lang === 'fr' ? 'Test psychométrique RIASEC' : 'RIASEC psychometric test'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
