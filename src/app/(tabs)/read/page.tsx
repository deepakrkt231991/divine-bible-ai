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

function parseXMLToVerses(xmlText: string, bookName: string, chapterNum: number) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  let verses: { verse: number; text: string }[] = [];
  
  const books = xmlDoc.getElementsByTagName("book") || xmlDoc.getElementsByTagName("BOOK");
  let targetBook: Element | null = null;
  
  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const bId = b.getAttribute("id") || b.getAttribute("name") || b.getAttribute("osisID") || "";
    if (bId.toLowerCase().includes(bookName.toLowerCase())) {
      targetBook = b;
      break;
    }
  }
  
  if (!targetBook && books.length > 0) targetBook = books[0];
  
  if (targetBook) {
    const chapters = targetBook.getElementsByTagName("chapter") || targetBook.getElementsByTagName("CHAPTER");
    const chapter = Array.from(chapters).find(c => (c.getAttribute("number") || c.getAttribute("osisID")?.split('.').pop()) === chapterNum.toString());
    
    if (chapter) {
      const verseElements = chapter.getElementsByTagName("verse") || chapter.getElementsByTagName("VERSE");
      for (let i = 0; i < verseElements.length; i++) {
        const v = verseElements[i];
        let text = v.textContent || "";
        text = text.replace(/\b[G|H]\d+\b/g, '').replace(/\s+/g, ' ').trim();
        if (text) {
          verses.push({ verse: parseInt(v.getAttribute("number") || v.getAttribute("verse") || (i + 1).toString()), text });
        }
      }
    }
  }
  return verses;
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const bookParam = searchParams.get('book') || 'MAT';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const langCode = searchParams.get('lang') || 'hin';

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const isHindi = langCode === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() || 
    b.hi === bookParam
  ) || BIBLE_BOOKS[0];

  const loadBibleContent = useCallback(async (book: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
      const res = await fetch(`/bible/${language.file}`);
      if (!res.ok) throw new Error(`File /public/bible/${language.file} not found.`);
      const xmlText = await res.text();
      const verses = parseXMLToVerses(xmlText, currentBookData.en, chapter);
      
      if (verses.length > 0) {
        const html = verses.map(v => `<p class="v-row"><span class="v-num">${v.verse}</span><span class="v-txt">${v.text}</span></p>`).join("");
        setContent(`<div class="ch-title">${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</div>${html}`);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        throw new Error("Vachan is file mein nahi mile.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentBookData, isHindi]);

  useEffect(() => { loadBibleContent(bookParam, chapterNum, langCode); }, [bookParam, chapterNum, langCode, loadBibleContent]);

  const navigate = (b: string, c: number, l?: string) => {
    setSelectorOpen(false);
    setLangOpen(false);
    startTransition(() => {
      const p = new URLSearchParams();
      p.set('book', b); p.set('chapter', c.toString()); p.set('lang', l || langCode);
      router.push(`?${p.toString()}`, { scroll: false });
    });
  };

  const toggleAudio = () => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    const t = document.querySelector('.bible-content')?.textContent || "";
    if (!t) return;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = isHindi ? 'hi-IN' : 'en-US';
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-50">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 italic">{isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}</h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-widest font-black mt-1">{currentLang.flag} {currentLang.name}</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 max-h-[85vh] w-[95%] rounded-[2rem]">
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-2xl flex items-center gap-3"><BookOpen className="w-6 h-6" /> Pustak Chuniye</DialogTitle>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Khojein..." className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 mt-4 text-sm outline-none" />
            </DialogHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="grid grid-cols-1 gap-2">
                {BIBLE_BOOKS.filter(b => b.hi.includes(searchQuery) || b.en.toLowerCase().includes(searchQuery.toLowerCase())).map(b => (
                  <button key={b.id} onClick={() => navigate(b.id, 1)} className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 text-left flex justify-between">
                    <span className="font-bold">{isHindi ? b.hi : b.en}</span>
                    <span className="text-[10px] text-zinc-600">{b.chapters} Chapters</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <button onClick={() => setLangOpen(true)} className="size-11 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500"><Globe className="w-5 h-5" /></button>
        <Dialog open={langOpen} onOpenChange={setLangOpen}>
          <DialogContent className="bg-[#09090b] border-white/5 w-[90%] max-w-sm rounded-2xl">
            <DialogHeader><DialogTitle className="text-emerald-500">Language Select</DialogTitle></DialogHeader>
            <div className="space-y-2 p-4">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => navigate(bookParam, chapterNum, l.code)} className={`w-full p-4 rounded-xl flex items-center gap-4 border transition-all ${langCode === l.code ? 'bg-emerald-500/10 border-emerald-500' : 'bg-zinc-900 border-white/5'}`}>
                  <span className="text-xl">{l.flag}</span><span className="font-bold">{l.name}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-32 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full py-40 opacity-40">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-[10px] uppercase tracking-widest mt-4">Sacred Content Loading...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500/30 mb-4" />
            <p className="text-sm text-zinc-400">{error}</p>
            <button onClick={() => loadBibleContent(bookParam, chapterNum, langCode)} className="mt-4 px-6 py-2 bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold">Retry</button>
          </div>
        ) : (
          <div className="bible-content prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </main>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-50">
        <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button onClick={() => navigate(bookParam, Math.max(1, chapterNum - 1))} className="size-9 rounded-full flex items-center justify-center text-zinc-600"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={toggleAudio} className="flex-1 mx-2 bg-emerald-500 text-black py-2.5 rounded-full flex items-center justify-center gap-2 group">
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          <button onClick={() => navigate(bookParam, chapterNum + 1)} className="size-9 rounded-full flex items-center justify-center text-zinc-600"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <style jsx global>{`
        .bible-content .v-num { font-weight: 900; color: #10b981; margin-right: 12px; font-size: 0.7em; opacity: 0.6; }
        .bible-content .v-txt, .bible-content p { margin-bottom: 1.5rem; line-height: 1.8; font-family: serif; color: #e4e4e7; font-size: 1.15rem; }
        .bible-content .ch-title { font-size: 1.6rem; color: #10b981; font-weight: 900; margin-bottom: 2rem; border-left: 4px solid #10b981; padding-left: 1rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default function BibleReaderPage() { return ( <Suspense><ReaderContent /></Suspense> ); }