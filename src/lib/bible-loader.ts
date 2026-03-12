// src/lib/bible-loader.ts
// ✅ FINAL CLEAN VERSION - NO duplicate exports
import { useState, useEffect } from 'react';

export interface Verse { verse: number; text: string; }
export interface BibleBook { [chapter: string]: Verse[]; }
export interface BibleData { [book: string]: BibleBook; }
export interface SplitChapter { book: string; chapter: number; verses: Verse[]; }

const ALIASES: Record<string, string> = {
  'tobit':'tob','judith':'jdt','wisdom':'wis','sirach':'sir','baruch':'bar',
  '1-maccabees':'1ma','2-maccabees':'2ma','genesis':'gen','exodus':'exo',
  'leviticus':'lev','numbers':'num','deuteronomy':'deu','joshua':'jos',
  'judges':'jdg','ruth':'rut','1-samuel':'1sa','2-samuel':'2sa',
  '1-kings':'1ki','2-kings':'2ki','1-chronicles':'1ch','2-chronicles':'2ch',
  'ezra':'ezr','nehemiah':'neh','esther':'est','job':'job','psalms':'psa',
  'proverbs':'pro','ecclesiastes':'ecc','isaiah':'isa','jeremiah':'jer',
  'ezekiel':'ezk','daniel':'dan','hosea':'hos','joel':'jol','amos':'amo',
  'jonah':'jon','micah':'mic','nahum':'nah','habakkuk':'hab','zephaniah':'zep',
  'haggai':'hag','zechariah':'zec','malachi':'mal','matthew':'mat',
  'mark':'mrk','luke':'luk','john':'jhn','acts':'act','romans':'rom',
  '1-corinthians':'1co','2-corinthians':'2co','galatians':'gal',
  'ephesians':'eph','philippians':'php','colossians':'col',
  '1-thessalonians':'1th','2-thessalonians':'2th','1-timothy':'1ti',
  '2-timothy':'2ti','titus':'tit','philemon':'phm','hebrews':'heb',
  'james':'jas','1-peter':'1pe','2-peter':'2pe','1-john':'1jn',
  '2-john':'2jn','3-john':'3jn','jude':'jud','revelation':'rev',
  'manasseh':'man','1-esdras':'1es','2-esdras':'2es','susanna':'sus',
  'bel-dragon':'bel','song-of-three-jews':'s3y','3-maccabees':'3ma',
  '4-maccabees':'4ma','prayer-of-manasseh':'man','esther-greek':'esg',
  'additions-to-esther':'esg','letter-of-jeremiah':'lje','azariah':'s3y',
  'wisdom-of-solomon':'wis','ecclesiasticus':'sir','bel-and-the-dragon':'bel',
};

function getCode(input: string): string {
  return ALIASES[input.toLowerCase().trim()] || input.toLowerCase().trim();
}

async function loadChapter(book: string, chapter: number, lang: string = 'hin-hindi'): Promise<Verse[] | null> {
  const code = getCode(book);
  const chStr = String(chapter);
  try {
    const res = await fetch(`/bible/split/${code}-${chapter}.json`);
    if (res.ok) { const d: SplitChapter = await res.json(); return d.verses || null; }
  } catch (e) { console.log('⚠️ Split chapter error:', e); }
  try {
    const res = await fetch(`/bible/split/${code}.json`);
    if (res.ok) { const b: BibleBook = await res.json(); return b[chStr] || b[chapter] || null; }
  } catch (e) { console.log('⚠️ Split book error:', e); }
  try {
    const res = await fetch(`/bible/${lang}-osis-80books.json`);
    if (!res.ok) return null;
    const bible: BibleData = await res.json();
    const bd = bible[code];
    if (!bd) return null;
    return bd[chStr] || bd[chapter] || null;
  } catch (e) { console.error('❌ Combined error:', e); return null; }
  return null;
}

async function loadBook(book: string, lang: string = 'hin-hindi'): Promise<BibleBook | null> {
  const code = getCode(book);
  try { const res = await fetch(`/bible/split/${code}.json`); if (res.ok) return await res.json(); } catch {}
  try {
    const res = await fetch(`/bible/${lang}-osis-80books.json`);
    if (!res.ok) return null;
    const bible: BibleData = await res.json();
    return bible[code] || null;
  } catch { return null; }
}

async function loadForGemini(book: string, chapter: number, options: { includeVerseNumbers?: boolean; format?: 'plain'|'json'|'markdown'; lang?: string } = {}): Promise<string> {
  const { includeVerseNumbers = true, format = 'plain', lang = 'hin-hindi' } = options;
  const verses = await loadChapter(book, chapter, lang);
  if (!verses) return `Error: Could not load ${book} ${chapter}`;
  if (format === 'json') return JSON.stringify(verses, null, 2);
  if (format === 'markdown') return verses.map(v => includeVerseNumbers ? `**${v.verse}** ${v.text}` : v.text).join('\n\n');
  return verses.map(v => includeVerseNumbers ? `${v.verse}. ${v.text}` : v.text).join('\n');
}

function useChapter(book: string | null, chapter: number | null, lang: string = 'hin-hindi') {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!book || chapter === null) { setVerses(null); setLoading(false); setError(null); return; }
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true); setError(null);
        const result = await loadChapter(book, chapter, lang);
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

export { ALIASES, getCode, loadChapter, loadBook, loadForGemini, useChapter };