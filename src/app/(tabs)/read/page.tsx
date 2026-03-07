"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, BookOpen, AlertCircle, Globe 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- LANGUAGE CONFIG ---
const LANGUAGES = [
  { code: 'hin', name: 'Hindi', file: 'hin-hindi-osis.xml', flag: '🇮🇳' },
  { code: 'eng', name: 'English', file: 'eng-web-osis.xml', flag: '🇬🇧' },
  { code: 'spa', name: 'Spanish', file: 'spa-rvr1909.xml', flag: '🇪🇸' },
  { code: 'fre', name: 'French', file: 'fre-lsg.xml', flag: '🇫🇷' },
  { code: 'ger', name: 'German', file: 'ger-schl2000.xml', flag: '🇩🇪' },
  { code: 'por', name: 'Portuguese', file: 'por-almeida.xml', flag: '🇵🇹' },
  { code: 'tam', name: 'Tamil', file: 'tam-irv.xml', flag: '🇮🇳' },
  { code: 'tel', name: 'Telugu', file: 'tel-irv.xml', flag: '🇮🇳' },
];

// --- XML PARSER ---
function parseXMLToVerses(xmlText: string, bookName: string, chapterNum: number) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  let verses: { verse: number; text: string }[] = [];
  
  const books = xmlDoc.getElementsByTagName("book");
  let targetBook: Element | null = null;
  
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const nameAttr = book.getAttribute("name")?.toLowerCase() || "";
    const idAttr = book.getAttribute("id")?.toLowerCase() || "";
    if (nameAttr.includes(bookName.toLowerCase()) || idAttr.includes(bookName.toLowerCase())) {
      targetBook = book;
      break;
    }
  }
  
  if (!targetBook && books.length > 0) targetBook = books[0];
  
  if (targetBook) {
    const chapters = targetBook.getElementsByTagName("chapter");
    const chapter = chapters[chapterNum - 1];
    if (chapter) {
      const verseElements = chapter.getElementsByTagName("verse");
      for (let i = 0; i < verseElements.length; i++) {
        const verseEl = verseElements[i];
        const vNum = parseInt(verseEl.getAttribute("number") || verseEl.getAttribute("verse") || (i + 1).toString());
        let text = verseEl.textContent || "";
        // CLEANING: Remove Strong's Numbers (G1234, H5678)
        text = text.replace(/\b[G|H]\d+\b/g, '').replace(/\s+/g, ' ').trim();
        if (text) verses.push({ verse: vNum, text });
      }
    }
  }
  return verses;
}

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
  const [searchQuery, setSearchQuery] = useState("");

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const isHindi = langCode === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toString().toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() || 
    b.hi === bookParam ||
    b.usfm?.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'GEN')!;

  const loadBibleContent = useCallback(async (book: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    const bookName = currentBookData.en.toLowerCase();
    
    try {
      const response = await fetch(`/bible/${language.file}`);
      if (!response.ok) throw new Error(`File /bible/${language.file} missing!`);
      const xmlText = await response.text();
      const verses = parseXMLToVerses(xmlText, bookName, chapter);
      
      if (verses.length > 0) {
        const html = verses.map(v => 
          `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${v.text}</span></p>`
        ).join("");
        setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</div>${html}`);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        throw new Error(`Data not found in XML for ${bookName} ${chapter}`);
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
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', newBook);
      params.set('chapter', newChapter.toString());
      params.set('lang', newLang || langCode);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const toggleAudio = () => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    const text = document.querySelector('.bible-content')?.textContent || "";
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'hin' ? 'hi-IN' : 'en-US';
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
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 active:scale-95 transition-all">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 italic">
                  {isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-widest font-black mt-1.5">
                {currentLang.flag} {currentLang.name}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 max-h-[85vh] w-[95%] rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" /> Select Scripture
              </DialogTitle>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-3 mt-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
            </DialogHeader>
            <Tabs defaultValue="old" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl">
                <TabsTrigger value="old" className="flex-1 rounded-xl text-xs">OT</TabsTrigger>
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-xs">Apo</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-xs">NT</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 px-6 py-4">
                {['old', 'deuterocanon', 'new'].map(t => (
                  <TabsContent key={t} value={t} className="grid grid-cols-1 gap-1.5">
                    {filteredBooks(t as any).map(b => (
                      <button key={b.id} onClick={() => handleUpdateNavigation(b.id, 1)} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-left hover:border-emerald-500/30 transition-all flex justify-between items-center">
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

        <Dialog open={langSelectorOpen} onOpenChange={setLangSelectorOpen}>
          <DialogTrigger asChild>
            <button className="size-11 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-all">
              <Globe className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 w-[90%] max-w-sm rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-xl flex items-center gap-3">
                <Languages className="w-6 h-6" /> Language
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-4">
              <div className="space-y-2">
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => handleUpdateNavigation(bookParam, chapterNum, lang.code)} className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${langCode === lang.code ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30'}`}>
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
            <button onClick={() => loadBibleContent(bookParam, chapterNum, langCode)} className="mt-8 px-8 py-3 bg-emerald-500/20 text-emerald-500 rounded-full font-bold">Retry</button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="w-full py-16 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center gap-6 hover:border-emerald-500/30 transition-all mt-12 mb-20 group">
              <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-xl"><ArrowRight className="w-6 h-6 text-emerald-500" /></div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Next Chapter</span>
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-xs z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} className="size-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={toggleAudio} className="flex-1 mx-2 flex items-center justify-center gap-2 bg-emerald-500 text-black py-3 rounded-full shadow-xl group hover:bg-emerald-400">
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="size-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .verse-num { font-weight: 900; color: #10b981 !important; margin-right: 10px; font-size: 0.7em; opacity: 0.6; }
        .bible-content .verse-text, .bible-content p { margin-bottom: 1.5rem; line-height: 1.8; font-family: 'Playfair Display', serif; color: #e4e4e7 !important; font-size: 1.15rem; }
        .bible-content .chapter-title { font-size: 1.6rem; color: #10b981; font-family: 'Playfair Display', serif; font-weight: bold; margin-bottom: 1.5rem; border-left: 4px solid #10b981; padding-left: 1rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#09090b]"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>}>
      <ReaderContent />
    </Suspense>
  );
}