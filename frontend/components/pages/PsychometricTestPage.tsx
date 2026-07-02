"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/config/api';
import toast from 'react-hot-toast';

interface RIASECScores {
  R: number;
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

interface AIResults {
  scores: RIASECScores;
  holland_code: string;
  vector: number[];
}

export type PsychometricTestPageProps = {
  orientationPath?: string;
};

export function PsychometricTestPageContent({
  orientationPath = '/calcule-score#choix',
}: PsychometricTestPageProps = {}) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { currentLanguage, isRTL } = useLanguage();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // RIASEC Questions (30 questions — 5 par dimension)
  const questions = [
    // Realistic (R) — 5
    { id: 1, question: { tn: "نفضّل العمل مع الأدوات والآلات", fr: "Je préfère travailler avec des outils et des machines", en: "I prefer working with tools and machines" }, riasec: "R" },
    { id: 2, question: { tn: "نحب ببناء وإصلاح الأشياء", fr: "J'aime construire et réparer des choses", en: "I enjoy building and fixing things" }, riasec: "R" },
    { id: 3, question: { tn: "نحب العمل في الهواء الطلق مع الطبيعة", fr: "J'aime travailler en plein air avec la nature", en: "I like working outdoors with nature" }, riasec: "R" },
    { id: 4, question: { tn: "نفضّل الأنشطة العملية والتطبيقية", fr: "Je préfère les activités pratiques et appliquées", en: "I prefer practical, hands-on activities" }, riasec: "R" },
    { id: 5, question: { tn: "نحب بالمهام الميكانيكية أو التقنية", fr: "J'aime les tâches mécaniques ou techniques", en: "I enjoy mechanical or technical tasks" }, riasec: "R" },

    // Investigative (I) — 5
    { id: 6, question: { tn: "نحب بحل المشاكل المعقدة", fr: "J'aime résoudre des problèmes complexes", en: "I enjoy solving complex problems" }, riasec: "I" },
    { id: 7, question: { tn: "نحب إجراء البحوث والتجارب", fr: "J'aime mener des recherches et des expériences", en: "I like conducting research and experiments" }, riasec: "I" },
    { id: 8, question: { tn: "نفضّل تحليل البيانات والمعلومات", fr: "Je préfère analyser des données et des informations", en: "I prefer analyzing data and information" }, riasec: "I" },
    { id: 9, question: { tn: "نحب بالمهام العلمية والرياضية", fr: "J'aime les tâches scientifiques et mathématiques", en: "I enjoy scientific and mathematical tasks" }, riasec: "I" },
    { id: 10, question: { tn: "نحب التحقيق وفهم كيف تعمل الأشياء", fr: "J'aime investiguer et comprendre comment les choses fonctionnent", en: "I like investigating and understanding how things work" }, riasec: "I" },

    // Artistic (A) — 5
    { id: 11, question: { tn: "نحب بالأنشطة الإبداعية والفنية", fr: "J'aime les activités créatives et artistiques", en: "I enjoy creative and artistic activities" }, riasec: "A" },
    { id: 12, question: { tn: "نحب التعبير عن نفسي من خلال الفن أو الموسيقى", fr: "J'aime m'exprimer à travers l'art ou la musique", en: "I like expressing myself through art or music" }, riasec: "A" },
    { id: 13, question: { tn: "نفضّل العمل في بيئات إبداعية غير منظمة", fr: "Je préfère travailler dans des environnements créatifs non structurés", en: "I prefer working in unstructured, creative environments" }, riasec: "A" },
    { id: 14, question: { tn: "نحب بتصميم وإنشاء أشياء جديدة", fr: "J'aime concevoir et créer de nouvelles choses", en: "I enjoy designing and creating new things" }, riasec: "A" },
    { id: 15, question: { tn: "نحب الأنشطة التي تسمح بالتعبير عن الذات", fr: "J'aime les activités qui permettent l'expression de soi", en: "I like activities that allow for self-expression" }, riasec: "A" },

    // Social (S) — 5
    { id: 16, question: { tn: "نحب بمساعدة وتعليم الآخرين", fr: "J'aime aider et enseigner aux autres", en: "I enjoy helping and teaching others" }, riasec: "S" },
    { id: 17, question: { tn: "نفضّل العمل مع الناس بدلاً من الأشياء", fr: "Je préfère travailler avec des personnes plutôt qu'avec des choses", en: "I prefer working with people rather than things" }, riasec: "S" },
    { id: 18, question: { tn: "نحب تقديم المشورة والنصح للناس", fr: "J'aime conseiller et guider les gens", en: "I like counseling and advising people" }, riasec: "S" },
    { id: 19, question: { tn: "نحب بالأنشطة الجماعية", fr: "J'aime les activités d'équipe", en: "I enjoy team-based activities" }, riasec: "S" },
    { id: 20, question: { tn: "نفضّل الوظائف التي تتضمن تفاعلاً اجتماعياً", fr: "Je préfère les emplois qui impliquent une interaction sociale", en: "I prefer jobs that involve social interaction" }, riasec: "S" },

    // Enterprising (E) — 5
    { id: 21, question: { tn: "نحب بقيادة وإقناع الآخرين", fr: "J'aime diriger et persuader les autres", en: "I enjoy leading and persuading others" }, riasec: "E" },
    { id: 22, question: { tn: "نحب إدارة المشاريع والأشخاص", fr: "J'aime gérer des projets et des personnes", en: "I like managing projects and people" }, riasec: "E" },
    { id: 23, question: { tn: "نفضّل أنشطة الأعمال والمبيعات", fr: "Je préfère les activités commerciales et de vente", en: "I prefer business and sales activities" }, riasec: "E" },
    { id: 24, question: { tn: "نحب بالمخاطرة من أجل المكافآت المحتملة", fr: "J'aime prendre des risques pour des récompenses potentielles", en: "I enjoy taking risks for potential rewards" }, riasec: "E" },
    { id: 25, question: { tn: "نحب البيئات التنافسية", fr: "J'aime les environnements compétitifs", en: "I like competitive environments" }, riasec: "E" },

    // Conventional (C) — 5
    { id: 26, question: { tn: "نحب بتنظيم وصيانة السجلات", fr: "J'aime organiser et maintenir des dossiers", en: "I enjoy organizing and maintaining records" }, riasec: "C" },
    { id: 27, question: { tn: "نفضّل العمل مع البيانات والأرقام", fr: "Je préfère travailler avec des données et des chiffres", en: "I prefer working with data and numbers" }, riasec: "C" },
    { id: 28, question: { tn: "نحب اتباع الإجراءات المحددة", fr: "J'aime suivre des procédures établies", en: "I like following established procedures" }, riasec: "C" },
    { id: 29, question: { tn: "نحب بالعمل التفصيلي والمنهجي", fr: "J'aime le travail détaillé et systématique", en: "I enjoy detailed and systematic work" }, riasec: "C" },
    { id: 30, question: { tn: "نفضّل البيئات المنظمة والقابلة للتنبؤ", fr: "Je préfère les environnements structurés et prévisibles", en: "I prefer structured and predictable environments" }, riasec: "C" },
  ];

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitTest(newAnswers);
    }
  };

  const submitTest = async (testAnswers: boolean[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Format answers for backend
      const formattedAnswers = testAnswers.map((answer, index) => ({
        question_id: index + 1,
        answer: !!answer
      }));

      // Submit to backend AI
      const response = await apiService.getPsychometricProfile(formattedAnswers);

      if (!response.success && response.status !== 200) {
        throw new Error('Failed to analyze responses');
      }

      const backendData = response.data as any;
      const toDisplayScore = (value: number) => (value <= 1 ? Math.round(value * 10) : Math.round(value));
      const toStoredScore = (value: number) => (value <= 1 ? value : value / 10);

      const normalizedScores = {
        R: toStoredScore(Number(backendData.R) || 0),
        I: toStoredScore(Number(backendData.I) || 0),
        A: toStoredScore(Number(backendData.A) || 0),
        S: toStoredScore(Number(backendData.S) || 0),
        E: toStoredScore(Number(backendData.E) || 0),
        C: toStoredScore(Number(backendData.C) || 0),
      };

      const results: AIResults = {
        scores: {
          R: toDisplayScore(normalizedScores.R),
          I: toDisplayScore(normalizedScores.I),
          A: toDisplayScore(normalizedScores.A),
          S: toDisplayScore(normalizedScores.S),
          E: toDisplayScore(normalizedScores.E),
          C: toDisplayScore(normalizedScores.C),
        },
        holland_code: backendData.dominant_code || "RIA",
        vector: Object.values(normalizedScores),
      };

      setAiResults(results);

      // Store in localStorage for use in recommendations
      localStorage.setItem('psychometricProfile', JSON.stringify({
        ...backendData,
        ...results
      }));

      setShowResults(true);
      toast.success(currentLanguage === 'tn' ? 'تم تحليل إجاباتك بنجاح!' : currentLanguage === 'fr' ? 'Vos réponses ont été analysées avec succès!' : 'Your responses have been analyzed successfully!');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing your responses');
      toast.error(currentLanguage === 'tn' ? 'صار خطأ وقت التحليل' : currentLanguage === 'fr' ? "Une erreur s'est produite lors de l'analyse" : 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setAiResults(null);
    setError(null);
    setLoading(false);
  };

  const getProfileDescription = (hollandCode: string) => {
    const descriptions: Record<string, Record<string, string>> = {
      tn: {
        'R': 'واقعي — نفضّل تخدم مع الأدوات والآلات والشغل العملي',
        'I': 'استقصائي — تحب تحل المشاكل المعقدة والبحث العلمي',
        'A': 'فني — مبدع وتحب التعبير على روحك والابتكار',
        'S': 'اجتماعي — تحب تعاون الناس وتخدم في فريق',
        'E': 'مغامر — متميز في القيادة والإقناع وريادة الأعمال',
        'C': 'تقليدي — نفضّل التنظيم والشغل مع البيانات والإجراءات المحددة',
      },
      fr: {
        'R': 'Réaliste - Vous préférez travailler avec des outils, des machines et des activités pratiques',
        'I': 'Investigateur - Vous aimez résoudre des problèmes complexes et la recherche scientifique',
        'A': 'Artistique - Vous excellez dans la créativité, l\'expression de soi et l\'innovation',
        'S': 'Social - Vous aimez aider les autres et travailler en équipe',
        'E': 'Entreprenant - Vous excellez dans le leadership, la persuasion et l\'entrepreneuriat',
        'C': 'Conventionnel - Vous préférez l\'organisation, les données et les procédures établies',
      },
      en: {
        'R': 'Realistic - You prefer working with tools, machines, and practical activities',
        'I': 'Investigative - You enjoy solving complex problems and scientific research',
        'A': 'Artistic - You excel in creativity, self-expression, and innovation',
        'S': 'Social - You love helping others and working in teams',
        'E': 'Enterprising - You excel in leadership, persuasion, and entrepreneurship',
        'C': 'Conventional - You prefer organization, data, and established procedures',
      },
    };

    const primaryType = hollandCode.charAt(0);
    return descriptions[currentLanguage][primaryType] || descriptions['en'][primaryType];
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-[#B5E846]';
    if (percentage >= 60) return 'bg-[#9FD42E]';
    if (percentage >= 40) return 'bg-[#3A52A8]';
    return 'bg-[#243989]/40';
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const pageShell = 'min-h-[calc(100vh-5rem)] py-12 px-4';
  const cardCls = isDark ? 'bg-gray-800/95 backdrop-blur' : 'bg-white/95 backdrop-blur';
  const titleOnCard = isDark ? 'text-white' : 'text-[#243989]';
  const textOnPage = isDark ? 'text-gray-300' : 'text-white/80';
  const textMutedOnPage = isDark ? 'text-gray-400' : 'text-white/60';

  // Loading state
  if (loading) {
    return (
      <div className={`${pageShell} flex flex-col items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-white/20 border-t-[#B5E846] animate-spin" />
          <p className={`text-lg ${textOnPage}`}>
            {currentLanguage === 'tn' ? 'قاعدين نحلّلوا إجاباتك...' : currentLanguage === 'fr' ? 'Analyse de vos réponses...' : 'Analyzing your responses...'}
          </p>
        </div>
      </div>
    );
  }

  // Results state
  if (showResults && aiResults) {
    return (
      <div className={pageShell} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#B5E846] mb-2">
              {currentLanguage === 'tn' ? 'اختبار RIASEC' : currentLanguage === 'fr' ? 'Test RIASEC' : 'RIASEC Test'}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {currentLanguage === 'tn' ? 'نتائج اختبار RIASEC' : currentLanguage === 'fr' ? 'Résultats du Test RIASEC' : 'RIASEC Test Results'}
            </h1>
            <p className={`text-lg ${textOnPage}`}>
              {currentLanguage === 'tn' ? `كود هولاند متاعك: ` : currentLanguage === 'fr' ? `Votre Code Holland : ` : `Your Holland Code: `}
              <span className="text-[#B5E846] font-bold">{aiResults.holland_code}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl mb-8 ${cardCls} shadow-xl`}
          >
            <h3 className={`text-xl font-bold mb-3 ${titleOnCard}`}>
              {currentLanguage === 'tn' ? 'ملخص شخصيتك' : currentLanguage === 'fr' ? 'Résumé de Personnalité' : 'Personality Summary'}
            </h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {getProfileDescription(aiResults.holland_code)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl mb-8 ${cardCls} shadow-xl`}
          >
            <h3 className={`text-xl font-bold mb-6 ${titleOnCard}`}>
              {currentLanguage === 'tn' ? 'النقاط متاعك بالتفصيل' : currentLanguage === 'fr' ? 'Scores Détaillés' : 'Detailed Scores'}
            </h3>
            <div className="space-y-4">
              {Object.entries(aiResults.scores).map(([type, score]) => {
                const labels: Record<string, Record<string, string>> = {
                  R: { tn: 'واقعي', fr: 'Réaliste', en: 'Realistic' },
                  I: { tn: 'استقصائي', fr: 'Investigateur', en: 'Investigative' },
                  A: { tn: 'فني', fr: 'Artistique', en: 'Artistic' },
                  S: { tn: 'اجتماعي', fr: 'Social', en: 'Social' },
                  E: { tn: 'مغامر', fr: 'Entreprenant', en: 'Enterprising' },
                  C: { tn: 'تقليدي', fr: 'Conventionnel', en: 'Conventional' },
                };

                return (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span className={isDark ? 'text-gray-300' : 'text-[#243989]'}>
                        {labels[type][currentLanguage]} ({type})
                      </span>
                      <span className={isDark ? 'text-gray-300' : 'text-[#243989] font-semibold'}>
                        {score}/10
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-[#243989]/10'}`}>
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getScoreColor(score, 10)}`}
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(orientationPath)}
              className="px-8 py-4 bg-[#B5E846] text-[#243989] font-bold rounded-full hover:bg-[#9FD42E] transition-all shadow-lg shadow-[#B5E846]/20"
            >
              {currentLanguage === 'tn' ? 'احصل على توصيات الجامعات' : currentLanguage === 'fr' ? 'Obtenir des Recommandations' : 'Get University Recommendations'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartTest}
              className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-full transition-all hover:bg-white/10"
            >
              {currentLanguage === 'tn' ? 'عاود الاختبار' : currentLanguage === 'fr' ? 'Refaire le Test' : 'Restart Test'}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${pageShell} flex flex-col items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-300 text-lg mb-4">{error}</p>
          <button
            onClick={restartTest}
            className="px-8 py-4 bg-[#B5E846] text-[#243989] font-bold rounded-full hover:bg-[#9FD42E] transition-all shadow-lg"
          >
            {currentLanguage === 'tn' ? 'عاود جرّب' : currentLanguage === 'fr' ? 'Réessayer' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#B5E846] mb-2">
            {currentLanguage === 'tn' ? 'اختبار RIASEC' : currentLanguage === 'fr' ? 'Test RIASEC' : 'RIASEC Test'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {currentLanguage === 'tn' ? 'اكتشف شخصيتك المهنية' : currentLanguage === 'fr' ? 'Découvre ta personnalité professionnelle' : 'Discover your professional personality'}
          </h1>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={textOnPage}>
              {currentLanguage === 'tn' ? `سؤال ${currentQuestion + 1} من ${questions.length}` : currentLanguage === 'fr' ? `Question ${currentQuestion + 1} sur ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}
            </span>
            <span className={`font-medium tabular-nums ${textOnPage}`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#243989] to-[#B5E846] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
            className={`p-8 rounded-2xl ${cardCls} shadow-xl`}
          >
            <h2 className={`text-xl md:text-2xl font-bold mb-8 text-center ${titleOnCard}`}>
              {questions[currentQuestion].question[currentLanguage]}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(true)}
                className="px-12 py-4 bg-[#B5E846] text-[#243989] font-bold rounded-full hover:bg-[#9FD42E] transition-all text-lg shadow-md"
              >
                {currentLanguage === 'tn' ? 'إي' : currentLanguage === 'fr' ? 'Oui' : 'Yes'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(false)}
                className="px-12 py-4 border-2 border-[#243989]/20 text-[#243989] font-bold rounded-full hover:bg-[#243989]/5 transition-all text-lg"
              >
                {currentLanguage === 'tn' ? 'لا' : currentLanguage === 'fr' ? 'Non' : 'No'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {currentQuestion > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className={`text-sm ${textMutedOnPage} hover:text-white transition-colors`}
            >
              ← {currentLanguage === 'tn' ? 'السؤال اللي قبل' : currentLanguage === 'fr' ? 'Question Précédente' : 'Previous Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PsychometricTestPage() {
  return <PsychometricTestPageContent />;
}
