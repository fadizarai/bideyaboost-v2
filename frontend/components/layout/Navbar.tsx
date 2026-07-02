'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { V2 } from '../../lib/routes';
import { useLanguage } from '@/context/LanguageContext';

const Navbar = () => {
  const { t, isRTL, currentLanguage, switchLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('nav_home'), href: V2.home },
    { name: t('nav_guide_orientation'), href: V2.guide },
    { name: t('nav_calcule_score'), href: V2.calculeScore },
    { name: t('nav_psychometric'), href: V2.psychometric },
  ];

  const langOptions: { code: 'fr' | 'tn' | 'en'; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'tn', label: 'تونسي' },
    { code: 'en', label: 'EN' },
  ];

  const languageMenuLabel =
    currentLanguage === 'tn' ? 'اللغة' : currentLanguage === 'fr' ? 'Langue' : 'Language';

  const renderLangSwitcher = (inMobileMenu = false) => {
    const onLightBg = inMobileMenu || isScrolled;

    return (
      <div
        className={`flex items-center gap-1 rounded-full p-1 ${
          onLightBg ? 'bg-gray-100' : 'bg-white/15'
        }`}
        role="group"
        aria-label="Language"
      >
        {langOptions.map(({ code, label }) => {
          const active = currentLanguage === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => switchLanguage(code)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? onLightBg
                    ? 'bg-[#243989] text-white'
                    : 'bg-[#B5E846] text-[#243989]'
                  : onLightBg
                    ? 'text-gray-600 hover:text-[#243989]'
                    : 'text-white/80 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <Link href={V2.home} className="flex items-center gap-2 min-w-0 flex-1 lg:flex-none">
            <img
              src={isScrolled || isMobileMenuOpen ? '/images/logo/logoIndigoBlue.png' : '/images/logo/logoWhite.png'}
              alt="BideyaBoost Logo"
              className="h-10 w-auto"
            />
            <img
              src={isScrolled || isMobileMenuOpen ? '/images/logo/Asset41.png' : '/images/logo/Asset39.png'}
              alt="BideyaBoost Text"
              className="h-8 w-auto max-w-[140px] sm:max-w-none object-contain object-left"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-200 text-sm ${
                  isScrolled
                    ? 'text-gray-700 hover:text-[#243989]'
                    : 'text-white hover:text-[#B5E846]'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="hidden lg:block">{renderLangSwitcher()}</div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden flex-shrink-0 p-2 rounded-lg transition-colors ${
              isScrolled || isMobileMenuOpen ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            }`}
            aria-label="Menu"
          >
            <svg
              className={`w-6 h-6 ${isScrolled || isMobileMenuOpen ? 'text-gray-700' : 'text-white'}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-white shadow-xl border-t border-gray-200 rounded-b-2xl">
            <div className="px-4 py-5 flex flex-col space-y-1">
              <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {languageMenuLabel}
                </p>
                {renderLangSwitcher(true)}
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-800 hover:text-[#243989] hover:bg-gray-50 font-medium transition-colors duration-200 px-3 py-2.5 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
