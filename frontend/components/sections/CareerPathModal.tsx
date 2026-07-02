'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, ChevronRight, Award, Landmark, BookOpen, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CareerPathModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PathId = 'licence' | 'prepa_classique' | 'prepa_integree' | 'prive';

export default function CareerPathModal({ isOpen, onClose }: CareerPathModalProps) {
  const { currentLanguage, isRTL } = useLanguage();
  const [selectedPath, setSelectedPath] = useState<PathId>('prepa_classique');

  // Translations
  const content = {
    title: {
      fr: "Comment devenir Ingénieur en Informatique en Tunisie ?",
      tn: "كيفاش نولي مهندس إعلامية في تونس ؟",
      en: "How to become a Computer Science Engineer in Tunisia?"
    },
    subtitle: {
      fr: "Découvrez les 4 parcours académiques possibles après le baccalauréat.",
      tn: "اكتشف المسارات الأكاديمية الـ 4 الممكنة بعد البكالوريا.",
      en: "Discover the 4 possible academic pathways after High School."
    },
    paths: {
      prepa_classique: {
        title: { fr: "1. Prépa Classique (2 ans + 3 ans)", tn: "1. مرحلة تحضيرية علمية  (عامين + 3 سنين)", en: "1. Classical Prep (2y + 3y)" },
        shortName: { fr: "Prépa Classique", tn: "مرحلة تحضيرية علمية", en: "Classical Prep" },
        steps: [
          { name: { fr: "Baccalauréat", tn: "البكالوريا", en: "High School (Bac)" }, duration: "" },
          { name: { fr: "Classes Préparatoires (2 ans)", tn: "المرحلة التحضيرية (عامين)", en: "Prep School (2 years)" }, desc: { fr: "MP, PC ou PT. Rythme intensif.", tn: "شعبة رياضيات-فيزياء أو فيزياء-كيمياء أو تكنولوجيا.", en: "Math-Physics, Physics-Chemistry or Tech." } },
          { name: { fr: "Concours National", tn: "المناظرة الوطنية", en: "National Exam" }, desc: { fr: "Concours d'entrée aux écoles d'ingénieurs.", tn: "مناظرة الدخول لمدارس المهندسين.", en: "Competitive exam for engineering schools." } },
          { name: { fr: "Cycle Ingénieur Étatique (3 ans)", tn: "مرحلة هندسة حكومية (3 سنين)", en: "State Engineering (3 years)" }, desc: { fr: "Dans les écoles publiques (ENSI, Sup'Com, ENIT...).", tn: "في المدارس العمومية كيف ENSI و Sup'Com و ENIT.", en: "At public schools like ENSI, Sup'Com, ENIT..." } },
          { name: { fr: "Ingénieur Informatique", tn: "مهندس إعلامية", en: "CS Engineer" }, icon: "badge" }
        ],
        details: {
          duration: { fr: "5 ans (2 ans prépa + 3 ans cycle)", tn: "5 سنين (عامين تحضيري + 3 سنين هندسة)", en: "5 years (2 years prep + 3 years engineering)" },
          difficulty: { fr: "Très Élevée (Concours sélectif)", tn: "تتطلب عمل جاد جدا  (مناظرة وطنية)", en: "Very High (Highly competitive)" },
          pros: { fr: "Diplôme très valorisé, écoles publiques prestigieuses gratuites.", tn: "شهادة قوية، قراية بلاش في مدارس عريقة.", en: "Highly valued degree, free tuition in prestigious public schools." },
          cons: { fr: "Grande pression durant la prépa, stress du concours.", tn: "ضغط كبير في التحضيري وستريس المناظرة.", en: "High pressure during prep, competitive exam stress." }
        }
      },
      licence: {
        title: { fr: "2. Voie Licence (3 ans + 3 ans)", tn: "2. مسار الإجازة (3 سنين + 3 سنين)", en: "2. Bachelor's Way (3y + 3y)" },
        shortName: { fr: "Licence Étatique", tn: "إجازة في الإعلامية", en: "State Bachelor's" },
        steps: [
          { name: { fr: "Baccalauréat", tn: "البكالوريا", en: "High School (Bac)" }, duration: "" },
          { name: { fr: "Licence Informatique (3 ans)", tn: "إجازة في الإعلامية (3 سنين)", en: "CS Bachelor's (3 years)" }, desc: { fr: "FST, FSEG, ISG, ISAMM, etc. Moins de stress.", tn: "في كليات كيف FST, FSEG, ISG, ISAMM...", en: "At universities like FST, FSEG, ISG, ISAMM..." } },
          { name: { fr: "Concours sur Dossier", tn: "مناظرة بالملفات", en: "Admission by File" }, desc: { fr: "Sélection rigoureuse des meilleurs étudiants.", tn: "قبول النخبة حسب النتائج في الـ 3 سنين.", en: "Selection of top performing students." } },
          { name: { fr: "Cycle Ingénieur Étatique (3 ans)", tn: "مرحلة هندسة حكومية (3 سنين)", en: "State Engineering (3 years)" }, desc: { fr: "Places limitées en école publique.", tn: "بقع محدودة في المدارس العمومية.", en: "Limited seats in public engineering schools." } },
          { name: { fr: "Ingénieur Informatique", tn: "مهندس إعلامية", en: "CS Engineer" }, icon: "badge" }
        ],
        details: {
          duration: { fr: "6 ans (3 ans licence + 3 ans cycle)", tn: "6 سنين (3 سنين إجازة + 3 سنين هندسة)", en: "6 years (3 years Bachelor's + 3 years engineering)" },
          difficulty: { fr: "Moyenne à Élevée (Dossier d'excellence requis)", tn: "متوسطة إلى عالية (لازمك تكون مالأوائل)", en: "Medium to High (Top grades required for admission)" },
          pros: { fr: "Rythme plus équilibré, obtention d'un diplôme intermédiaire (Licence).", tn: "ريتم مرتاح مقارنة بالتحضيري، تاخذ شهادة إجازة في الثنية.", en: "Balanced study pace, intermediate degree obtained." },
          cons: { fr: "Nombre de places très restreint en cycle ingénieur public.", tn: "بقع قليلة برشا في الكليات العمومية بالملفات.", en: "Very limited seats in public engineering programs for Bachelor's holders." }
        }
      },
      prepa_integree: {
        title: { fr: "3. Prépa Intégrée (5 ans)", tn: "3. تحضيري مندمج (5 سنين)", en: "3. Integrated Prep (5 years)" },
        shortName: { fr: "Prépa Intégrée", tn: "مرحلة تحضيرية مندمجة  ", en: "Integrated Prep" },
        steps: [
          { name: { fr: "Baccalauréat", tn: "البكالوريا", en: "High School (Bac)" }, duration: "" },
          { name: { fr: "Cycle Préparatoire Intégré (2 ans)", tn: "مرحلة تحضيرية مندمجة (عامين)", en: "Integrated Prep (2 years)" }, desc: { fr: "Exemple: INSAT, ISSAT. Pas de concours national.", tn: "كيف الـ INSAT أو ISSAT. تعدية بلاش مناظرة وطنية.", en: "e.g., INSAT, ISSAT. No national competitive exam." } },
          { name: { fr: "Orientation Interne", tn: "توجيه داخلي", en: "Internal Placement" }, desc: { fr: "Selon le classement interne et le contrôle continu.", tn: "حسب نتائجك في العامين والترتيب الداخلي.", en: "Based on internal ranking and continuous assessment." } },
          { name: { fr: "Cycle Ingénieur Informatique (3 ans)", tn: "مرحلة هندسة إعلامية (3 سنين)", en: "CS Engineering Cycle (3 years)" }, desc: { fr: "Poursuite directe dans la même institution.", tn: "تكمل تقرى طول في نفس الجامعة.", en: "Direct continuation in the same institution." } },
          { name: { fr: "Ingénieur Informatique", tn: "مهندس إعلامية", en: "CS Engineer" }, icon: "badge" }
        ],
        details: {
          duration: { fr: "5 ans intégrés", tn: "5 سنين كاملة", en: "5 integrated years" },
          difficulty: { fr: "Élevée (Accès post-bac très sélectif)", tn: "عالية (سكور الباك لازم يكون قوي برشا)", en: "High (Requires a high Baccalaureate score for entry)" },
          pros: { fr: "Pas de concours national stressant, excellente formation pratique dès le départ.", tn: "بلاش مناظرة وطنية، تطبيق عملي وقوي ماللول.", en: "No stressful national exam, excellent practical training from day one." },
          cons: { fr: "Nécessite un excellent score au Bac, sélection interne compétitive.", tn: "لازم سكور باك طيارة، وتنافس داخلي عالبقع.", en: "Requires a very high Bac score, competitive internal placement." }
        }
      },
      prive: {
        title: { fr: "4. Secteur Privé (ESPRIT, TEK-UP...)", tn: "4. القطاع الخاص (إسبريت، تيك-أب...)", en: "4. Private Sector (ESPRIT, TEK-UP...)" },
        shortName: { fr: "Écoles Privées", tn: "كليات خاصة", en: "Private Schools" },
        steps: [
          { name: { fr: "Baccalauréat", tn: "البكالوريا", en: "High School (Bac)" }, duration: "" },
          { name: { fr: "Licence (3 ans) ou Prépa (2 ans)", tn: "إجازة (3 سنين) أو تحضيري (عامين)", en: "Bachelor's (3y) or Prep (2y)" }, desc: { fr: "Études dans le public ou le privé.", tn: "تقراهم في العمومي والا في الخاص.", en: "Studies completed in public or private sector." } },
          { name: { fr: "Admission sur Dossier", tn: "قبول بالملف", en: "File Admission" }, desc: { fr: "Entretien de motivation et étude de dossier.", tn: "دراسة ملف ومقابلة شفاهية.", en: "Motivation interview and file review." } },
          { name: { fr: "Cycle Ingénieur Privé (3 ans)", tn: "مرحلة هندسة خاصة (3 سنين)", en: "Private Engineering (3 years)" }, desc: { fr: "Écoles privées agréées (ESPRIT, Tek-up, Sesame, MSB...).", tn: "في جامعات مرخصة كيف ESPRIT, Tek-up, Sesame, MSB...", en: "Accredited private schools like ESPRIT, Tek-up, Sesame, MSB..." } },
          { name: { fr: "Ingénieur Informatique", tn: "مهندس إعلامية", en: "CS Engineer" }, icon: "badge" }
        ],
        details: {
          duration: { fr: "5 à 6 ans selon le parcours initial", tn: "5 ولا 6 سنين حسب قرايتك الأولى", en: "5 to 6 years depending on initial studies" },
          difficulty: { fr: "Accessible / Modérée", tn: "متاحة للناس الكل", en: "Accessible / Moderate" },
          pros: { fr: "Flexibilité des parcours, matériel moderne, forte insertion professionnelle.", tn: "مرونة كبيرة، تجهيزات حديثة، وتشغيلية عالية.", en: "Pathways flexibility, modern equipment, high employability rate." },
          cons: { fr: "Coûts de scolarité élevés.", tn: "تكاليف القراية غالية ومكلفة.", en: "High tuition fees." }
        }
      }
    },
    labels: {
      duration: { fr: "Durée totale", tn: "المدة الجملية", en: "Total Duration" },
      difficulty: { fr: "Niveau de difficulté", tn: "مستوى الصعوبة", en: "Difficulty Level" },
      pros: { fr: "Avantages", tn: "الإيجابيات", en: "Advantages" },
      cons: { fr: "Inconvénients", tn: "السلبيات", en: "Disadvantages" },
      pathway: { fr: "Parcours", tn: "المسار", en: "Pathway" },
      step: { fr: "Étape", tn: "خطوة", en: "Step" },
      institutions: { fr: "Exemples d'écoles", tn: "أمثلة للجامعات", en: "Example schools" }
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
                <span className="bg-[#B5E846]/20 text-[#B5E846] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  Innovation Orientation
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(content.paths) as PathId[]).map((pathId) => {
                const isSelected = selectedPath === pathId;
                const pathObj = content.paths[pathId];
                return (
                  <button
                    key={pathId}
                    onClick={() => setSelectedPath(pathId)}
                    className={`p-4 rounded-2xl text-start border transition-all duration-300 relative overflow-hidden ${isSelected
                      ? 'border-[#B5E846] bg-[#B5E846]/10 text-white shadow-[0_0_15px_rgba(181,232,70,0.15)]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-[#B5E846]" />
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
                <GraduationCap className="w-5 h-5 text-[#B5E846]" />
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
                          ? 'bg-[#B5E846] text-slate-950 border-[#B5E846] shadow-[0_0_20px_rgba(181,232,70,0.4)]'
                          : isFirst
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 text-white border-slate-700 group-hover:border-[#B5E846] group-hover:bg-[#B5E846]/10'
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
                          <ChevronRight className="w-6 h-6 text-[#B5E846]/60 animate-pulse" />
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
                    <HelpCircle className="w-5 h-5" />
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
                  <h4 className="text-[#B5E846] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5E846]" />
                    {getTranslation(content.labels.pros)}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {getTranslation(content.paths[selectedPath].details.pros)}
                  </p>
                </div>
                <div className="border-t border-slate-800/80 pt-4">
                  <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
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
