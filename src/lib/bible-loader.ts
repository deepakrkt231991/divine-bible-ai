// src/lib/bible-loader.ts
// ✅ Clean version - NO duplicate exports

import { useState, useEffect } from 'react';

// ============ TYPES ============
export interface Verse {
  verse: number;
  text: string;
}

export interface ChapterData {
  [verseNum: string]: Verse[];
}

export interface BibleBook {
  [chapterNum: string]: ChapterData;
}

export interface BibleData {
  [bookCode: string]: BibleBook;
}

export interface SplitChapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

// ============ BOOK ALIASES (NO export here) ============
const BOOK_ALIASES: Record<string, string> = {
  'tobit': 'tob', 'judith': 'jdt', 'wisdom': 'wis',
  'wisdom-of-solomon': 'wis', 'sirach': 'sir', 'ecclesiasticus': 'sir',
  'baruch': 'bar', '1-maccabees': '1ma', '2-maccabees': '2ma',
  '3-maccabees': '3ma', '4-maccabees': '4ma', 'manasseh': 'man',
  'prayer-of-manasseh': 'man', '1-esdras': '1es', '2-esdras': '2es',
  'esther-greek': 'esg', 'additions-to-esther': 'esg',
  'letter-of-jeremiah': 'lje', 'song-of-three-jews': 's3y', 'azariah': 's3y',
  'susanna': 'sus', 'bel-dragon': 'bel', 'bel-and-the-dragon': 'bel',
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

// ============ HELPER FUNCTIONS ============
function resolveBookCode(input: string): string {
  const code = input.toLowerCase().trim();
  return BOOK_ALIASES[code] || code;
}

// ============ MAIN LOADER ============
export async function loadBiblePart(
  bookCode: string,
  chapterNum?: number | null,
  lang: string = 'hin-hindi'
): Promise<BibleBook | ChapterData | Verse[] | null> {
  const code = resolveBookCode(bookCode);
  
  try {
    // Try split chapter file first
    if (chapterNum !== undefined && chapterNum !== null) {
      const chapterRes = await fetch(`/bible/split/${code}-${chapterNum}.json`);
      if (chapterRes.ok) {
        const data: SplitChapter = await chapterRes.json();
        return data.verses || null;
      }
    }
    
    // Try split book file
    const bookRes = await fetch(`/bible/split/${code}.json`);
    if (bookRes.ok) {
      const book: BibleBook = await bookRes.json();
      if (chapterNum !== undefined && chapterNum !== null) {
        return book[String(chapterNum)] || book[chapterNum] || null;
      }
      return book;
    }
    
    // Fallback to combined file
    const combinedRes = await fetch(`/bible/${lang}-osis-80books.json`);
    if (!combinedRes.ok) throw new Error('Bible file not found');
    
    const bible: BibleData = await combinedRes.json();
    const book = bible[code];
    
    if (!book) {
      console.warn(`Book not found: ${code}`);
      return null;
    }
    
    if (chapterNum !== undefined && chapterNum !== null) {
      return book[String(chapterNum)] || book[chapterNum] || null;
    }
    
    return book;
    
  } catch (error) {
    console.error('Error loading Bible:', error);
    return null;
  }
}

// ============ 🤖 GEMINI LOADER ============
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

  const code = resolveBookCode(book);

  try {
    const chapterRes = await fetch(`/bible/split/${code}-${chapter}.json`);
    
    let verses: Verse[] = [];
    
    if (chapterRes.ok) {
      const data: SplitChapter = await chapterRes.json();
      verses = data.verses || [];
    } else {
      const combinedRes = await fetch(`/bible/${lang}-osis-80books.json`);
      if (!combinedRes.ok) throw new Error('Bible file not found');
      
      const bible: BibleData = await combinedRes.json();
      const bookData = bible[code];
      
      if (!bookData?.[chapter]) {
        throw new Error(`Chapter not found: ${book} ${chapter}`);
      }
      
      const chapterData = bookData[chapter];
      verses = Object.values(chapterData).flat() as Verse[];
    }
    
    if (format === 'json') {
      return JSON.stringify(verses, null, 2);
    }
    
    if (format === 'markdown') {
      return verses
        .map(v => includeVerseNumbers ? `**${v.verse}** ${v.text}` : v.text)
        .join('\n\n');
    }
    
    return verses
      .map(v => includeVerseNumbers ? `${v.verse}. ${v.text}` : v.text)
      .join('\n');
    
  } catch (error) {
    console.error('Gemini loader error:', error);
    return `Error: Could not load ${book} chapter ${chapter}`;
  }
}

// ============ ⚛️ REACT HOOK ============
export function useBiblePart(
  bookCode: string | null,
  chapterNum?: number | null,
  lang: string = 'hin-hindi'
) {
  const [data, setData] = useState<BibleBook | ChapterData | Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (!bookCode) {
        if (mounted) {
          setLoading(false);
          setData(null);
          setError(null);
        }
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const result = await loadBiblePart(bookCode, chapterNum, lang);
        
        if (mounted) {
          if (result) {
            setData(result);
            setError(null);
          } else {
            setData(null);
            setError(`Book not found: ${bookCode}`);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, [bookCode, chapterNum, lang]);

  return { data, loading, error };
}

// ============ EXPORT AT END (Clean way) ============
export {
  BOOK_ALIASES,
  resolveBookCode,
  loadBiblePart,
  loadForGemini,
  useBiblePart,
};