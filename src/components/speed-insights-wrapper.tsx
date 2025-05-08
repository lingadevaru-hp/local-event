'use client';

import dynamic from 'next/dynamic';

const SpeedInsightsDynamic = dynamic(
  () => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights),
  { ssr: false, loading: () => null } 
);

export function SpeedInsightsWrapper() {
  // Conditionally render SpeedInsights for production after other primary components
  if (process.env.NODE_ENV === 'production') {
    return <SpeedInsightsDynamic />;
  }
  return null;
}
