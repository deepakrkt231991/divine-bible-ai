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
  // Apocrypha books
  'tobit': 'tob', 'judith': 'jdt', 'wisdom': 'wis', 'sirach': 'sir',
  'baruch': 'bar', '1maccabees': '1ma', '2maccabees': '2ma', '1esdras': '1es',
  '2esdras': '2es', 'susanna': 'sus', 'bel': 'bel', 'manasseh': 'man'
};

export async function loadChapter(book: string, chapter: number): Promise<Verse[] | null> {
  const bookKey = book.toLowerCase().replace(/\s+/g, '');
  const code = BOOK_CODES[bookKey] || book.slice(0, 3).toLowerCase();
  
  try {
    // Try split folder first
    const res = await fetch(`/bible/split/${code}/${chapter}.json`);
    if (res.ok) {
      return await res.json();
    }
    
    // Try combined JSON
    const combinedRes = await fetch('/bible/hin-hindi-osis.json');
    if (combinedRes.ok) {
      const data = await combinedRes.json();
      const verses = data[code]?.[String(chapter)];
      if (verses) return verses;
    }
  } catch (e) {
    console.log('Load error:', e);
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
EOF