// src/app/tab/read/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Volume2, Pause, BookOpen, AlertCircle, Globe, Search } from 'lucide-react';
import { loadChapter, useChapter } from '@/lib/bible-loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Book list with codes and names
const BIBLE_BOOKS = [
  { code: 'gen', hi: 'उत्पत्ति', en: 'Genesis', chapters: 50 },
  { code: 'exo', hi: 'निर्गमन', en: 'Exodus', chapters: 40 },
  { code: 'lev', hi: 'लेव्यव्यवस्था', en: 'Leviticus', chapters: 27 },
  { code: 'num', hi: 'गिनती', en: 'Numbers', chapters: 36 },
  { code: 'deu', hi: 'व्यवस्थाविवरण', en: 'Deuteronomy', chapters: 34 },
  { code: 'jos', hi: 'यहोशू', en: 'Joshua', chapters: 24 },
  { code: 'jdg', hi: 'न्यायियों', en: 'Judges', chapters: 21 },
  { code: 'rut', hi: 'रूत', en: 'Ruth', chapters: 4 },
  { code: '1sa', hi: '1 शमूएल', en: '1 Samuel', chapters: 31 },
  { code: '2sa', hi: '2 शमूएल', en: '2 Samuel', chapters: 24 },
  { code: '1ki', hi: '1 राजा', en: '1 Kings', chapters: 22 },
  { code: '2ki', hi: '2 राजा', en: '2 Kings', chapters: 25 },
  { code: '1ch', hi: '1 इतिहास', en: '1 Chronicles', chapters: 29 },
  { code: '2ch', hi: '2 इतिहास', en: '2 Chronicles', chapters: 36 },
  { code: 'ezr', hi: 'एज्रा', en: 'Ezra', chapters: 10 },
  { code: 'neh', hi: 'निहेम्याह', en: 'Nehemiah', chapters: 13 },
  { code: 'est', hi: 'एस्तेर', en: 'Esther', chapters: 10 },
  { code: 'job', hi: 'अय्यूब', en: 'Job', chapters: 42 },
  { code: 'psa', hi: 'भजन', en: 'Psalms', chapters: 150 },
  { code: 'pro', hi: 'नीतिवचन', en: 'Proverbs', chapters: 31 },
  { code: 'ecc', hi: 'उपदेशक', en: 'Ecclesiastes', chapters: 12 },
  { code: 'sng', hi: 'श्रेष्ठगीत', en: 'Song of Solomon', chapters: 8 },
  { code: 'isa', hi: 'यशायाह', en: 'Isaiah', chapters: 66 },
  { code: 'jer', hi: 'यिर्मयाह', en: 'Jeremiah', chapters: 52 },
  { code: 'lam', hi: 'विलापगीत', en: 'Lamentations', chapters: 5 },
  { code: 'ezk', hi: 'यहेजकेल', en: 'Ezekiel', chapters: 48 },
  { code: 'dan', hi: 'दानीएल', en: 'Daniel', chapters: 12 },
  { code: 'hos', hi: 'होशे', en: 'Hosea', chapters: 14 },
  { code: 'jol', hi: 'योएल', en: 'Joel', chapters: 3 },
  { code: 'amo', hi: 'आमोस', en: 'Amos', chapters: 9 },
  { code: 'oba', hi: 'ओबद्याह', en: 'Obadiah', chapters: 1 },
  { code: 'jon', hi: 'योना', en: 'Jonah', chapters: 4 },
  { code: 'mic', hi: 'मीका', en: 'Micah', chapters: 7 },
  { code: 'nah', hi: 'नहूम', en: 'Nahum', chapters: 3 },
  { code: 'hab', hi: 'हब्बकूक', en: 'Habakkuk', chapters: 3 },
  { code: 'zep', hi: 'सफन्याह', en: 'Zephaniah', chapters: 3 },
  { code: 'hag', hi: 'हग्गय', en: 'Haggai', chapters: 2 },
  { code: 'zec', hi: 'जकर्याह', en: 'Zechariah', chapters: 14 },
  { code: 'mal', hi: 'मलाकी', en: 'Malachi', chapters: 4 },
  { code: 'mat', hi: 'मत्ती', en: 'Matthew', chapters: 28 },
  { code: 'mrk', hi: 'मरकुस', en: 'Mark', chapters: 16 },
  { code: 'luk', hi: 'लूका', en: 'Luke', chapters: 24 },
  { code: 'jhn', hi: 'यूहन्ना', en: 'John', chapters: 21 },
  { code: 'act', hi: 'प्रेरित', en: 'Acts', chapters: 28 },
  { code: 'rom', hi: 'रोमियों', en: 'Romans', chapters: 16 },
  { code: '1co', hi: '1 कुरिन्थियों', en: '1 Corinthians', chapters: 16 },
  { code: '2co', hi: '2 कुरिन्थियों', en: '2 Corinthians', chapters: 13 },
  { code: 'gal', hi: 'गलातियों', en: 'Galatians', chapters: 6 },
  { code: 'eph', hi: 'इफिसियों', en: 'Ephesians', chapters: 6 },
  { code: 'php', hi: 'फिलिप्पियों', en: 'Philippians', chapters: 4 },
  { code: 'col', hi: 'कुलुस्सियों', en: 'Colossians', chapters: 4 },
  { code: '1th', hi: '1 थिस्सलुनीकियों', en: '1 Thessalonians', chapters: 5 },
  { code: '2th', hi: '2 थिस्सलुनीकियों', en: '2 Thessalonians', chapters: 3 },
  { code: '1ti', hi: '1 तिमुथियस', en: '1 Timothy', chapters: 6 },
  { code: '2ti', hi: '2 तिमुथियस', en: '2 Timothy', chapters: 4 },
  { code: 'tit', hi: 'तीतुस', en: 'Titus', chapters: 3 },
  { code: 'phm', hi: 'फिलेमोन', en: 'Philemon', chapters: 1 },
  { code: 'heb', hi: 'इब्रानियों', en: 'Hebrews', chapters: 13 },
  { code: 'jas', hi: 'याकूब', en: 'James', chapters: 5 },
  { code: '1pe', hi: '1 पतरस', en: '1 Peter', chapters: 5 },
  { code: '2pe', hi: '2 पतरस', en: '2 Peter', chapters: 3 },
  { code: '1jn', hi: '1 यूहन्ना', en: '1 John', chapters: 5 },
  { code: '2jn', hi: '2 यूहन्ना', en: '2 John', chapters: 1 },
  { code: '3jn', hi: '3 यूहन्ना', en: '3 John', chapters: 1 },
  { code: 'jud', hi: 'यहूदा', en: 'Jude', chapters: 1 },
  { code: 'rev', hi: 'प्रकाशित', en: 'Revelation', chapters: 22 },
  // Deuterocanon
  { code: 'tob', hi: 'टोबित', en: 'Tobit', chapters: 14 },
  { code: 'jdt', hi: 'यहूदिथ', en: 'Judith', chapters: 16 },
  { code: 'wis', hi: 'ज्ञान', en: 'Wisdom', chapters: 19 },
  { code: 'sir', hi: 'सिराक', en: 'Sirach', chapters: 51 },
  { code: 'bar', hi: 'बारूक', en: 'Baruch', chapters: 6 },
  { code: '1ma', hi: '1 मक्काबियों', en: '1 Maccabees', chapters: 16 },
  { code: '2ma', hi: '2 मक्काबियों', en: '2 Maccabees', chapters: 15 },
  { code: '3ma', hi: '3 मक्काबियों', en: '3 Maccabees', chapters: 6 },
  { code: '4ma', hi: '4 मक्काबियों', en: '4 Maccabees', chapters: 18 },
  { code: 'man', hi: 'मनश्शेह का प्रार्थना', en: 'Prayer of Manasseh', chapters: 1 },
  { code: '1es', hi: '1 एज्रा', en: '1 Esdras', chapters: 9 },
  { code: '2es', hi: '2 एज्रा', en: '2 Esdras', chapters: 16 },
  { code: 'esg', hi: 'एस्तेर के अतिरिक्त', en: 'Additions to Esther', chapters: 10 },
  { code: 'lje', hi: 'यिर्मयाह का पत्र', en: 'Letter of Jeremiah', chapters: 1 },
  { code: 's3y', hi: 'तीन युवाओं का गीत', en: 'Song of Three Jews', chapters: 1 },
  { code: 'sus', hi: 'सुसन्ना', en: 'Susanna', chapters: 1 },
  { code: 'bel', hi: 'बेल और अजगर', en: 'Bel and the Dragon', chapters: 1 },
];

