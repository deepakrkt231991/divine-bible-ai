// src/lib/bible-loader.ts
// ✅ Complete Bible Loader - Multi-language support
// ✅ Works with split JSON files + proper language fallback

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
  language?: string;
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

// ============ 🎯 MAIN LOADER: Load Single Chapter (Multi-language) ============
async function loadChapter(
  book: string,
  chapter: number,
  lang: string = 'eng-kjv'
): Promise<Verse[] | null> {
  const code = getCode(book);
  const chapterStr = String(chapter);
  const langPrefix = lang.split('-')[0]; // 'hin' from 'hin-hindi'
  
  // === TRY 1: Language-specific split file (e.g., hin-gen-1.json) ===
  // Only try this if user requested non-English language
  if (lang !== 'eng-kjv') {
    try {
      const url = `/bible/split/${langPrefix}-${code}-${chapter}.json`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data: SplitChapter = await res.json();
        // Return verses if they exist and have content
        if (data.verses && data.verses.length > 0) {
          return data.verses;
        }
      }
    } catch (e) {
      // Language file not found, fall through to English
      console.log(`⚠️ ${lang} file not found: ${langPrefix}-${code}-${chapter}.json, trying English...`);
    }
  }
  
  // === TRY 2: English split file (fallback) ===
  try {
    const url = `/bible/split/${code}-${chapter}.json`;
    const res = await fetch(url);
    
    if (res.ok) {
      const data: SplitChapter = await res.json();
      if (data.verses && data.verses.length > 0) {
        return data.verses;
      }
    }
  } catch (e) {
    console.log(`⚠️ English split file error: ${code}-${chapter}`, e);
  }
  
  // === TRY 3: Language-specific combined file ===
  try {
    const url = `/bible/${lang}-81books.json`;
    const res = await fetch(url);
    
    if (res.ok) {
      const bible: BibleData = await res.json();
      const bookData = bible[code];
      
      if (bookData) {
        const verses = bookData[chapterStr] || bookData[chapter];
        if (verses && verses.length > 0) {
          return verses;
        }
      }
    }
  } catch (e) {
    console.error(`❌ Combined file error for ${lang}:`, e);
  }
  
  // === TRY 4: English combined file (last resort) ===
  if (lang !== 'eng-kjv') {
    try {
      const url = `/bible/eng-kjv-81books.json`;
      const res = await fetch(url);
      
      if (res.ok) {
        const bible: BibleData = await res.json();
        const bookData = bible[code];
        
        if (bookData) {
          const verses = bookData[chapterStr] || bookData[chapter];
          if (verses && verses.length > 0) {
            return verses;
          }
        }
      }
    } catch (e) {
      console.error(`❌ English combined file error:`, e);
    }
  }
  
  // If nothing found, return null
  return null;
}

// ============ 📚 Load Entire Book ============
async function loadBook(
  book: string,
  lang: string = 'eng-kjv'
): Promise<BibleBook | null> {
  const code = getCode(book);
  
  // Try language-specific combined file first
  try {
    const res = await fetch(`/bible/${lang}-81books.json`);
    if (res.ok) {
      const bible: BibleData = await res.json();
      if (bible[code]) {
        return bible[code];
      }
    }
  } catch (e) {
    console.log(`⚠️ ${lang} combined file not found, trying English...`);
  }
  
  // Fall back to English
  if (lang !== 'eng-kjv') {
    try {
      const res = await fetch(`/bible/eng-kjv-81books.json`);
      if (res.ok) {
        const bible: BibleData = await res.json();
        return bible[code] || null;
      }
    } catch (e) {
      console.error(`❌ English combined file error:`, e);
    }
  }
  
  return null;
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
    return `Error: Could not load ${book} chapter ${chapter} in ${lang}`;
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
            setError(`Chapter not found: ${book} ${chapter} in ${lang}`);
            setVerses(null);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Unknown error loading chapter');
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

// ============ ✅ EXPORTS (Single block at end) ============
export {
  ALIASES,
  getCode,
  loadChapter,
  loadBook,
  loadForGemini,
  useChapter,
};