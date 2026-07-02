'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/sections/Hero';
import VideoPopup from '@/components/sections/VideoPopup';
import VideoSection from '@/components/sections/VideoSection';

export default function Home() {
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    setShowVideo(true);
  }, []);

  return (
    <div>
      <Hero />
      <VideoSection />
      {showVideo && <VideoPopup onClose={() => setShowVideo(false)} />}
    </div>
  );
}
