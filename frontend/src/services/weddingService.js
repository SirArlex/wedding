import { weddingFallback } from '../data/weddingFallback.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetches the current wedding from the backend API.
 *
 * Returns live data when the API is reachable; otherwise resolves to the
 * local fallback so the UI always has something to render. Never rejects —
 * callers can rely on always receiving a wedding object.
 *
 * @returns {Promise<{ data: object, source: string }>}
 */
export async function fetchWedding() {
  try {
    const res = await fetch(`${API_BASE_URL}/wedding`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`API responded ${res.status}`);

    const payload = await res.json();
    // Backend wraps data as { source, data }.
    if (payload && payload.data) {
      return { data: payload.data, source: payload.source || 'api' };
    }
    throw new Error('Unexpected API response shape');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info(
        `[api] Using local fallback wedding data (${error.message}).`
      );
    }
    return { data: weddingFallback, source: 'fallback' };
  }
}
