// src/lib/bible-loader.ts
// ✅ Complete Bible Loader - NO duplicate exports
// ✅ Works with split JSON files + multi-language support

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

// ============ BOOK ALIASES: User Input → Actual File Code ============
const ALIASES: Record<string, string> = {
  // ===== Protestant Old Testament =====
  'genesis': 'gen', 'exodus': 'exod', 'leviticus': 'lev', 'numbers': 'num',
  'deuteronomy': 'deut', 'joshua': 'josh', 'judges': 'judg', 'ruth': 'ruth',
  '1-samuel': '1sam', '2-samuel': '2sam', '1-kings': '1kgs', '2-kings': '2kgs',
  '1-chronicles': '1chr', '2-chronicles': '2chr', 'ezra': 'ezra', 'nehemiah': 'neh',
  'esther': 'esth', 'job': 'job', 'psalms': 'ps', 'proverbs': 'prov',
  'ecclesiastes': 'eccl', 'song-of-solomon': 'song', 'isaiah': 'isa',
  'jeremiah': 'jer', 'lamentations': 'lam', 'ezekiel': 'ezek', 'daniel': 'dan',
  'hosea': 'hos', 'joel': 'joel', 'amos': 'amos', 'obadiah': 'obad',
  'jonah': 'jonah', 'micah': 'mic', 'nahum': 'nah', 'habakkuk': 'hab',
  'zephaniah': 'zeph', 'haggai': 'hag', 'zechariah': 'zech', 'malachi': 'mal',
  
  // ===== Protestant New Testament =====
  'matthew': 'matt', 'mark': 'mark', 'luke': 'luke', 'john': 'john',
  'acts': 'acts', 'romans': 'rom', '1-corinthians': '1cor', '2-corinthians': '2cor',
  'galatians': 'gal', 'ephesians': 'eph', 'philippians': 'phil', 'colossians': 'col',
  '1-thessalonians': '1thess', '2-thessalonians': '2thess', '1-timothy': '1tim',
  '2-timothy': '2tim', 'titus': 'titus', 'philemon': 'phlm', 'hebrews': 'heb',
  'james': 'jas', '1-peter': '1pet', '2-peter': '2pet', '1-john': '1john',
  '2-john': '2john', '3-john': '3john', 'jude': 'jude', 'revelation': 'rev',
  
  // ===== Deuterocanon / Apocrypha =====
  'tobit': 'tob', 'judith': 'jdt', 'wisdom': 'wis', 'wisdom-of-solomon': 'wis',
  'sirach': 'sir', 'ecclesiasticus': 'sir', 'baruch': 'bar',
  '1-maccabees': '1macc', '2-maccabees': '2macc', '3-maccabees': '3macc', '4-maccabees': '4macc',
  'manasseh': 'prman', 'prayer-of-manasseh': 'prman',
  '1-esdras': '1esd', '2-esdras': '2esd',
  'esther-greek': 'esthgr', 'additions-to-esther': 'esthgr',
  'letter-of-jeremiah': 'epjer', 'song-of-three-jews': 'prazar', 'azariah': 'prazar',
  'susanna': 'sus', 'bel-dragon': 'bel', 'bel-and-the-dragon': 'bel',
};

// Internal helper: resolve user input to actual file code
function getCode(input: string): string {
  const code = input.toLowerCase().trim();
  return ALIASES[code] || code;
}

// ============ 🎯 MAIN LOADER: Load Single Chapter ============
async function loadChapter(
  book: string,
  chapter: number,
  lang: string = 'eng-kjv'
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
  
  // === TRY 2: Combined file (~6.5 MB) - FALLBACK ===
  try {
    const url = `/bible/${lang}-81books.json`;
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
async function loadBook(
  book: string,
  lang: string = 'eng-kjv'
): Promise<BibleBook | null> {
  const code = getCode(book);
  
  try {
    const res = await fetch(`/bible/${lang}-81books.json`);
    if (!res.ok) return null;
    const bible: BibleData = await res.json();
    return bible[code] || null;
  } catch {
    return null;
  }
}

// ============ 🤖 Gemini Optimized Loader ============
async function loadForGemini(
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
    lang = 'eng-kjv'
  } = options;

  const verses = await loadChapter(book, chapter, lang);
  
  if (!verses) {
    return `Error: Could not load ${book} chapter ${chapter}`;
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
}

// ============ ⚛️ React Hook for Components (CLIENT-SIDE ONLY) ============
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

// ============ ✅ SINGLE EXPORT BLOCK (at end only) ============
export {
  ALIASES,
  getCode,
  loadChapter,
  loadBook,
  loadForGemini,
  useChapter,
};