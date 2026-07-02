'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const FloatingContact = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setIsContactOpen(!isContactOpen)}
        className="w-16 h-16 bg-[#B5E846] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
        aria-label={t('contact')}
      >
        <svg className="w-8 h-8 text-[#243989]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {isContactOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-72"
        >
          <h3 className="text-[#243989] font-bold text-xl mb-4">{t('contact_modal_title')}</h3>
          <div className="space-y-3">
            <a
              href="mailto:contact@bideyaboost.tn"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-medium">{t('contact_email')}</span>
            </a>
            <a
              href="https://instagram.com/bideyaboost"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-medium">Instagram</span>
            </a>
            <a
              href="https://facebook.com/bideyaboost"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700 font-medium">Facebook</span>
            </a>
          </div>
          <button
            type="button"
            onClick={() => setIsContactOpen(false)}
            className={`absolute top-3 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
            aria-label={t('contact_close')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingContact;
