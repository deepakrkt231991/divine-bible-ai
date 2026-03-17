'use client';

import { useState, useEffect } from 'react';
import { loadChapter } from './bible-loader';
import type { Verse } from './bible-loader';

export { ALIASES, getCode, loadChapter, loadBook, loadForGemini } from './bible-loader';

function useChapter(
  book: string | null,
  chapter: number | null,
  lang: string = 'eng-kjv'
) {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!book || chapter === null) {
      setVerses(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadChapter(book, chapter, lang);
        if (mounted) {
          if (result && result.length > 0) {
            setVerses(result);
            setError(null);
          } else {
            setError(`Chapter not found: ${book} ${chapter} in ${lang}`);
            setVerses(null);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Unknown error');
          setVerses(null);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [book, chapter, lang]);

  return { verses, loading, error };
}

export { useChapter };