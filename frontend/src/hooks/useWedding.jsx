import { createContext, useContext, useEffect, useState } from 'react';

import { fetchWedding } from '../services/weddingService.js';
import { weddingFallback } from '../data/weddingFallback.js';

const WeddingContext = createContext(null);

/**
 * Provides the wedding data to the whole app via one fetch.
 * Seeds state with the fallback so the first paint is never empty,
 * then swaps in live API data when it arrives.
 */
export function WeddingProvider({ children }) {
  const [wedding, setWedding] = useState(weddingFallback);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('fallback');

  useEffect(() => {
    let active = true;
    fetchWedding().then(({ data, source }) => {
      if (!active) return;
      setWedding(data);
      setSource(source);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <WeddingContext.Provider value={{ wedding, loading, source }}>
      {children}
    </WeddingContext.Provider>
  );
}

/**
 * Access the current wedding anywhere in the tree.
 * @returns {{ wedding: object, loading: boolean, source: string }}
 */
export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) {
    throw new Error('useWedding must be used within a <WeddingProvider>');
  }
  return ctx;
}
