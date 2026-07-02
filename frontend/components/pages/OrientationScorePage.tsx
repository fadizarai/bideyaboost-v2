'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import BacCalculator, { type CalculatorState } from '@/components/calculator/BacCalculator';
import OrientationForm from '@/components/orientation/OrientationForm';
import { computeOrientationScore, isBacCalculatorComplete } from '@/lib/orientation-config';
import { V2 } from '../../lib/routes';

function BrandCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden bg-white/95 backdrop-blur border-white/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#243989] to-[#B5E846]" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

function StepIndicator({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              active ? 'bg-[#B5E846] text-[#243989] border-[#B5E846]' :
              done ? 'bg-white/20 text-white border-white/40' :
              'bg-transparent text-white/50 border-white/25'
            }`}>
              {n}
            </div>
            <span className={`hidden sm:inline text-sm ${active ? 'text-white font-semibold' : 'text-white/60'}`}>
              {labels[i]}
            </span>
            {n < total && <div className="w-8 h-px bg-white/25 hidden sm:block" />}
          </div>
        );
      })}
    </div>
  );
}

export default function OrientationScorePage({ defaultSection }: { defaultSection?: 'calculator' | 'choix' }) {
  const { currentLanguage, isRTL } = useLanguage();
  const lang = currentLanguage as 'tn' | 'fr' | 'en';
  const [step, setStep] = useState<1 | 2>(defaultSection === 'choix' ? 2 : 1);
  const [calc, setCalc] = useState<CalculatorState | null>(null);

  const calcOptions = useMemo(
    () => (calc?.sportDispensed ? { sportDispensed: true } : undefined),
    [calc?.sportDispensed]
  );

  const orientationScore = useMemo(() => {
    if (!calc) return null;
    return calc.orientationScore
      ?? computeOrientationScore(calc.subjects, calc.bacType, calc.average, calcOptions)?.orientationScore
      ?? null;
  }, [calc, calcOptions]);

  const scoreBreakdown = useMemo(() => {
    if (!calc) return null;
    return calc.orientationScoreBreakdown
      ?? computeOrientationScore(calc.subjects, calc.bacType, calc.average, calcOptions);
  }, [calc, calcOptions]);

  const isCalcComplete = useMemo(() => {
    if (!calc) return false;
    return isBacCalculatorComplete(calc.subjects, calc.bacType, calcOptions);
  }, [calc, calcOptions]);

  const labels = {
    step1: lang === 'tn' ? 'المعدل والنقاط' : lang === 'fr' ? 'Moyenne & score' : 'Average & score',
    step2: lang === 'tn' ? 'المناطق والاختيارات' : lang === 'fr' ? 'Régions & choix' : 'Regions & choices',
    title: lang === 'tn' ? 'حساب المعدل و 10 اختيارات' : lang === 'fr' ? 'Calcule score & 10 choix' : 'Score & 10 choices',
    sub: lang === 'tn'
      ? 'احسب معدلك و score FG متاعك، بعدين اختار الولايات باش تجيك أحسن 10 توصيات'
      : lang === 'fr'
        ? 'Calculez votre moyenne et votre score, puis choisissez vos régions pour obtenir vos 10 meilleures recommandations'
        : 'Calculate your average and score, then choose your regions to get your top 10 recommendations',
    continue: lang === 'tn' ? 'كملّ — الولايات والاختيارات' : lang === 'fr' ? 'Continuer — Régions & choix' : 'Continue — Regions & choices',
    needAverage: lang === 'tn' ? 'دخل نقاط المواد FG باش تكمل' : lang === 'fr' ? 'Saisissez vos notes (matières FG) pour continuer' : 'Enter your grades (FG subjects) to continue',
    fgHint: lang === 'tn'
      ? 'score FG = 4×المعدل + معاملات المواد. النسخة مع +7% تتطبق حسب الولاية.'
      : lang === 'fr'
        ? 'Score FG = 4×moyenne + coef. matières. Le score avec +7% s\'applique selon la région.'
        : 'FG score = 4×average + subject coefs. Score with +7% applies by region.',
  };

  const canContinue = isCalcComplete && orientationScore != null;

  return (
    <div
      className="relative min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-[#243989] via-[#3A52A8] to-[#4E6BC7] overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#B5E846] rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full filter blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#B5E846] mb-2">
            {lang === 'tn' ? 'التوجيه الجامعي' : lang === 'fr' ? 'Orientation universitaire' : 'University orientation'}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{labels.title}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">{labels.sub}</p>
        </motion.div>

        <StepIndicator step={step} total={2} labels={[labels.step1, labels.step2]} />

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -30 : 30 }}
              className="space-y-6"
            >
              <BrandCard>
                <BacCalculator onChange={setCalc} variant="light" />
              </BrandCard>

              {isCalcComplete && (calc?.average != null || orientationScore != null) && (
                <BrandCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#243989]/10 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-[#243989]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#243989]">
                      {lang === 'tn' ? 'ملخص الخطوة 1' : lang === 'fr' ? 'Résumé étape 1' : 'Step 1 summary'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#243989]/5 border border-[#243989]/10 text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        {lang === 'tn' ? 'المعدل العام (MG)' : lang === 'fr' ? 'Moyenne générale (MG)' : 'General average (MG)'}
                      </p>
                      <p className="text-3xl font-black text-[#243989]" dir="ltr">
                        {calc?.average != null ? `${calc.average.toFixed(2)}/20` : '—'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#243989]/5 border border-[#243989]/10 text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        {lang === 'tn' ? 'score FG' : lang === 'fr' ? 'Score' : 'Score'}
                      </p>
                      <p className="text-3xl font-black text-[#243989]" dir="ltr">
                        {orientationScore != null ? orientationScore.toFixed(2) : '—'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#B5E846]/10 border border-[#B5E846]/30 text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        {lang === 'tn' ? 'score FG مع +7%' : lang === 'fr' ? 'Score avec +7%' : 'Score with +7%'}
                      </p>
                      <p className="text-3xl font-black text-[#243989]" dir="ltr">
                        {scoreBreakdown != null ? scoreBreakdown.orientationScoreWithGeo.toFixed(2) : '—'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">{labels.fgHint}</p>
                </BrandCard>
              )}

              <div className="text-center space-y-3">
                {!canContinue && (
                  <p className="text-sm text-white/70">{labels.needAverage}</p>
                )}
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#B5E846] text-[#243989] font-bold rounded-full hover:bg-[#9FD42E] transition-all shadow-lg shadow-[#B5E846]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {labels.continue}
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors mb-2"
              >
                <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                {lang === 'tn' ? 'العودة للحساب' : lang === 'fr' ? 'Retour au calcul' : 'Back to calculator'}
              </button>

              <OrientationForm
                embedded
                variant="brand"
                calculatorState={calc}
                orientationScore={orientationScore}
                scoreBreakdown={scoreBreakdown}
                resultsPath={V2.results}
                psychometricTestPath={V2.psychometric}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
