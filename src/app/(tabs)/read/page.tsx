"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, 
  BookOpen, AlertCircle, Globe, List, Grid3X3 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- LANGUAGE CONFIGURATION (JSON FILES) ---
const LANGUAGES = [
  { code: 'hin', name: 'Hindi', file: 'hin-hindi-osis.json', flag: '🇮🇳' },
  { code: 'eng', name: 'English', file: 'eng-web-osis.json', flag: '🇬🇧' },
  { code: 'spa', name: 'Spanish', file: 'spa-rvr1909.json', flag: '🇪🇸' },
  { code: 'fre', name: 'French', file: 'fre-lsg.json', flag: '🇫🇷' },
  { code: 'ger', name: 'German', file: 'ger-schl2000.json', flag: '🇩🇪' },
  { code: 'por', name: 'Portuguese', file: 'por-almeida.json', flag: '🇵🇹' },
  { code: 'tam', name: 'Tamil', file: 'tam-irv.json', flag: '🇮🇳' },
  { code: 'tel', name: 'Telugu', file: 'tel-irv.json', flag: '🇮🇳' },
  { code: 'mar', name: 'Marathi', file: 'mar-irv.json', flag: '🇮🇳' }, // ✅ FIX 3: Added Marathi
];

// --- BOOK NAME TO 3-LETTER CODE MAPPING ---
const BOOK_CODE_MAP: Record<string, string> = {
  "genesis": "gen", "exodus": "exo", "leviticus": "lev", "numbers": "num",
  "deuteronomy": "deu", "joshua": "jos", "judges": "jdg", "ruth": "rut",
  "1 samuel": "1sa", "2 samuel": "2sa", "1 kings": "1ki", "2 kings": "2ki",
  "1 chronicles": "1ch", "2 chronicles": "2ch", "ezra": "ezr", "nehemiah": "neh",
  "esther": "est", "job": "job", "psalms": "psa", "proverbs": "pro",
  "ecclesiastes": "ecc", "song of solomon": "sng", "isaiah": "isa",
  "jeremiah": "jer", "lamentations": "lam", "ezekiel": "ezk", "daniel": "dan",
  "hosea": "hos", "joel": "jol", "amos": "amo", "obadiah": "oba",
  "jonah": "jon", "micah": "mic", "nahum": "nah", "habakkuk": "hab",
  "zephaniah": "zep", "haggai": "hag", "zechariah": "zec", "malachi": "mal",
  "matthew": "mat", "mark": "mrk", "luke": "luk", "john": "jhn",
  "acts": "act", "romans": "rom", "1 corinthians": "1co", "2 corinthians": "2co",
  "galatians": "gal", "ephesians": "eph", "philippians": "php", "colossians": "col",
  "1 thessalonians": "1th", "2 thessalonians": "2th", "1 timothy": "1ti",
  "2 timothy": "2ti", "titus": "tit", "philemon": "phm", "hebrews": "heb",
  "james": "jas", "1 peter": "1pe", "2 peter": "2pe", "1 john": "1jn",
  "2 john": "2jn", "3 john": "3jn", "jude": "jud", "revelation": "rev"
};

// --- JSON PARSER (Christos-C Bible Corpus Format - 3-Letter Codes) ---
function parseJSONToVerses(jsonData: any, bookName: string, chapterNum: number) {
  try {
    const bookNameLower = bookName.toLowerCase();
    const possibleKeys = [
      BOOK_CODE_MAP[bookNameLower],
      bookNameLower.substring(0, 3),
      bookNameLower,
      bookNameLower.toUpperCase(),
      BOOK_CODE_MAP[bookNameLower]?.toUpperCase(),
    ].filter(Boolean);
    
    let bookKey: string | undefined;
    for (const key of possibleKeys) {
      if (jsonData[key]) { bookKey = key; break; }
    }
    
    if (!bookKey) {
      console.warn(`⚠️ Book "${bookName}" not found. Tried: ${possibleKeys.join(', ')}`);
      return [];
    }
    
    const bookData = jsonData[bookKey];
    const chapterKey = chapterNum.toString();
    const chapterData = bookData[chapterKey] || bookData[chapterNum];
    
    if (!chapterData || !Array.isArray(chapterData)) return [];
    
    return chapterData
      .map((v: any) => ({ verse: v.verse || v.number || 0, text: (v.text || '').trim() }))
      .filter((v: any) => v.text && v.text.length > 0);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return [];
  }
}

