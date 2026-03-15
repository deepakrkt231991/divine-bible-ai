// src/lib/bible-loader.client.ts
// ✅ Client-side only - WITH React hooks
'use client';

import { useState, useEffect } from 'react';
import { Verse, loadChapter as serverLoadChapter } from './bible-loader.server';

export function useChapter(book: string | null, chapter: number | null, lang: string = 'hin-hindi') {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!book || chapter === null) { setVerses(null); setLoading(false); setError(null); return; }
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true); setError(null);
        const result = await serverLoadChapter(book, chapter, lang);
        if (mounted) {
          if (result?.length) { setVerses(result); setError(null); }
          else { setError(`Chapter not found: ${book} ${chapter}`); setVerses(null); }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) { setError(err instanceof Error ? err.message : 'Unknown error'); setVerses(null); setLoading(false); }
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [book, chapter, lang]);

  return { verses, loading, error };
}
