import { useState, useEffect } from 'react';

export interface Verse {
  verse: number;
  text: string;
}

// Book name to code mapping
const BOOK_CODES: Record<string, string> = {
  'genesis': 'gen', 'exodus': 'exo', 'leviticus': 'lev', 'numbers': 'num',
  'deuteronomy': 'deu', 'joshua': 'jos', 'judges': 'jdg', 'ruth': 'rut',
  '1samuel': '1sa', '2samuel': '2sa', '1kings': '1ki', '2kings': '2ki',
  '1chronicles': '1ch', '2chronicles': '2ch', 'ezra': 'ezr', 'nehemiah': 'neh',
  'esther': 'est', 'job': 'job', 'psalms': 'psa', 'proverbs': 'pro',
  'ecclesiastes': 'ecc', 'songofsolomon': 'sng', 'isaiah': 'isa', 'jeremiah': 'jer',
  'lamentations': 'lam', 'ezekiel': 'ezk', 'daniel': 'dan', 'hosea': 'hos',
  'joel': 'jol', 'amos': 'amo', 'obadiah': 'oba', 'jonah': 'jon',
  'micah': 'mic', 'nahum': 'nah', 'habakkuk': 'hab', 'zephaniah': 'zep',
  'haggai': 'hag', 'zechariah': 'zec', 'malachi': 'mal',
  'matthew': 'mat', 'mark': 'mrk', 'luke': 'luk', 'john': 'jhn',
  'acts': 'act', 'romans': 'rom', '1corinthians': '1co', '2corinthians': '2co',
  'galatians': 'gal', 'ephesians': 'eph', 'philippians': 'php', 'colossians': 'col',
  '1thessalonians': '1th', '2thessalonians': '2th', '1timothy': '1ti',
  '2timothy': '2ti', 'titus': 'tit', 'philemon': 'phm', 'hebrews': 'heb',
  'james': 'jas', '1peter': '1pe', '2peter': '2pe', '1john': '1jn',
  '2john': '2jn', '3john': '3jn', 'jude': 'jud', 'revelation': 'rev',
  'tobit': 'tob', 'judith': 'jdt', 'wisdom': 'wis', 'sirach': 'sir',
  'baruch': 'bar', '1maccabees': '1ma', '2maccabees': '2ma', '1esdras': '1es',
  '2esdras': '2es', 'prayerofmanasseh': 'man', 'psalm151': 'psa151',
  '3maccabees': '3ma', '4maccabees': '4ma', 'susanna': 'sus', 'bel': 'bel'
};

export async function loadChapter(book: string, chapter: number): Promise<Verse[] | null> {
  const bookKey = book.toLowerCase().replace(/\s+/g, '');
  const code = BOOK_CODES[bookKey] || book.slice(0, 3).toLowerCase();
  
  try {
    const res = await fetch(`/bible/split/${code}/${chapter}.json`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log('Error loading chapter:', e);
  }
  return null;
}

export function useChapter(book: string | null, chapter: number | null) {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!book || !chapter) return;
    
    setLoading(true);
    loadChapter(book, chapter).then(data => {
      setVerses(data);
      setLoading(false);
    });
  }, [book, chapter]);
  
  return { verses, loading };
}

export async function loadForGemini(book: string, chapter: number): Promise<string> {
  const verses = await loadChapter(book, chapter);
  if (!verses) return `Error: ${book} ${chapter} not found`;
  return verses.map(v => `${v.verse}. ${v.text}`).join('\n');
}