const LANGUAGES = [
  { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
  { code: 'eng', name: 'English', flag: '🇬🇧' },
];

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const bookParam = searchParams.get('book') || 'GEN';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const langCode = searchParams.get('lang') || 'hin';

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<number>(chapterNum);

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const currentBook = BIBLE_BOOKS.find(b => b.code.toUpperCase() === bookParam.toUpperCase()) || BIBLE_BOOKS[0];

  // Load chapter using our bible-loader
  const loadChapterData = useCallback(async (book: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadChapter(book, chapter, `${lang}-hindi`);
      if (result && Array.isArray(result) && result.length > 0) {
        setVerses(result);
        setError(null);
      } else {
        throw new Error("Is chapter ka data abhi available nahi hai");
      }
    } catch (e: any) {
      setError(e.message || "Chapter load karne mein error aaya");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapterData(bookParam.toLowerCase(), chapterNum, langCode);
  }, [bookParam, chapterNum, langCode, loadChapterData]);

  const navigate = (book: string, chapter: number, lang?: string) => {
    setSelectorOpen(false);
    setLangOpen(false);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', book.toUpperCase());
      params.set('chapter', chapter.toString());
      params.set('lang', lang || langCode);
      router.push(`/tab/read?${params.toString()}`);
    });
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const text = verses.map(v => v.text).join(' ');
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'hin' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur sticky top-0 z-50">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-emerald-500">
                  {currentBook.hi} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[8px] uppercase text-zinc-600 tracking-widest">
                {currentLang.flag} {currentLang.name}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 max-h-[80vh] w-[95%] rounded-2xl">
            <DialogHeader className="p-4 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-lg">📖 Pustak Chuniye</DialogTitle>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Khojein..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2 mt-3 text-sm outline-none"
              />
            </DialogHeader>
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="grid grid-cols-1 gap-1">
                {BIBLE_BOOKS.filter(b => 
                  b.hi.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  b.en.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(book => (
                  <button
                    key={book.code}
                    onClick={() => { navigate(book.code, 1); setSelectedChapter(1); }}
                    className="p-3 rounded-lg bg-zinc-900/40 border border-white/5 text-left flex justify-between text-sm"
                  >
                    <span className="font-medium">{book.hi}</span>
                    <span className="text-[10px] text-zinc-600">{book.chapters} Ch</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Language Selector */}
        <button onClick={() => setLangOpen(true)} className="size-9 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500">
          <Globe className="w-4 h-4" />
        </button>
        <Dialog open={langOpen} onOpenChange={setLangOpen}>
          <DialogContent className="bg-[#09090b] border-white/5 w-[85%] max-w-xs rounded-xl">
            <DialogHeader><DialogTitle className="text-emerald-500 text-sm">Language</DialogTitle></DialogHeader>
            <div className="space-y-1 p-3">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => navigate(bookParam, chapterNum, l.code)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 border text-sm ${langCode === l.code ? 'bg-emerald-500/10 border-emerald-500' : 'bg-zinc-900 border-white/5'}`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="font-medium">{l.name}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Chapter Selector (Below Header) */}
      <div className="px-4 py-2 border-b border-white/5 bg-[#09090b]/80 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => selectedChapter > 1 && setSelectedChapter(selectedChapter - 1)}
          className="p-2 rounded-lg bg-zinc-900 text-zinc-400 disabled:opacity-30"
          disabled={selectedChapter <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(currentBook.chapters, 10) }, (_, i) => i + 1).map(ch => (
            <button
              key={ch}
              onClick={() => { setSelectedChapter(ch); navigate(bookParam, ch, langCode); }}
              className={`w-8 h-8 rounded-lg text-xs font-medium ${selectedChapter === ch ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'}`}
            >
              {ch}
            </button>
          ))}
          {currentBook.chapters > 10 && (
            <span className="w-8 h-8 flex items-center justify-center text-xs text-zinc-600">+{currentBook.chapters - 10}</span>
          )}
        </div>
        <button
          onClick={() => selectedChapter < currentBook.chapters && setSelectedChapter(selectedChapter + 1)}
          className="p-2 rounded-lg bg-zinc-900 text-zinc-400 disabled:opacity-30"
          disabled={selectedChapter >= currentBook.chapters}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs text-zinc-500 mt-3">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-8 h-8 text-red-500/50 mb-2" />
            <p className="text-sm text-zinc-400">{error}</p>
            <button
              onClick={() => loadChapterData(bookParam, chapterNum, langCode)}
              className="mt-3 px-4 py-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg text-xs"
            >
              Retry
            </button>
          </div>
        ) : verses.length > 0 ? (
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-emerald-500 text-center mb-4">
              {currentBook.hi} {chapterNum}
            </h1>
            {verses.map((verse) => (
              <p key={verse.verse} className="leading-relaxed text-base">
                <sup className="text-emerald-500 font-bold mr-1 text-xs">{verse.verse}</sup>
                {verse.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a book and chapter to read</p>
          </div>
        )}
      </main>

      {/* Bottom Controls */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-50">
        <div className="bg-zinc-950/90 backdrop-blur border border-white/10 rounded-full p-1.5 flex items-center justify-between">
          <button
            onClick={() => navigate(bookParam, Math.max(1, chapterNum - 1))}
            className="size-8 rounded-full flex items-center justify-center text-zinc-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={toggleAudio}
            className="flex-1 mx-2 bg-emerald-500 text-black py-2 rounded-full flex items-center justify-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[9px] font-bold uppercase">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          <button
            onClick={() => navigate(bookParam, chapterNum + 1)}
            className="size-8 rounded-full flex items-center justify-center text-zinc-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ReaderContent />
    </Suspense>
  );
}