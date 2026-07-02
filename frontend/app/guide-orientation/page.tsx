'use client';

import GuideBookReader from '@/components/guide/GuideBookReader';
import { V2 } from '@/lib/routes';

export default function GuideOrientationPage() {
  return (
    <div className="relative min-h-screen pb-8 pt-20 bg-gradient-to-br from-[#243989] via-[#3A52A8] to-[#4E6BC7] overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#B5E846] rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full filter blur-3xl" />
      </div>
      <div className="relative z-10">
        <GuideBookReader
          stickyTopClass="top-20"
          orientationHref={V2.calculeScore}
        />
      </div>
    </div>
  );
}
