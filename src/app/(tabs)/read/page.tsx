
"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, BookOpen, AlertCircle, Globe 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
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

// --- CLEAN XML PARSER ---
function parseBibleXML(xmlText: string, bookName: string, chapterNum: number) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  let verses: { verse: number; text: string }[] = [];

  // Try OSIS format (Common in Beblia)
  const books = xmlDoc.getElementsByTagName("div");
  let targetBook: Element | null = null;

  for (let i = 0; i < books.length; i++) {
    const osisID = books[i].getAttribute("osisID")?.toLowerCase() || "";
    if (osisID.includes(bookName.toLowerCase())) {
      targetBook = books[i];
      break;
    }
  }

  // Fallback to "book" tag
  if (!targetBook) {
    const bookTags = xmlDoc.getElementsByTagName("book");
    for (let i = 0; i < bookTags.length; i++) {
      const name = bookTags[i].getAttribute("name")?.toLowerCase() || "";
      if (name.includes(bookName.toLowerCase())) {
        targetBook = bookTags[i];
        break;
      }
    }
  }

  if (targetBook) {
    const chapters = targetBook.getElementsByTagName("chapter");
    const chapter = chapters[chapterNum - 1];
    if (chapter) {
      const verseElements = chapter.getElementsByTagName("verse");
      for (let i = 0; i < verseElements.length; i++) {
        const vNum = verseElements[i].getAttribute("n") || verseElements[i].getAttribute("verse") || (i + 1);
        let vText = verseElements[i].textContent || "";
        
        // CLEANING: Remove Strong's Numbers (G1234, H5678)
        vText = vText.replace(/\b[GH]\d+\b/g, "");
        // Remove numerical noise but keep words
        vText = vText.replace(/\s+/g, " ").trim();
        
        if (vText) verses.push({ verse: parseInt(vNum.toString()), text: vText });
      }
    }
  }
  return verses;
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
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
  ) || BIBLE_BOOKS.find(b => b.id === 1)!;

  const loadBibleContent = useCallback(async (bookName: string, cid: number, lang: string) => {
    setLoading(true);
    setError(null);
    try {
      const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
      const res = await fetch(`/bible/${language.file}`);
      if (!res.ok) throw new Error("Bible file not found");
      
      const xmlText = await res.text();
      const verses = parseBibleXML(xmlText, currentBookData.usfm, cid);

      if (verses.length > 0) {
        const html = verses.map(v => 
          `<p class="verse-row"><span class="v-num">${v.verse}</span> <span class="v-txt">${v.text}</span></p>`
        ).join("");
        setContent(`<div class="ch-title">${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</div>${html}`);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        // Fallback to Bolls.life if XML is empty or missing specific book
        const bollsTrans = lang === 'hin' ? 'HINIRV' : 'KJV';
        const bollsUrl = `https://bolls.life/get-chapter/${bollsTrans}/${currentBookData.bollsId}/${cid}/`;
        const bRes = await fetch(bollsUrl);
        const bData = await bRes.json();
        if (Array.isArray(bData)) {
          const html = bData.map(v => `<p class="verse-row"><span class="v-num">${v.verse}</span> <span class="v-txt">${v.text}</span></p>`).join("");
          setContent(`<div class="ch-title">${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</div>${html}`);
        } else {
          throw new Error("Content not found");
        }
      }
    } catch (e: any) {
      setError("Scripture load nahi ho pa raha hai. Internet ya files check karein.");
    } finally {
      setLoading(false);
    }
  }, [currentBookData, isHindi]);

  useEffect(() => {
    loadBibleContent(bookParam, chapterNum, langCode);
  }, [bookParam, chapterNum, langCode, loadBibleContent]);

  const handleUpdateNavigation = (newBook: string, newChapter: number, newLang?: string) => {
    setSelectorOpen(false);
    setLangSelectorOpen(false);
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
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const filteredBooks = (testament: string) => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || b.hi.includes(searchQuery))
  );

  return (
    <div className="flex flex-col h-screen bg-[#0B0C0D] text-zinc-100 overflow-hidden relative">
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0B0C0D]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-primary capitalize italic">
                  {isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-widest font-black mt-1">
                {currentLang.flag} {currentLang.name}
              </span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#0B0C0D] border-white/5 p-0 max-h-[85vh] w-[95%] rounded-[2.5rem]">
             <DialogHeader className="p-6 border-b border-white/5">
               <DialogTitle className="text-primary font-serif italic text-2xl">Select Book</DialogTitle>
               <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 mt-4 text-sm outline-none" />
             </DialogHeader>
             <Tabs defaultValue="old" className="flex-1 overflow-hidden flex flex-col">
               <TabsList className="bg-zinc-900 mx-6 mt-4">
                 <TabsTrigger value="old" className="flex-1">OT</TabsTrigger>
                 <TabsTrigger value="deuterocanon" className="flex-1">Apo</TabsTrigger>
                 <TabsTrigger value="new" className="flex-1">NT</TabsTrigger>
               </TabsList>
               <ScrollArea className="flex-1 px-6 py-4">
                 {['old', 'deuterocanon', 'new'].map(t => (
                   <TabsContent key={t} value={t} className="grid grid-cols-1 gap-2">
                     {filteredBooks(t).map(b => (
                       <button key={b.id} onClick={() => handleUpdateNavigation(b.usfm, 1)} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-left hover:border-primary/30">
                         <div className="font-bold">{isHindi ? b.hi : b.en}</div>
                         <div className="text-[10px] text-zinc-600 uppercase">{b.chapters} Chapters</div>
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
            <button className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 text-primary">
              <Globe className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0B0C0D] border-white/5 rounded-3xl w-[90%]">
            <DialogHeader><DialogTitle>Language</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => handleLanguageChange(l.code)} className={cn("p-4 rounded-2xl flex items-center gap-4", langCode === l.code ? "bg-primary/10 border-primary/30" : "bg-zinc-900")}>
                  <span className="text-xl">{l.flag}</span>
                  <span className="font-bold">{l.name}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* CONTENT */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-40 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full py-40 opacity-40">
            <Loader2 className="w-14 h-14 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-40">
            <AlertCircle className="w-16 h-16 text-red-500/30 mx-auto mb-6" />
            <p className="text-zinc-400">{error}</p>
            <button onClick={() => loadBibleContent(bookParam, chapterNum, langCode)} className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold">Retry</button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 group">
              <ArrowRight className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-primary">Next Chapter</span>
            </button>
          </div>
        )}
      </main>

      {/* AUDIO PILL */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-[70]">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} className="size-9 rounded-full flex items-center justify-center text-zinc-600"><ChevronLeft /></button>
          <button onClick={toggleAudio} className="flex-1 mx-2 flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-full shadow-lg">
            {isPlaying ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="size-9 rounded-full flex items-center justify-center text-zinc-600"><ChevronRight /></button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .ch-title { font-size: 2rem; font-family: 'Playfair Display', serif; font-weight: 900; font-style: italic; color: #1A60E5; margin-bottom: 2rem; border-left: 6px solid #07BF7A; padding-left: 1.5rem; }
        .bible-content .v-num { font-weight: 900; color: #07BF7A; font-size: 0.7em; margin-right: 12px; vertical-align: super; }
        .bible-content .v-txt { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.2rem; line-height: 1.8; color: #e4e4e7; }
        .bible-content .verse-row { margin-bottom: 1.5rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-[#0B0C0D]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
      <ReaderContent />
    </Suspense>
  );
}
