import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#243989] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img
            src="/images/logo/logoWhite.png"
            alt="BideyaBoost Logo"
            className="h-10 w-auto"
          />
          <img
            src="/images/logo/Asset39.png"
            alt="BideyaBoost Text"
            className="h-8 w-auto"
          />
        </div>
        <Link href="/orientation-ia" className="text-sm text-indigo-300 hover:text-white font-medium hover:underline mt-4 inline-block">
          احكي مع bideya AI
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
