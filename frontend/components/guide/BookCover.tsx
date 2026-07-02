'use client';

import { BookOpen } from 'lucide-react';

type CoverSide = 'front' | 'back';

interface Props {
  side: CoverSide;
  lang: 'tn' | 'fr' | 'en';
}

const TEXT = {
  fr: {
    frontTitle: 'Guide officiel',
    frontYear: 'Orientation universitaire 2025',
    frontSub: 'République Tunisienne — Ministère de l\'Enseignement Supérieur',
    backTitle: 'BideyaBoost',
    backSub: 'Votre compagnon d\'orientation intelligent',
  },
  tn: {
    frontTitle: 'الڤايد الرسمي',
    frontYear: 'التوجيه الجامعي 2025',
    frontSub: 'الجمهورية التونسية — وزارة التعليم العالي',
    backTitle: 'بيديا بوست',
    backSub: 'رفيقك الذكي في التوجيه الجامعي',
  },
  en: {
    frontTitle: 'Official Guide',
    frontYear: 'University Orientation 2025',
    frontSub: 'Republic of Tunisia — Ministry of Higher Education',
    backTitle: 'BideyaBoost',
    backSub: 'Your smart orientation companion',
  },
};

export default function BookCover({ side, lang }: Props) {
  const t = TEXT[lang];

  if (side === 'front') {
    return (
      <div className="book-cover book-cover-front h-full w-full flex flex-col items-center justify-center text-center p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#243989] via-[#3A52A8] to-[#4E6BC7]" />
        <div className="absolute inset-3 border border-[#B5E846]/30 rounded-lg pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvc3ZnPg==')]" />
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#B5E846]/20 border border-[#B5E846]/40 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-[#B5E846]" />
          </div>
          <div>
            <p className="text-[#B5E846] text-sm font-semibold tracking-[0.2em] uppercase mb-2">
              {t.frontTitle}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {t.frontYear}
            </h1>
          </div>
          <p className="text-white/75 text-xs md:text-sm max-w-xs mx-auto leading-relaxed">
            {t.frontSub}
          </p>
          <div className="pt-4 border-t border-white/20">
            <span className="text-white/60 text-xs tracking-widest">BIDEYABOOST.TN</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-cover book-cover-back h-full w-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-[#1A2B6B] to-[#243989]" />
      <div className="relative z-10 space-y-4">
        <h2 className="text-xl font-bold text-[#B5E846]">{t.backTitle}</h2>
        <p className="text-white/70 text-sm max-w-[200px]">{t.backSub}</p>
        <div className="w-16 h-1 bg-[#B5E846]/50 mx-auto rounded-full" />
      </div>
    </div>
  );
}
