'use client';

import React from 'react';

interface VideoPopupProps {
  onClose: () => void;
}

const VideoPopup: React.FC<VideoPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-[#B5E846] transition-colors"
          aria-label="Fermer la vidéo"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="aspect-video bg-gradient-to-br from-[#243989] to-[#3A52A8] rounded-2xl shadow-2xl flex items-center justify-center border border-white/20">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer hover:bg-white/30 transition-colors">
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Présentation Vidéo</h3>
            <p className="text-gray-200">Vidéo à venir</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPopup;
