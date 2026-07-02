'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, ChevronRight, Award, Stethoscope, BookOpen, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MedicalPathModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PathId = 'medecine' | 'medecine_dentaire';

export default function MedicalPathModal({ isOpen, onClose }: MedicalPathModalProps) {
  const { currentLanguage, isRTL } = useLanguage();
  const [selectedPath, setSelectedPath] = useState<PathId>('medecine');

  // Translations
  const content = {
    title: {
      fr: "Comment devenir Médecin ou Dentiste en Tunisie ?",
      tn: "كيفاش نولي طبيب ولا طبيب أسنان في تونس ؟",
      en: "How to become a Medical Doctor or Dentist in Tunisia?"
    },
    subtitle: {
      fr: "Découvrez le parcours d'études médicales et dentaires.",
      tn: "اكتشف مسار الدراسات الطبية وطب الأسنان.",
      en: "Discover the pathway for medical and dental studies."
    },
    paths: {
      medecine: {
        title: { fr: "1. Médecine (Tunis, Sousse, Monastir, Sfax)", tn: "1. الطب (تونس، سوسة، المنستير، صفاقس)", en: "1. Medicine (Tunis, Sousse, Monastir, Sfax)" },
        shortName: { fr: "Médecine", tn: "الطب", en: "Medicine" },
        steps: [
          { name: { fr: "Baccalauréat", tn: "البكالوريا", en: "High School (Bac)" }, duration: "" },
          { name: { fr: "Études Médicales (5 ans)", tn: "الدراسات الطبية (5 سنين)", en: "Medical Studies (5 years)" }, desc: { fr: "1er et 2ème cycles (PCEM & DCEM).", tn: "المرحلة الأولى والثانية في كلية الطب.", en: "1st and 2nd cycles (PCEM & DCEM)." } },
          { name: { fr: "Internat (2 ans)", tn: "التربص الداخلي (عامين)", en: "Internship (2 years)" }, desc: { fr: "Stages cliniques obligatoires.", tn: "تربصات سريرية إجبارية في السبيطارات.", en: "Mandatory clinical rotations." } },
          { name: { fr: "Concours de Résidanat", tn: "مناظرة الإختصاص (Résidanat)", en: "Residency Exam" }, desc: { fr: "Pour se spécialiser (facultatif pour médecine de famille).", tn: "باش تولي طبيب مختص.", en: "For specialization (optional for family medicine)." } },
          { name: { fr: "Médecin (Généraliste ou Spécialiste)", tn: "طبيب (عام أو مختص)", en: "Doctor (General or Specialist)" }, icon: "badge" }
        ],
        details: {
          duration: { fr: "7 à 12 ans", tn: "من 7 إلى 12 سنة", en: "7 to 12 years" },
          difficulty: { fr: "Très Élevée (Score d'admission très haut)", tn: "عالية جدا (سكور الباك لازم يكون قوي برشا)", en: "Very High (Very high admission score required)" },
          pros: { fr: "Profession noble, sécurité de l'emploi, statut social.", tn: "مهنة نبيلة، خدمة مضمونة، ومكانة اجتماعية.", en: "Noble profession, job security, social status." },
          cons: { fr: "Études très longues et éprouvantes, grande responsabilité.", tn: "قراية طويلة ومتعبة برشا، مسؤولية كبيرة.", en: "Very long and exhausting studies, heavy responsibility." }
        }
      },
      medecine_dentaire: {
        title: { fr: "2. Médecine Dentaire (Monastir)", tn: "2. طب الأسنان (المنستير)", en: "2. Dentistry (Monastir)" },
        shortName: { fr: "Médecine Dentaire", tn: "طب الأسنان", en: "Dentistry" },
        steps: [
          { name: { fr: "Baccalauréat", tn: "البكالوريا", en: "High School (Bac)" }, duration: "" },
          { name: { fr: "Études Odontologiques (5 ans)", tn: "دراسة طب الأسنان (5 سنين)", en: "Dental Studies (5 years)" }, desc: { fr: "Faculté de Médecine Dentaire de Monastir.", tn: "في كلية طب الأسنان بالمنستير (الوحيدة في تونس).", en: "Faculty of Dental Medicine of Monastir." } },
          { name: { fr: "Internat (1 an)", tn: "التربص الداخلي (عام)", en: "Internship (1 year)" }, desc: { fr: "Stage clinique.", tn: "تربص تطبيقي.", en: "Clinical training." } },
          { name: { fr: "Thèse ou Résidanat", tn: "أطروحة أو مناظرة اختصاص", en: "Thesis or Residency" }, desc: { fr: "Pour l'exercice général ou une spécialité.", tn: "للتخرج كطبيب عام أو للتخصص.", en: "For general practice or specialization." } },
          { name: { fr: "Médecin Dentiste", tn: "طبيب أسنان", en: "Dentist" }, icon: "badge" }
        ],
        details: {
          duration: { fr: "6 à 10 ans", tn: "من 6 إلى 10 سنين", en: "6 to 10 years" },
          difficulty: { fr: "Très Élevée (Exigence manuelle et académique)", tn: "عالية جدا (لازم تفوق دراسي ومهارة يدوية)", en: "Very High (Manual and academic demands)" },
          pros: { fr: "Bon équilibre vie pro/perso, forte demande.", tn: "توازن باهي بين الخدمة والحياة، ومطلوب برشا.", en: "Good work-life balance, high demand." },
          cons: { fr: "Coût élevé d'installation (cabinet), études exigeantes.", tn: "تكلفة حلان عيادة غالية برشا.", en: "High cost of setting up a practice, demanding studies." }
        }
      }
    },
    labels: {
      duration: { fr: "Durée totale", tn: "المدة الجملية", en: "Total Duration" },
      difficulty: { fr: "Niveau de difficulté", tn: "مستوى الصعوبة", en: "Difficulty Level" },
      pros: { fr: "Avantages", tn: "الإيجابيات", en: "Advantages" },
      cons: { fr: "Inconvénients", tn: "السلبيات", en: "Disadvantages" },
      pathway: { fr: "Parcours", tn: "المسار", en: "Pathway" }
    }
  };

  const getTranslation = (obj: any) => {
    return obj[currentLanguage] || obj['fr'] || '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 text-white flex flex-col max-h-[90vh]"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-slate-950/50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3.5 h-3.5" />
                  Domaine Médical
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">
                {getTranslation(content.title)}
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-1">
                {getTranslation(content.subtitle)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Quick selectors */}
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(content.paths) as PathId[]).map((pathId) => {
                const isSelected = selectedPath === pathId;
                const pathObj = content.paths[pathId];
                return (
                  <button
                    key={pathId}
                    onClick={() => setSelectedPath(pathId)}
                    className={`p-4 rounded-2xl text-start border transition-all duration-300 relative overflow-hidden ${isSelected
                      ? 'border-rose-400 bg-rose-500/10 text-white shadow-[0_0_15px_rgba(251,113,133,0.15)]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-rose-400" />
                    )}
                    <span className="text-xs text-slate-500 block mb-1">
                      {getTranslation(content.labels.pathway)}
                    </span>
                    <span className="font-bold text-sm md:text-base block line-clamp-1">
                      {getTranslation(pathObj.shortName)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Path Diagram */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-400" />
                {getTranslation(content.paths[selectedPath].title)}
              </h3>

              {/* State Flow Diagram */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4 overflow-x-auto">
                {content.paths[selectedPath].steps.map((step, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  const isFirst = idx === 0;
                  return (
                    <React.Fragment key={idx}>
                      {/* Step Node */}
                      <div className="flex flex-col items-center text-center max-w-[200px] w-full group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isLast
                          ? 'bg-rose-400 text-slate-950 border-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.4)]'
                          : isFirst
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 text-white border-slate-700 group-hover:border-rose-400 group-hover:bg-rose-400/10'
                          }`}>
                          {isLast ? (
                            <Award className="w-7 h-7" />
                          ) : isFirst ? (
                            <BookOpen className="w-6 h-6" />
                          ) : (
                            <span className="font-extrabold text-lg">{idx}</span>
                          )}
                        </div>
                        <h4 className="mt-3 font-bold text-sm text-white px-2">
                          {getTranslation(step.name)}
                        </h4>
                        {step.desc && (
                          <p className="mt-1 text-xs text-slate-400 line-clamp-2 px-1">
                            {getTranslation(step.desc)}
                          </p>
                        )}
                      </div>

                      {/* Connection arrow */}
                      {!isLast && (
                        <div className={`flex items-center justify-center ${isRTL ? 'rotate-180 lg:rotate-180' : ''} lg:rotate-0 rotate-90 my-2 lg:my-0`}>
                          <ChevronRight className="w-6 h-6 text-rose-400/60 animate-pulse" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Path details cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      {getTranslation(content.labels.duration)}
                    </h4>
                    <p className="text-white font-bold mt-0.5 text-sm md:text-base">
                      {getTranslation(content.paths[selectedPath].details.duration)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      {getTranslation(content.labels.difficulty)}
                    </h4>
                    <p className="text-white font-bold mt-0.5 text-sm md:text-base">
                      {getTranslation(content.paths[selectedPath].details.difficulty)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {getTranslation(content.labels.pros)}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {getTranslation(content.paths[selectedPath].details.pros)}
                  </p>
                </div>
                <div className="border-t border-slate-800/80 pt-4">
                  <h4 className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {getTranslation(content.labels.cons)}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {getTranslation(content.paths[selectedPath].details.cons)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
