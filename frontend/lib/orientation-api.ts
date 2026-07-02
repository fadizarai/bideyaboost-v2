/** Base URL for backend API calls — uses Next.js rewrite in browser */
export function getApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    return normalized;
  }
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  if (base.startsWith('http')) {
    return `${base.replace(/\/$/, '')}${normalized}`;
  }
  return normalized;
}

export async function postOrientationRecommend(body: Record<string, unknown>) {
  const resp = await fetch(getApiUrl('/api/orientation/recommend'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || data.message || `HTTP ${resp.status}`);
  }
  return data;
}

/** Enrich recommendations with guide specialties and admission scores. */
export async function enrichRecommendationsWithGuide<T extends Record<string, unknown>>(
  recommendations: T[],
  options?: { bacType?: string },
): Promise<T[]> {
  if (!recommendations.length) return recommendations;

  const resp = await fetch(getApiUrl('/api/orientation/enrich-scores'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recommendations, bacType: options?.bacType }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return recommendations;
  }
  return (data.recommendations as T[]) ?? recommendations;
}
