// src/lib/bible-loader.ts
// ✅ Complete Bible Loader - Multi-language support
// ✅ Fixed: useState/useEffect only in client hook

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

// ============ BOOK ALIASES ============
const ALIASES: Record<string, string> = {
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
  'matthew': 'matt', 'mark': 'mark', 'luke': 'luke', 'john': 'john',
  'acts': 'acts', 'romans': 'rom', '1-corinthians': '1cor', '2-corinthians': '2cor',
  'galatians': 'gal', 'ephesians': 'eph', 'philippians': 'phil', 'colossians': 'col',
  '1-thessalonians': '1thess', '2-thessalonians': '2thess', '1-timothy': '1tim',
  '2-timothy': '2tim', 'titus': 'titus', 'philemon': 'phlm', 'hebrews': 'heb',
  'james': 'jas', '1-peter': '1pet', '2-peter': '2pet', '1-john': '1john',
  '2-john': '2john', '3-john': '3john', 'jude': 'jude', 'revelation': 'rev',
  'tobit': 'tob', 'judith': 'jdt', 'wisdom': 'wis', 'wisdom-of-solomon': 'wis',
  'sirach': 'sir', 'ecclesiasticus': 'sir', 'baruch': 'bar',
  '1-maccabees': '1macc', '2-maccabees': '2macc',
  'manasseh': 'prman', 'prayer-of-manasseh': 'prman',
  '1-esdras': '1esd', '2-esdras': '2esd',
  'esther-greek': 'esthgr', 'additions-to-esther': 'esthgr',
  'letter-of-jeremiah': 'epjer', 'song-of-three-jews': 'prazar', 'azariah': 'prazar',
  'susanna': 'sus', 'bel-dragon': 'bel', 'bel-and-the-dragon': 'bel',
};

function getCode(input: string): string {
  const code = input.toLowerCase().trim();
  return ALIASES[code] || code;
}

// ============ MAIN LOADER ============
async function loadChapter(
  book: string,
  chapter: number,
  lang: string = 'eng-kjv'
): Promise<Verse[] | null> {
  const code = getCode(book);
  const chapterStr = String(chapter);
  const langPrefix = lang.split('-')[0];

  // TRY 1: Language-specific split file
  if (lang !== 'eng-kjv') {
    try {
      const url = `/bible/split/${langPrefix}-${code}-${chapter}.json`;
      const res = await fetch(url);
      if (res.ok) {
        const data: SplitChapter = await res.json();
        if (data.verses && data.verses.length > 0) {
          return data.verses;
        }
      }
    } catch (e) {
      console.log(`⚠️ ${lang} file not found, trying English...`);
    }
  }

  // TRY 2: English split file
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
    console.log(`⚠️ English split file error: ${code}-${chapter}`);
  }

  // TRY 3: Language combined file
  try {
    const url = `/bible/${lang}-81books.json`;
    const res = await fetch(url);
    if (res.ok) {
      const bible: BibleData = await res.json();
      const bookData = bible[code];
      if (bookData) {
        const verses = bookData[chapterStr] || bookData[chapter as any];
        if (verses && verses.length > 0) return verses;
      }
    }
  } catch (e) {
    console.error(`❌ Combined file error for ${lang}:`, e);
  }

  // TRY 4: English combined file
  if (lang !== 'eng-kjv') {
    try {
      const url = `/bible/eng-kjv-81books.json`;
      const res = await fetch(url);
      if (res.ok) {
        const bible: BibleData = await res.json();
        const bookData = bible[code];
        if (bookData) {
          const verses = bookData[chapterStr] || bookData[chapter as any];
          if (verses && verses.length > 0) return verses;
        }
      }
    } catch (e) {
      console.error(`❌ English combined file error:`, e);
    }
  }

  return null;
}

// ============ LOAD BOOK ============
async function loadBook(
  book: string,
  lang: string = 'eng-kjv'
): Promise<BibleBook | null> {
  const code = getCode(book);

  try {
    const res = await fetch(`/bible/${lang}-81books.json`);
    if (res.ok) {
      const bible: BibleData = await res.json();
      if (bible[code]) return bible[code];
    }
  } catch (e) {
    console.log(`⚠️ ${lang} combined file not found`);
  }

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

// ============ GEMINI LOADER (SERVER SAFE) ============
async function loadForGemini(
  book: string,
  chapter: number,
  options: {
    includeVerseNumbers?: boolean;
    format?: 'plain' | 'json' | 'markdown';
    lang?: string;
  } = {}
): Promise<string> {
  const { includeVerseNumbers = true, format = 'plain', lang = 'eng-kjv' } = options;
  const verses = await loadChapter(book, chapter, lang);

  if (!verses) return `Error: Could not load ${book} chapter ${chapter} in ${lang}`;

  if (format === 'json') return JSON.stringify(verses, null, 2);

  if (format === 'markdown') {
    return verses.map(v => includeVerseNumbers ? `**${v.verse}** ${v.text}` : v.text).join('\n\n');
  }

  return verses.map(v => includeVerseNumbers ? `${v.verse}. ${v.text}` : v.text).join('\n');
}

// ============ REACT HOOK (CLIENT ONLY - separate file) ============
// useChapter is exported from bible-loader.client.ts
// This file is safe for server-side imports

export { ALIASES, getCode, loadChapter, loadBook, loadForGemini };