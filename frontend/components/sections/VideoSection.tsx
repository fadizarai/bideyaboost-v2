'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const VideoSection = () => {
  const { currentLanguage, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Placeholder data for orientation sessions
  const sessions = [
    {
      id: 1,
      title: { fr: "Session d'orientation : Ingénierie", tn: "حصة توجيه : هندسة", en: "Orientation Session: Engineering" },
      duration: "45:20",
      date: "Juin 2024"
    },
    {
      id: 2,
      title: { fr: "Session d'orientation : Médecine & Santé", tn: "حصة توجيه : طب وصحة", en: "Orientation Session: Medicine & Health" },
      duration: "52:10",
      date: "Juin 2024"
    },
    {
      id: 3,
      title: { fr: "Session d'orientation : Économie & Gestion", tn: "حصة توجيه : إقتصاد وتصرف", en: "Orientation Session: Economics & Management" },
      duration: "38:45",
      date: "Juillet 2024"
    },
    {
      id: 4,
      title: { fr: "Session d'orientation : Sciences Humaines", tn: "حصة توجيه : علوم إنسانية", en: "Orientation Session: Humanities" },
      duration: "41:15",
      date: "Juillet 2024"
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: isRTL ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const getTranslation = (obj: any) => {
    return obj[currentLanguage] || obj['fr'];
  };

  return (
    <section className="py-24 bg-slate-50 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#243989] mb-4">
              {currentLanguage === 'tn' ? 'حصص التوجيه المسجلة' : currentLanguage === 'en' ? 'Recorded Orientation Sessions' : 'Sessions d\'orientation enregistrées'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              {currentLanguage === 'tn' ? 'تفرج في حصص التوجيه اللي فاتوك باش تعاونك تختار ثنيتك.' : currentLanguage === 'en' ? 'Watch our past orientation sessions to help you make the right choice.' : 'Visionnez nos anciennes sessions d\'orientation pour vous aider à faire le bon choix.'}
            </p>
          </div>
          
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#243989] transition-colors shadow-sm"
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#243989] transition-colors shadow-sm"
            >
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Video Slider */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="min-w-[300px] md:min-w-[350px] bg-white rounded-2xl p-3 shadow-lg border border-slate-100 snap-center group cursor-pointer"
            >
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
                {/* Thumbnail placeholder gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#243989] to-[#4E6BC7] opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded">
                  {session.duration}
                </div>
              </div>
              
              <div className="px-2 pb-2">
                <span className="text-xs font-semibold text-[#B5E846] uppercase tracking-wider mb-2 block">
                  {session.date}
                </span>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-[#243989] transition-colors">
                  {getTranslation(session.title)}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
