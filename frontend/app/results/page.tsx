'use client';

import { ResultsPageContent } from '@/components/pages/ResultsPage';
import { V2 } from '@/lib/routes';

export default function BideyaBoostResultsPage() {
  return (
    <div className="pt-20">
      <ResultsPageContent fallbackPath={V2.calculeScore} />
    </div>
  );
}
