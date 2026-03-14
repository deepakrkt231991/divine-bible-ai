
"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, BookOpen, AlertCircle, Globe 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
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
  
  const books = xmlDoc.getElementsByTagName("book");
  let targetBook: Element | null = null;
  
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const nameAttr = book.getAttribute("name")?.toLowerCase() || "";
    const idAttr = book.getAttribute("id")?.toLowerCase() || "";
    const osisAttr = book.getAttribute("osisID")?.toLowerCase() || "";
    if (nameAttr.includes(bookName.toLowerCase()) || idAttr.includes(bookName.toLowerCase()) || osisAttr.includes(bookName.toLowerCase())) {
      targetBook = book;
      break;
    }
  }
  
  if (!targetBook && books.length > 0) targetBook = books[0];
  
  if (targetBook) {
    const chapters = targetBook.getElementsByTagName("chapter");
    if (chapters[chapterNum - 1]) {
      const verseElements = chapters[chapterNum - 1].getElementsByTagName("verse");
      for (let i = 0; i < verseElements.length; i++) {
        const vEl = verseElements[i];
        let text = vEl.textContent || "";
        text = text.replace(/\b[G|H]\d+\b/g, ''); // Clean Strong's numbers
        text = text.replace(/\s+/g, ' ').trim();
        if (text) verses.push({ verse: parseInt(vEl.getAttribute("verse") || (i + 1).toString()), text });
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
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const isHindi = langCode === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() || 
    b.hi === bookParam
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  const loadBibleContent = useCallback(async (book: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
      const response = await fetch(`/bible/${language.file}`);
      if (!response.ok) throw new Error(`File ${language.file} not found.`);
      const xmlText = await response.text();
      const verses = parseXMLToVerses(xmlText, currentBookData.en, chapter);
      
      if (verses.length > 0) {
        const html = verses.map(v => 
          `<p><span class="verse-num">${v.verse}</span>${v.text}</p>`
        ).join("");
        setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</div>${html}`);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        throw new Error("No data found.");
      }
    } catch (e: any) {
      setError(e.message);
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0B0C0D] text-zinc-100 overflow-hidden relative">
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0B0C0D]/95 backdrop-blur-xl sticky top-0 z-50">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-primary italic leading-none">
                  {isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-widest font-black mt-1">
                {currentLang.flag} {currentLang.name}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0B0C0D] border-white/5 w-[95%] rounded-[2rem] max-h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-primary font-serif text-2xl">Select Book</DialogTitle>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 mt-4 text-sm outline-none" />
            </DialogHeader>
            <Tabs defaultValue="old" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="bg-zinc-900 mx-6 mb-2">
                <TabsTrigger value="old" className="flex-1">OT</TabsTrigger>
                <TabsTrigger value="new" className="flex-1">NT</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 p-6 pt-0">
                {['old', 'new'].map(t => (
                  <TabsContent key={t} value={t} className="grid grid-cols-2 gap-2 m-0">
                    {BIBLE_BOOKS.filter(b => b.testament === t && (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || b.hi.includes(searchQuery))).map(b => (
                      <button key={b.id} onClick={() => handleUpdateNavigation(b.id, 1)} className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 text-left">
                        <div className="font-bold text-xs">{isHindi ? b.hi : b.en}</div>
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
            <button className="size-11 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-primary"><Globe className="w-5 h-5" /></button>
          </DialogTrigger>
          <DialogContent className="bg-[#0B0C0D] border-white/5 w-[90%] rounded-2xl">
            <DialogTitle className="text-primary font-serif p-4">Languages</DialogTitle>
            <div className="space-y-1 p-4 pt-0">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { handleUpdateNavigation(bookParam, chapterNum, l.code); setLangSelectorOpen(false); }} className={cn("w-full p-4 rounded-xl flex items-center gap-4", langCode === l.code ? "bg-primary/20 text-primary border border-primary/30" : "bg-zinc-900")}>
                  <span>{l.flag}</span> <span className="font-bold text-sm">{l.name}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-40 hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-40 opacity-50">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Loading Scripture</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500/30 mb-4" />
            <p className="text-zinc-500 text-sm">{error}</p>
            <button onClick={() => loadBibleContent(bookParam, chapterNum, langCode)} className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold">Retry</button>
          </div>
        ) : (
          <div className="bible-content animate-in fade-in duration-700">
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="w-full py-16 border-2 border-dashed border-white/5 rounded-[3rem] mt-12 flex flex-col items-center gap-4 text-zinc-600 hover:text-primary hover:border-primary/20 transition-all">
              <ArrowRight className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-widest">Next Chapter</span>
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
        <div className="bg-[#0B0C0D]/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} className="size-10 rounded-full flex items-center justify-center text-zinc-500"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={toggleAudio} className="flex-1 mx-2 bg-accent text-white py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? 'Stop' : 'Suniye'}</span>
          </button>
          <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="size-10 rounded-full flex items-center justify-center text-zinc-500"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

export default function BibleReaderPage() {
  return <Suspense fallback={<div className="bg-[#0B0C0D] h-screen" />}><ReaderContent /></Suspense>;
}
