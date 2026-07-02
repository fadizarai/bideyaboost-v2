"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Language = 'tn' | 'fr' | 'en';

interface TranslationObject {
  [key: string]: string;
}

interface LanguageContextType {
  currentLanguage: Language;
  lang: Language; // Alias for backward compatibility
  switchLanguage: (lang: Language) => void;
  setLang: (lang: Language) => void; // Alias for backward compatibility
  t: (key: string) => string;
  isRTL: boolean;
}

// Comprehensive translations
const translations: Record<Language, TranslationObject> = {
  tn: {
    // Navigation — دارجة تونسية
    nav_home: 'الرئيسية',
    nav_orientation: 'التوجيه',
    nav_guide: 'الدليل',
    nav_calculator: 'حاسبة المعدل',
    nav_ten_choices: '10 اختيارات',
    nav_calcule_score: 'حساب المعدل و 10 اختيارات',
    nav_guide_orientation: 'دليل التوجيه',
    nav_psychometric: 'الاختبار النفسي',
    home: 'الرئيسية',
    about: 'على المنصة',
    categories: 'المجالات التعليمية',
    features: 'الخدمات',
    contact: 'تواصل معانا',
    contact_modal_title: 'تواصل معانا',
    contact_email: 'إيميل',
    contact_close: 'سكر',
    login: 'دخول',
    register: 'تسجيل',
    getStarted: 'ابدا توا',

    // Hero
    hero_title: 'اكتشف الطريق الجامعي اللي يناسبك',
    hero_subtitle: 'توجيه بالذكاء الاصطناعي على حساب نقاط الباك والبروفايل النفسي متاعك.',
    heroTitle: 'Bideya Boost',
    heroSubtitle: 'منصة التوجيه الجامعي بالذكاء الاصطناعي',
    heroDescription: 'اكتشف المسار الأكاديمي اللي يناسبك مع نظام ذكاء اصطناعي متخصص في التوجيه الجامعي التونسي',
    hero_headline: 'شنوّا أنسب توجيه ليك؟',
    hero_headline_highlight: 'خلّينا نعاونوك تختار',
    hero_tagline: 'دليلك التونسي باش تختار مستقبلك الدراسي والمهني ☘️',
    hero_cta_start: 'ابدأ التوجيه متاعك',
    hero_cta_guide: 'شوف الدليل',
    start_btn: 'ابدأ التقييم',
    startTest: 'ابدأ اختبار التوجيه',
    learnMore: 'اعرف أكثر',

    // About
    aboutTitle: 'على Bideya Boost',
    aboutDescription: 'منصة رقمية تستعمل الذكاء الاصطناعي باش تساعد التلامذة التوانسة يختاروا المسار الجامعي الأنسب ليهم',

    // Features
    aiPowered: 'بالذكاء الاصطناعي',
    personalizedRecommendations: 'توصيات على قياسك',
    psychometricTest: 'اختبار RIASEC النفسي',
    universityCatalog: 'دليل الجامعات التونسية',

    // Orientation Form
    form_bac_type: 'شعبة الباكالوريا',
    form_bac_score: 'المعدل العام (من 20)',
    form_psycho_score: 'النتيجة النفسية (اختياري، 0-1)',
    form_interests: 'الاهتمامات (افصلهم بفاصلة)',
    form_submit: 'جيب التوصيات',
    bacType: 'شعبة الباك',
    bacScore: 'معدل الباك',
    interests: 'الاهتمامات',
    getRecommendations: 'جيب التوصيات',

    // Results
    results_title: 'أحسن التوصيات للجامعة',
    results_feedback: 'قيم هالتوصية:',
    feedback_submit: 'ابعث التقييم',
    feedback_thanks: 'يعيشك! ساعدت الذكاء الاصطناعي يتعلم أكثر',
    results: 'النتائج',
    yourRecommendations: 'توصياتك الجامعية',
    matchScore: 'نسبة التوافق',

    // Common
    loading: 'قاعد يتحمل...',
    error: 'صار مشكل',
    success: 'تمام',
    submit: 'ابعث',
    cancel: 'إلغاء',
    back: 'ارجع',
    next: 'اللي بعدو',
  },
  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_orientation: 'Orientation',
    nav_guide: 'Guide',
    nav_calculator: 'Calculateur',
    nav_ten_choices: '10 choix',
    nav_calcule_score: 'Calcule score & 10 choix',
    nav_guide_orientation: "Guide d'orientation",
    nav_psychometric: 'Test psychométrique',
    home: 'Accueil',
    about: 'À Propos',
    categories: 'Catégories',
    features: 'Fonctionnalités',
    contact: 'Contact',
    contact_modal_title: 'Contactez-nous',
    contact_email: 'Email',
    contact_close: 'Fermer',
    login: 'Connexion',
    register: "S'inscrire",
    getStarted: 'Commencer',

    // Hero Section
    hero_title: 'Découvrez Votre Parcours Universitaire Idéal',
    hero_subtitle: "Orientation alimentée par l'IA en fonction de vos notes au Bac et profil psychométrique.",
    heroTitle: 'BideyaBoost',
    heroSubtitle: "Plateforme d'orientation universitaire avec IA",
    heroDescription: "Découvrez votre parcours académique idéal avec notre système d'IA spécialisé dans l'orientation universitaire tunisienne",
    hero_headline: 'Découvre les orientations universitaires qui correspondent',
    hero_headline_highlight: 'réellement à ton potentiel',
    hero_tagline: 'Ton guide tunisien pour bien choisir ton avenir scolaire et professionnel ☘️',
    hero_cta_start: 'Commencer mon orientation',
    hero_cta_guide: 'Explorer le guide',
    start_btn: "Commencer l'évaluation",
    startTest: "Commencer le test d'orientation",
    learnMore: 'En savoir plus',

    // About Section
    aboutTitle: 'À Propos de BideyaBoost',
    aboutDescription: "Nous sommes une plateforme numérique innovante utilisant l'intelligence artificielle pour aider les étudiants tunisiens à choisir leur parcours universitaire optimal",

    // Features
    aiPowered: "Propulsé par l'IA",
    personalizedRecommendations: 'Recommandations personnalisées',
    psychometricTest: 'Test psychométrique RIASEC',
    universityCatalog: 'Catalogue des universités tunisiennes',

    // Orientation Form
    form_bac_type: 'Série du Baccalauréat',
    form_bac_score: 'Moyenne Générale (sur 20)',
    form_psycho_score: 'Score Psychométrique (optionnel, 0-1)',
    form_interests: "Centres d'intérêt (séparés par des virgules)",
    form_submit: 'Obtenir des Recommandations',
    bacType: 'Section du Baccalauréat',
    bacScore: 'Moyenne du Baccalauréat',
    interests: 'Intérêts',
    getRecommendations: 'Obtenir des recommandations',

    // Results
    results_title: 'Meilleures Recommandations de Programmes',
    results_feedback: 'Évaluez cette recommandation :',
    feedback_submit: "Envoyer l'évaluation",
    feedback_thanks: "Merci d'aider notre IA à apprendre !",
    results: 'Résultats',
    yourRecommendations: 'Vos recommandations universitaires',
    matchScore: 'Score de correspondance',

    // Common
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès',
    submit: 'Envoyer',
    cancel: 'Annuler',
    back: 'Retour',
    next: 'Suivant',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_orientation: 'Orientation',
    nav_guide: 'Guide',
    nav_calculator: 'Score Calculator',
    nav_ten_choices: '10 Choices',
    nav_calcule_score: 'Score & 10 choices',
    nav_guide_orientation: 'Orientation guide',
    nav_psychometric: 'Psychometric test',
    home: 'Home',
    about: 'About',
    categories: 'Categories',
    features: 'Features',
    contact: 'Contact',
    contact_modal_title: 'Contact us',
    contact_email: 'Email',
    contact_close: 'Close',
    login: 'Login',
    register: 'Sign Up',
    getStarted: 'Get Started',

    // Hero Section
    hero_title: 'Discover Your Ideal University Path',
    hero_subtitle: 'AI-powered orientation based on your Baccalauréat scores and psychometric profile.',
    heroTitle: 'BideyaBoost',
    heroSubtitle: 'AI-Powered University Orientation Platform',
    heroDescription: 'Discover your ideal academic path with our AI system specialized in Tunisian university orientation',
    hero_headline: 'Discover university paths that match',
    hero_headline_highlight: 'your true potential',
    hero_tagline: 'Your Tunisian guide to choosing your academic and professional future',
    hero_cta_start: 'Start my orientation',
    hero_cta_guide: 'Explore the guide',
    start_btn: 'Start Assessment',
    startTest: 'Start Orientation Test',
    learnMore: 'Learn More',

    // About Section
    aboutTitle: 'About BideyaBoost',
    aboutDescription: 'We are an innovative digital platform using artificial intelligence to help Tunisian students choose their optimal university path',

    // Features
    aiPowered: 'AI-Powered',
    personalizedRecommendations: 'Personalized Recommendations',
    psychometricTest: 'RIASEC Psychometric Test',
    universityCatalog: 'Tunisian Universities Catalog',

    // Orientation Form
    form_bac_type: 'Baccalauréat Type',
    form_bac_score: 'Average Score (out of 20)',
    form_psycho_score: 'Psychometric Target Score (optional, 0-1)',
    form_interests: 'Interests (comma separated)',
    form_submit: 'Get Recommendations',
    bacType: 'Baccalaureate Section',
    bacScore: 'Baccalaureate Average',
    interests: 'Interests',
    getRecommendations: 'Get Recommendations',

    // Results
    results_title: 'Top Program Recommendations',
    results_feedback: 'Rate this recommendation:',
    feedback_submit: 'Submit Feedback',
    feedback_thanks: 'Thank you for helping our AI learn!',
    results: 'Results',
    yourRecommendations: 'Your University Recommendations',
    matchScore: 'Match Score',

    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    submit: 'Submit',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') as Language | 'ar' | null;
    if (savedLanguage === 'ar') {
      setCurrentLanguage('tn');
      localStorage.setItem('language', 'tn');
    } else if (savedLanguage && ['tn', 'fr', 'en'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage as Language);
    }
  }, []);

  useEffect(() => {
    // Update document direction for RTL support
    document.documentElement.dir = currentLanguage === 'tn' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage === 'tn' ? 'ar-TN' : currentLanguage;
  }, [currentLanguage]);

  const switchLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[currentLanguage][key] || key;
  }, [currentLanguage]);

  const isRTL = currentLanguage === 'tn';

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      lang: currentLanguage, // Backward compatibility alias
      switchLanguage,
      setLang: switchLanguage, // Backward compatibility alias
      t,
      isRTL
    }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