// --- CHAPTER SELECTOR DROPDOWN COMPONENT ---
const ChapterSelector = ({ currentChapter, totalChapters, onSelect, isHindi, bookName }: {
  currentChapter: number;
  totalChapters: number;
  onSelect: (chapter: number) => void;
  isHindi: boolean;
  bookName: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const maxChapters = Math.min(totalChapters, 150);
  const chapters = Array.from({ length: maxChapters }, (_, i) => i + 1);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-sm text-white hover:border-emerald-500/30 transition-all"
      >
        <span className="font-bold">Ch. {currentChapter}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl z-50 w-48 max-h-64 overflow-hidden">
          <ScrollArea className="p-2">
            <div className="grid grid-cols-5 gap-1">
              {chapters.map(ch => (
                <button
                  key={ch}
                  onClick={() => { onSelect(ch); setIsOpen(false); }}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    ch === currentChapter 
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' 
                      : 'hover:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const bookParam = searchParams.get('book') || 'GEN';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const langCode = searchParams.get('lang') || 'hin';

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [chapterGridOpen, setChapterGridOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableChapters, setAvailableChapters] = useState<number[]>([]);

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const isHindi = langCode === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toString().toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() || 
    b.hi === bookParam ||
    b.usfm?.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'GEN')!;

  // --- LOAD BIBLE CONTENT FROM JSON ---
  const loadBibleContent = useCallback(async (book: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    
    const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    const bookName = currentBookData.en.toLowerCase();
    
    console.log(`📖 Loading: ${bookName} ${chapter} from ${language.file}`);
    
    try {
      const response = await fetch(`/bible/${language.file}`);
      
      if (!response.ok) {
        throw new Error(`File /bible/${language.file} nahi mili! Status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Find available chapters for this book
      const bookNameLower = bookName.toLowerCase();
      const bookCode = BOOK_CODE_MAP[bookNameLower] || bookNameLower.substring(0, 3);
      const bookData = jsonData[bookCode] || jsonData[bookNameLower];
      
      if (bookData) {
        const chapters = Object.keys(bookData).map(k => parseInt(k)).filter(n => !isNaN(n)).sort((a, b) => a - b);
        setAvailableChapters(chapters);
      }
      
      const verses = parseJSONToVerses(jsonData, bookName, chapter);
      
      if (verses.length > 0) {
        console.log(`✅ Loaded ${verses.length} verses`);
        
        const html = verses.map(v => 
          `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${v.text}</span></p>`
        ).join("");
        
        setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</div>${html}`);
        
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        console.warn(`⚠️ No verses found for ${bookName} ${chapter}`);
        setContent(`
          <div class="p-10 text-center text-zinc-400">
            <p class="font-bold text-lg">⚠️ ${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</p>
            <p class="text-sm mt-2">Is chapter ka data abhi available nahi hai</p>
          </div>
        `);
        setLoading(false);
        return;
      }
      
    } catch (e: any) {
      console.error("❌ Error:", e);
      setError(`${currentBookData.hi} ${chapter} - ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentBookData, isHindi]);

  useEffect(() => {
    loadBibleContent(bookParam, chapterNum, langCode);
  }, [bookParam, chapterNum, langCode, loadBibleContent]);

  const handleUpdateNavigation = (newBook: string, newChapter: number, newLang?: string) => {
    setSelectorOpen(false);
    setChapterGridOpen(false);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', newBook);
      params.set('chapter', newChapter.toString());
      params.set('lang', newLang || langCode);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    const text = document.querySelector('.bible-content')?.textContent || "";
    if (!text) return;
    
    const langMap: Record<string, string> = {
      'hin': 'hi-IN', 'eng': 'en-US', 'spa': 'es-ES',
      'fre': 'fr-FR', 'ger': 'de-DE', 'por': 'pt-BR',
      'tam': 'ta-IN', 'tel': 'te-IN',
      'mar': 'mr-IN' // ✅ Added Marathi language code
    };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[langCode] || 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => 
    BIBLE_BOOKS.filter(b => 
      b.testament === testament && 
      (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
       b.hi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      
      {/* === HEADER === */}
      <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        
        {/* Book Selector */}
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-sm font-bold text-emerald-500 italic truncate max-w-[100px]">
                  {isHindi ? currentBookData.hi : currentBookData.en}
                </h2>
                <Search className="w-3 h-3 text-zinc-600" />
              </div>
              <span className="text-[8px] uppercase text-zinc-600 tracking-widest font-black mt-0.5">
                {currentLang.flag}
              </span>
            </button>
          </DialogTrigger>

          {/* ✅ FIX 2: Book List Scrolling - Added flex flex-col and proper height */}
          <DialogContent className="bg-[#09090b] border-white/5 max-h-[85vh] max-w-[95%] w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" /> Select Scripture
              </DialogTitle>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search books..." 
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-3 mt-4 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </DialogHeader>
            
            <Tabs defaultValue="old" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5">
                <TabsTrigger value="old" className="flex-1 rounded-xl text-xs font-bold">OT</TabsTrigger>
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-xs font-bold">Apo</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-xs font-bold">NT</TabsTrigger>
              </TabsList>
              
              {/* ✅ FIX 2: Added fixed height for proper scrolling */}
              <ScrollArea className="h-[400px] px-6 py-4">
                {['old', 'deuterocanon', 'new'].map((testament) => (
                  <TabsContent key={testament} value={testament} className="m-0 grid grid-cols-1 gap-1.5">
                    {filteredBooks(testament as any).map(b => (
                      <button 
                        key={b.id} 
                        onClick={() => handleUpdateNavigation(b.id, 1)}
                        className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-left hover:border-emerald-500/30 transition-all flex justify-between items-center"
                      >
                        <div className="font-bold text-sm">{isHindi ? b.hi : b.en}</div>
                        <div className="text-[10px] text-zinc-600">{b.chapters} Ch.</div>
                      </button>
                    ))}
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Chapter Display + Selector */}
        <div className="flex items-center gap-2">
          <ChapterSelector
            currentChapter={chapterNum}
            totalChapters={currentBookData.chapters || 50}
            onSelect={(ch) => handleUpdateNavigation(bookParam, ch)}
            isHindi={isHindi}
            bookName={currentBookData.en}
          />
          
          {/* Chapter Grid Button */}
          <button
            onClick={() => setChapterGridOpen(true)}
            className="size-9 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-emerald-500 transition-all"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selector */}
        <Dialog open={langSelectorOpen} onOpenChange={setLangSelectorOpen}>
          <DialogTrigger asChild>
            <button className="size-9 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-all">
              <Globe className="w-4 h-4" />
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#09090b] border-white/5 w-[90%] max-w-sm rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-xl flex items-center gap-3">
                <Languages className="w-6 h-6" /> Select Language
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-4">
              <div className="space-y-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleUpdateNavigation(bookParam, chapterNum, lang.code)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                      langCode === lang.code 
                        ? 'bg-emerald-500/20 border border-emerald-500/50' 
                        : 'bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-bold">{lang.name}</span>
                    {langCode === lang.code && <span className="ml-auto text-emerald-500 text-sm">✓</span>}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </header>

      {/* Chapter Grid Modal */}
      <Dialog open={chapterGridOpen} onOpenChange={setChapterGridOpen}>
        <DialogContent className="bg-[#09090b] border-white/5 w-[95%] max-w-md rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="p-6 border-b border-white/5">
            <DialogTitle className="text-emerald-500 font-serif text-xl flex items-center gap-3">
              <List className="w-6 h-6" /> 
              {isHindi ? currentBookData.hi : currentBookData.en} - Chapters
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-4">
            <div className="grid grid-cols-6 gap-2">
              {/* ✅ FIX 1: Chapter Grid - Show ONLY current book's chapters */}
              {Array.from({ length: currentBookData.chapters || 50 }, (_, i) => i + 1).map(ch => (
                <button
                  key={ch}
                  onClick={() => handleUpdateNavigation(bookParam, ch)}
                  className={`p-3 rounded-xl text-sm font-bold transition-all ${
                    ch === chapterNum 
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' 
                      : 'bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 text-zinc-300'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* === MAIN CONTENT === */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-40 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Loading {currentLang.name}...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/30 mb-6" />
            <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
            <p className="text-zinc-400 text-sm max-w-md">{error}</p>
            <button 
              onClick={() => loadBibleContent(bookParam, chapterNum, langCode)}
              className="mt-8 px-8 py-3 bg-emerald-500/20 text-emerald-500 rounded-full font-bold hover:bg-emerald-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div 
              className="bible-content prose prose-invert prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {/* Next Chapter Button */}
            <button 
              onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)}
              className="w-full py-16 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center gap-6 hover:border-emerald-500/30 transition-all mt-12 mb-20 group"
            >
              <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-xl">
                <ArrowRight className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">
                Next Chapter
              </span>
            </button>
          </div>
        )}
      </main>

      {/* === COMPACT AUDIO BAR (Bottom-20, Touch Responsive) === */}
      {/* ✅ FIX 5: Bottom Panel - Already has 'fixed' class, just verifying */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-xs z-[70] pointer-events-auto">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl touch-manipulation">
          
          {/* ✅ FIX 4: Audio Icons Smaller - Changed size-10 to size-8, icons to w-4 h-4 */}
          <button 
            type="button"
            onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))}
            className="size-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all active:scale-95 touch-manipulation"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* ✅ FIX 4: Audio Button Smaller - py-3 to py-2, text-[10px] to text-[9px], icons to w-3 h-3 */}
          <button 
            type="button"
            onClick={toggleAudio}
            className="flex-1 mx-2 flex items-center justify-center gap-2 bg-emerald-500 text-black py-2 rounded-full shadow-xl group hover:bg-emerald-400 transition-all active:scale-95 touch-manipulation"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-black" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Suniye</span>
              </>
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)}
            className="size-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all active:scale-95 touch-manipulation"
            title="Next Chapter"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* === GLOBAL CSS FOR VERSE STYLING === */}
      <style jsx global>{`
        .bible-content .verse-num { 
          font-weight: 900; 
          color: #10b981 !important; 
          margin-right: 10px; 
          font-size: 0.7em;
          opacity: 0.6;
        }
        .bible-content .verse-text, 
        .bible-content p { 
          margin-bottom: 1.5rem; 
          line-height: 1.8; 
          font-family: 'Playfair Display', serif; 
          color: #e4e4e7 !important; 
          font-size: 1.15rem;
        }
        .bible-content .chapter-title { 
          font-size: 1.6rem; 
          color: #10b981; 
          font-family: 'Playfair Display', serif; 
          font-weight: bold; 
          margin-bottom: 1.5rem;
          border-left: 4px solid #10b981; 
          padding-left: 1rem; 
        }
        .hide-scrollbar::-webkit-scrollbar { 
          display: none; 
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}