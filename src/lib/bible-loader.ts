// src/lib/bible-loader.ts
// ✅ Complete Bible Loader - 80 Books, All Chapters, Offline Ready
// ✅ Debug-friendly with console logs
// ✅ NO duplicate exports

import { useState, useEffect } from 'react';

// ============ TYPES ============
export interface Verse {
  verse: number;
  text: string;
}

export interface BibleBook {
  [chapter: string]: Verse[];
}

export interface BibleData {
  [book: string]: BibleBook;
}

export interface SplitChapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

// ============ BOOK ALIASES (internal - not exported) ============
const ALIASES: Record<string, string> = {
  // Deuterocanon / Apocrypha
  'tobit': 'tob', 'judith': 'jdt', 'wisdom': 'wis', 'wisdom-of-solomon': 'wis',
  'sirach': 'sir', 'ecclesiasticus': 'sir', 'baruch': 'bar',
  '1-maccabees': '1ma', '2-maccabees': '2ma', '3-maccabees': '3ma', '4-maccabees': '4ma',
  'manasseh': 'man', 'prayer-of-manasseh': 'man',
  '1-esdras': '1es', '2-esdras': '2es',
  'esther-greek': 'esg', 'additions-to-esther': 'esg',
  'letter-of-jeremiah': 'lje', 'song-of-three-jews': 's3y', 'azariah': 's3y',
  'susanna': 'sus', 'bel-dragon': 'bel', 'bel-and-the-dragon': 'bel',
  
  // Protestant Books (full names → 3-letter codes)
  'genesis': 'gen', 'exodus': 'exo', 'leviticus': 'lev', 'numbers': 'num',
  'deuteronomy': 'deu', 'joshua': 'jos', 'judges': 'jdg', 'ruth': 'rut',
  '1-samuel': '1sa', '2-samuel': '2sa', '1-kings': '1ki', '2-kings': '2ki',
  '1-chronicles': '1ch', '2-chronicles': '2ch', 'ezra': 'ezr', 'nehemiah': 'neh',
  'esther': 'est', 'job': 'job', 'psalms': 'psa', 'proverbs': 'pro',
  'ecclesiastes': 'ecc', 'song-of-solomon': 'sng', 'isaiah': 'isa',
  'jeremiah': 'jer', 'lamentations': 'lam', 'ezekiel': 'ezk', 'daniel': 'dan',
  'hosea': 'hos', 'joel': 'jol', 'amos': 'amo', 'obadiah': 'oba',
  'jonah': 'jon', 'micah': 'mic', 'nahum': 'nah', 'habakkuk': 'hab',
  'zephaniah': 'zep', 'haggai': 'hag', 'zechariah': 'zec', 'malachi': 'mal',
  'matthew': 'mat', 'mark': 'mrk', 'luke': 'luk', 'john': 'jhn',
  'acts': 'act', 'romans': 'rom', '1-corinthians': '1co', '2-corinthians': '2co',
  'galatians': 'gal', 'ephesians': 'eph', 'philippians': 'php', 'colossians': 'col',
  '1-thessalonians': '1th', '2-thessalonians': '2th', '1-timothy': '1ti',
  '2-timothy': '2ti', 'titus': 'tit', 'philemon': 'phm', 'hebrews': 'heb',
  'james': 'jas', '1-peter': '1pe', '2-peter': '2pe', '1-john': '1jn',
  '2-john': '2jn', '3-john': '3jn', 'jude': 'jud', 'revelation': 'rev',
};

// Internal helper: resolve user input to file code
function getCode(input: string): string {
  return ALIASES[input.toLowerCase().trim()] || input.toLowerCase().trim();
}

// ============ 🎯 MAIN LOADER: Load Single Chapter ============
export async function loadChapter(
  book: string,
  chapter: number,
  lang: string = 'hin-hindi'
): Promise<Verse[] | null> {
  const code = getCode(book);
  const chapterStr = String(chapter);
  
  // === TRY 1: Split chapter file (~11 KB) - FASTEST ===
  try {
    const url = `/bible/split/${code}-${chapter}.json`;
    const res = await fetch(url);
    
    if (res.ok) {
      const data: SplitChapter = await res.json();
      return data.verses || null;
    }
  } catch (e) {
    console.log(`⚠️ Split chapter fetch error: ${code}-${chapter}`, e);
  }
  
  // === TRY 2: Split book file (~200-500 KB) ===
  try {
    const url = `/bible/split/${code}.json`;
    const res = await fetch(url);
    
    if (res.ok) {
      const bookData: BibleBook = await res.json();
      const verses = bookData[chapterStr] || bookData[chapter];
      if (verses) return verses;
    }
  } catch (e) {
    console.log(`⚠️ Split book fetch error: ${code}`, e);
  }
  
  // === TRY 3: Combined 80-books file (~11 MB) - FALLBACK ===
  try {
    const url = `/bible/${lang}-osis-80books.json`;
    const res = await fetch(url);
    
    if (!res.ok) return null;
    
    const bible: BibleData = await res.json();
    const bookData = bible[code];
    
    if (!bookData) return null;
    
    const verses = bookData[chapterStr] || bookData[chapter];
    return verses || null;
    
  } catch (e) {
    console.error(`❌ Combined file error:`, e);
    return null;
  }
  
  return null;
}

// ============ 📚 Load Entire Book ============
export async function loadBook(
  book: string,
  lang: string = 'hin-hindi'
): Promise<BibleBook | null> {
  const code = getCode(book);
  
  // Try split book first
  try {
    const res = await fetch(`/bible/split/${code}.json`);
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  
  // Fallback to combined
  try {
    const res = await fetch(`/bible/${lang}-osis-80books.json`);
    if (!res.ok) return null;
    const bible: BibleData = await res.json();
    return bible[code] || null;
  } catch {
    return null;
  }
}

// ============ 🤖 Gemini Optimized Loader ============
export async function loadForGemini(
  book: string,
  chapter: number,
  options: {
    includeVerseNumbers?: boolean;
    format?: 'plain' | 'json' | 'markdown';
    lang?: string;
  } = {}
): Promise<string> {
  const {
    includeVerseNumbers = true,
    format = 'plain',
    lang = 'hin-hindi'
  } = options;

  const verses = await loadChapter(book, chapter, lang);
  
  if (!verses) {
    return `Error: Could not load ${book} chapter ${chapter}`;
  }
  
  // Format output
  if (format === 'json') {
    return JSON.stringify(verses, null, 2);
  }
  
  if (format === 'markdown') {
    return verses
      .map(v => includeVerseNumbers ? `**${v.verse}** ${v.text}` : v.text)
      .join('\n\n');
  }
  
  // Plain text (default)
  return verses
    .map(v => includeVerseNumbers ? `${v.verse}. ${v.text}` : v.text)
    .join('\n');
}

// ============ ⚛️ React Hook for Components ============
export function useChapter(
  book: string | null,
  chapter: number | null,
  lang: string = 'hin-hindi'
) {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset if no book/chapter
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
            setError(`Chapter not found: ${book} ${chapter}`);
            setVerses(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setVerses(null);
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [book, chapter, lang]);

  return { verses, loading, error };
}

// ============ ✅ EXPORTS (Clean - only once at end) ============
export {
  ALIASES,
  getCode,
  loadChapter,
  loadBook,
  loadForGemini,
  useChapter,
};