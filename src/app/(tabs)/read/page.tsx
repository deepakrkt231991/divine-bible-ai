
"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- CONFIG ---
const API_KEY = "IUbCPlFtzubFZp2RXPeUglroSB2EGGfCx52N67Xtw8AknzH6";
const BIBLE_ID_HIN = "27931f79a0224647-01"; // Hindi IRV
const BIBLE_ID_ENG = "de4e12af7f29f59f-01"; // English KJV

// USFM Code Map (Book Name -> YouVersion Code)
const USFM_MAP: Record<string, string> = {
  "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM", "deuteronomy": "DEU",
  "joshua": "JOS", "judges": "JDG", "ruth": "RUT", "1 samuel": "1SA", "2 samuel": "2SA",
  "1 kings": "1KI", "2 kings": "2KI", "1 chronicles": "1CH", "2 chronicles": "2CH", "ezra": "EZR",
  "nehemiah": "NEH", "esther": "EST", "job": "JOB", "psalms": "PSA", "proverbs": "PRO",
  "ecclesiastes": "ECC", "song of solomon": "SNG", "isaiah": "ISA", "jeremiah": "JER", "lamentations": "LAM",
  "ezekiel": "EZK", "daniel": "DAN", "hosea": "HOS", "joel": "JOL", "amos": "AMO",
  "obadiah": "OBA", "jonah": "JON", "micah": "MIC", "nahum": "NAM", "habakkuk": "HAB",
  "zephaniah": "ZEP", "haggai": "HAG", "zechariah": "ZEC", "malachi": "MAL",
  "matthew": "MAT", "mark": "MRK", "luke": "LUK", "john": "JHN", "acts": "ACT",
  "romans": "ROM", "1 corinthians": "1CO", "2 corinthians": "2CO", "galatians": "GAL", "ephesians": "EPH",
  "philippians": "PHP", "colossians": "COL", "1 thessalonians": "1TH", "2 thessalonians": "2TH", "1 timothy": "1TI",
  "2 timothy": "2TI", "titus": "TIT", "philemon": "PHM", "hebrews": "HEB", "james": "JAS",
  "1 peter": "1PE", "2 peter": "2PE", "1 john": "1JN", "2 john": "2JN", "3 john": "3JN",
  "jude": "JUD", "revelation": "REV"
};

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const bookParam = searchParams.get('book') || 'MAT';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const version = searchParams.get('version') || 'hin_irv';

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const isHindi = version === 'hin_irv';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Smart Book Finder
  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toString().toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() ||
    b.hi === bookParam ||
    b.usfm?.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  // --- API LOADER ---
  const loadBibleContent = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    try {
      const bibleId = ver === 'hin_irv' ? BIBLE_ID_HIN : BIBLE_ID_ENG;
      const bookName = currentBookData.en.toLowerCase();
      const usfmCode = USFM_MAP[bookName] || bookName.substring(0, 3).toUpperCase();

      // ATTEMPT 1: YouVersion API (Primary)
      // Format: CHAPTER_ID = USFM + Number (e.g., GEN1, MAT2)
      const chapterId = `${usfmCode}${cid}`;
      const apiUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true`;

      const res = await fetch(apiUrl, {
        headers: { "api-key": API_KEY }
      });

      if (res.ok) {
        const data = await res.json();
        // YouVersion returns HTML content directly
        setContent(data.data.content);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        setLoading(false);
        return;
      }

      // ATTEMPT 2: Bolls.life API (Fallback - Free & Reliable)
      // Format: uses Book ID (Numeric)
      console.warn("YouVersion failed, trying Bolls.life fallback...");
      const bollsTrans = ver === 'hin_irv' ? 'HINIRV' : 'KJV';
      const bookIdNum = currentBookData.bollsId || currentBookData.id;
      const fallbackUrl = `https://bolls.life/get-chapter/${bollsTrans}/${bookIdNum}/${cid}/`;
      
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const fData = await fallbackRes.json();
        if (Array.isArray(fData)) {
          const html = fData.map(v => {
            const cleanText = v.text.replace(/<(?:.|\n)*?>/gm, '');
            return `<p><span class="v">${v.verse}</span> ${cleanText}</p>`;
          }).join("");
          setContent(`<h3>${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</h3>${html}`);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
          setLoading(false);
          return;
        }
      }

      throw new Error("Content not available");

    } catch (e) {
      console.error("Error:", e);
      setContent(`<div class="p-10 text-center text-zinc-500">
        <div class="flex justify-center mb-4 opacity-20">
          <AlertCircle className="w-12 h-12" />
        </div>
        <p class="font-bold">Vachan Load Nahi Hua</p>
        <p class="text-sm mt-2">Internet Connection ya API Key check karein.</p>
      </div>`);
    } finally {
      setLoading(false);
    }
  }, [currentBookData, isHindi]);

  useEffect(() => {
    loadBibleContent(bookParam, chapterNum, version);
  }, [bookParam, chapterNum, version, loadBibleContent]);

  const handleUpdateNavigation = (newBook: string, newChapter: number, newVersion?: string) => {
    setSelectorOpen(false);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', newBook.toString());
      params.set('chapter', newChapter.toString());
      params.set('version', newVersion || version);
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

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || b.hi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic leading-none">
                  {isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.3em] font-black mt-1.5">
                {isHindi ? 'Hindi IRV' : 'English KJV'}
              </span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem]">
             <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
               <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                 <BookOpen className="w-6 h-6" /> Pustak Chuniye
               </DialogTitle>
               <div className="relative mt-4">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500/30" />
               </div>
             </DialogHeader>
             <Tabs defaultValue="old" className="flex-1 flex flex-col overflow-hidden">
               <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5 h-12">
                 <TabsTrigger value="old" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">OT</TabsTrigger>
                 <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">81-Book</TabsTrigger>
                 <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">NT</TabsTrigger>
               </TabsList>
               <ScrollArea className="flex-1 px-6 py-4">
                 {['old', 'deuterocanon', 'new'].map((testament) => (
                   <TabsContent key={testament} value={testament} className="m-0 grid grid-cols-1 gap-1.5">
                     {filteredBooks(testament as any).map(b => (
                       <button key={b.id} type="button" onClick={() => handleUpdateNavigation(b.id, 1)} className="flex justify-between p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-zinc-400 hover:border-emerald-500/20">
                         <span className="font-bold text-sm">{isHindi ? b.hi : b.en}</span>
                         <span className="text-[9px] text-zinc-600">{b.chapters} Ch.</span>
                       </button>
                     ))}
                   </TabsContent>
                 ))}
               </ScrollArea>
             </Tabs>
          </DialogContent>
        </Dialog>

        <button type="button" onClick={() => handleUpdateNavigation(bookParam, chapterNum, version === 'kjv' ? 'hin_irv' : 'kjv')} className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all">
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-28 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Loading Scripture...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert prose-emerald max-w-none"
                 dangerouslySetInnerHTML={{ __html: content }} />
            
            <div className="pt-20 pb-16 text-center">
              <button type="button" onClick={() => handleUpdateNavigation(bookParam, chapterNum < currentBookData.chapters ? chapterNum + 1 : 1)} className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30">
                 <ArrowRight className="w-8 h-8 text-emerald-500" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Next Chapter</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COMPACT AUDIO BAR (Near Bottom Nav) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl shadow-black/50">
          <button type="button" onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} className="size-9 rounded-full flex items-center justify-center text-zinc-600 hover:text-white transition-all active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
          
          <button type="button" onClick={toggleAudio} className="flex-1 mx-2 flex items-center justify-center gap-2 bg-emerald-500 text-black py-2.5 rounded-full shadow-xl group hover:bg-emerald-400 transition-all active:scale-95 shadow-emerald-500/20">
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          
          <button type="button" onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="size-9 rounded-full flex items-center justify-center text-zinc-600 hover:text-white transition-all active:scale-90"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .v { font-weight: 900; color: #10b981; margin-right: 10px; font-size: 0.75em; opacity: 0.6; }
        .bible-content p { margin-bottom: 1.5rem; line-height: 1.8; font-family: var(--font-serif); font-style: italic; color: #e4e4e7; }
        .bible-content h3 { font-size: 1.5rem; color: #10b981; font-family: var(--font-serif); font-weight: bold; margin-bottom: 1rem; margin-top: 2rem; border-left: 4px solid #10b981; padding-left: 1rem; }
        .bible-content .s1 { font-weight: bold; color: #d4d4d8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2rem; display: block; }
      `}</style>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-[#09090b]"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>}>
      <ReaderContent />
    </Suspense>
  );
}
