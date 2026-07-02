'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { V2 } from '../../lib/routes';
import { useLanguage } from '@/context/LanguageContext';
import CareerPathModal from './CareerPathModal';
import MedicalPathModal from './MedicalPathModal';

const Hero = () => {
  const { t, isRTL, currentLanguage } = useLanguage();
  const [showCareerPath, setShowCareerPath] = useState(false);
  const [showMedicalPath, setShowMedicalPath] = useState(false);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#243989] via-[#3A52A8] to-[#4E6BC7] overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#B5E846] rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full filter blur-3xl" />
      </div>

      <div className="absolute top-16 left-10 md:top-24 md:left-20 animate-pulse">
        <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <div className="absolute -top-2 left-6">
          <svg className="w-4 h-4 text-[#B5E846]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      <div className="absolute top-20 right-10 md:top-28 md:right-24">
        <svg className="w-20 h-20 text-[#B5E846] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>

      <div className="absolute bottom-32 left-10 md:bottom-40 md:left-20">
        <div className="flex gap-2">
          <svg className="w-8 h-8 text-[#B5E846] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3l1.912 5.813h6.113l-4.944 3.587 1.888 5.837L12 14.65l-4.969 3.587 1.888-5.837L3.975 8.813h6.113L12 3z" />
          </svg>
          <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: '0.2s' }}>
            <path d="M12 3l1.912 5.813h6.113l-4.944 3.587 1.888 5.837L12 14.65l-4.969 3.587 1.888-5.837L3.975 8.813h6.113L12 3z" />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-28 right-10 md:bottom-36 md:right-20">
        <svg className="w-12 h-12 text-[#B5E846]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="flex justify-center mb-8">
          <img
            src="/images/logo/Asset47.png"
            alt="BideyaBoost Full Logo"
            className="h-32 w-auto"
          />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {t('hero_headline')}
          <span className="text-[#B5E846]"> {t('hero_headline_highlight')}</span>.
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
          {t('hero_tagline')}
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <Link href={V2.psychometric}>
            <Button variant="secondary" size="lg">
              {t('hero_cta_start')}
            </Button>
          </Link>
          <Link href={V2.guide}>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#243989]">
              {t('hero_cta_guide')}
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => setShowCareerPath(true)}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-[#B5E846]/40 px-6 py-3.5 rounded-2xl text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg group cursor-pointer"
          >
            <span className="text-xl group-hover:animate-bounce">💻</span>
            <span className="text-sm md:text-base font-semibold">
              {currentLanguage === 'tn' ? 'كيفاش نولي مهندس إعلامية في تونس ؟' : currentLanguage === 'en' ? 'How to become a computer science engineer in Tunisia?' : 'Comment devenir ingénieur en informatique en Tunisie ?'}
            </span>
            <span className="bg-[#B5E846] text-slate-900 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider scale-95 group-hover:scale-100 transition-transform hidden md:inline-block">
              {currentLanguage === 'tn' ? 'اكتشف' : currentLanguage === 'en' ? 'Discover' : 'Découvrir'}
            </span>
          </button>
          
          <button
            onClick={() => setShowMedicalPath(true)}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-rose-400/40 px-6 py-3.5 rounded-2xl text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg group cursor-pointer"
          >
            <span className="text-xl group-hover:animate-bounce">🩺</span>
            <span className="text-sm md:text-base font-semibold">
              {currentLanguage === 'tn' ? 'كيفاش نولي طبيب في تونس ؟' : currentLanguage === 'en' ? 'How to become a doctor in Tunisia?' : 'Comment devenir médecin en Tunisie ?'}
            </span>
            <span className="bg-rose-400 text-slate-900 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider scale-95 group-hover:scale-100 transition-transform hidden md:inline-block">
              {currentLanguage === 'tn' ? 'اكتشف' : currentLanguage === 'en' ? 'Discover' : 'Découvrir'}
            </span>
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <CareerPathModal isOpen={showCareerPath} onClose={() => setShowCareerPath(false)} />
      <MedicalPathModal isOpen={showMedicalPath} onClose={() => setShowMedicalPath(false)} />
    </section>
  );
};

export default Hero;
