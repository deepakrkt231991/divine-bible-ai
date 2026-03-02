
"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Languages, 
  Loader2, 
  Volume2, 
  Pause, 
  ArrowRight, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENT START ---
function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const bookParam = searchParams.get('book') || 'MAT';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const version = searchParams.get('version') || 'hin_irv'; // Default Hindi

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(bookParam.toUpperCase());
  
  const isHindi = version === 'hin_irv';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find book data using Smart Mapping (Hindi/English/USFM)
  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() ||
    b.hi === bookParam ||
    b.usfm.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  // --- SMART LOCAL LOADER ---
  const loadBibleContent = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    try {
      // 1. File Fetch (Local Public Folder)
      const fileName = ver === 'hin_irv' ? 'hin_irv.json' : 'kjv.json';
      const res = await fetch(`/bible/${fileName}`);
      
      if (!res.ok) throw new Error(`File /public/bible/${fileName} nahi mili!`);
      
      const data = await res.json();
      let foundVerses: any[] = [];

      // 2. PARSING LOGIC (Universal JSON Handler)
      
      // Case A: Open-Bibles Format (Array of Books)
      if (Array.isArray(data)) {
        const bookObj = data.find((b: any) => 
          b.name?.toLowerCase() === currentBookData.en.toLowerCase() || 
          b.book_name?.toLowerCase() === currentBookData.en.toLowerCase() ||
          b.id?.toUpperCase() === currentBookData.id.toUpperCase()
        );
        
        if (bookObj && bookObj.chapters) {
          const chapterObj = bookObj.chapters.find((c: any) => c.chapter === cid || c.chapter_nr === cid);
          if (chapterObj && chapterObj.verses) {
            foundVerses = chapterObj.verses;
          }
        }
      } 
      // Case B: Flat Object Format
      else if (typeof data === 'object') {
        const bookKey = Object.keys(data).find(k => 
          k.toLowerCase() === currentBookData.en.toLowerCase() || 
          k.toLowerCase() === currentBookData.id.toLowerCase()
        );
        
        if (bookKey && data[bookKey] && data[bookKey][cid.toString()]) {
           const chapData = data[bookKey][cid.toString()];
           // If verses are array of strings
           if (Array.isArray(chapData)) {
             foundVerses = chapData.map((text: string, i: number) => ({
               verse: i + 1,
               text: text
             }));
           }
           // If verses are array of objects
           else if (typeof chapData === 'object') {
             foundVerses = Object.values(chapData).map((v: any, i: number) => ({
               verse: v.verse || i + 1,
               text: v.text || v
             }));
           }
        }
      }

      // 3. RENDER CONTENT
      if (foundVerses.length > 0) {
        const html = foundVerses.map((v: any) => {
          const cleanText = (v.text || v).replace(/<(?:.|\n)*?>/gm, '');
          return `<p><span class="v">${v.verse || v.number || v.verse_nr}</span> ${cleanText}</p>`;
        }).join("");
        setContent(`<h3>${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</h3>${html}`);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        setContent(`<div class="p-10 text-center text-zinc-500">
          <p class="font-bold text-lg">⚠️ Data Mila Par Content Nahi</p>
          <p class="text-sm mt-2">Book Name ya Chapter ID match nahi kar rahi.</p>
          <p class="text-xs mt-4 bg-zinc-800 p-3 rounded-xl border border-white/5">
            File: ${fileName}<br>Book Search: ${currentBookData.en}<br>Chapter: ${cid}
          </p>
        </div>`);
      }

    } catch (e: any) {
      console.error("Reader Error:", e);
      setContent(`<div class="p-10 text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p class="font-bold">Error: ${e.message}</p>
        <p class="text-xs mt-2 text-zinc-400">Kripya 'public/bible/' folder mein JSON files check karein.</p>
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
      params.set('book', newBook);
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
          
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem] overflow-hidden shadow-2xl">
             <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
               <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                 <BookOpen className="w-6 h-6" /> Select Scripture
               </DialogTitle>
               <div className="relative mt-4">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                 <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search books..." 
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500/30" 
                 />
               </div>
             </DialogHeader>
             <Tabs defaultValue={currentBookData.testament} className="flex-1 flex flex-col overflow-hidden">
               <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5 h-12">
                 <TabsTrigger value="old" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">OT</TabsTrigger>
                 <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">81-Book</TabsTrigger>
                 <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">NT</TabsTrigger>
               </TabsList>
               <ScrollArea className="flex-1 px-6 py-4">
                 {['old', 'deuterocanon', 'new'].map((testament) => (
                   <TabsContent key={testament} value={testament} className="m-0 grid grid-cols-1 gap-1.5">
                     {filteredBooks(testament as any).map(b => (
                       <button 
                          key={b.id} 
                          type="button" 
                          onClick={() => handleUpdateNavigation(b.id, 1)} 
                          className="flex justify-between items-center p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                       >
                         <div className="flex flex-col items-start">
                           <span className="font-bold text-sm text-zinc-200">{isHindi ? b.hi : b.en}</span>
                           <span className="text-[8px] uppercase tracking-widest text-zinc-600 mt-1">{b.testament}</span>
                         </div>
                         <span className="text-[9px] font-black text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">{b.chapters} Ch.</span>
                       </button>
                     ))}
                   </TabsContent>
                 ))}
               </ScrollArea>
             </Tabs>
          </DialogContent>
        </Dialog>

        <button 
          type="button" 
          onClick={() => handleUpdateNavigation(bookParam, chapterNum, version === 'kjv' ? 'hin_irv' : 'kjv')} 
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-32 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Syncing Sacred Words...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div 
              className="bible-content prose prose-invert prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
            
            <div className="pt-20 pb-16 text-center">
              <button 
                type="button" 
                onClick={() => {
                  if (chapterNum < currentBookData.chapters) handleUpdateNavigation(currentBookData.id, chapterNum + 1);
                  else {
                    const idx = BIBLE_BOOKS.findIndex(b => b.id === currentBookData.id);
                    if (idx < BIBLE_BOOKS.length - 1) handleUpdateNavigation(BIBLE_BOOKS[idx + 1].id, 1);
                  }
                }}
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                 <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl">
                   <ArrowRight className="w-8 h-8 text-emerald-500" />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Next Chapter</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COMPACT AUDIO BAR (Near Bottom Nav) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[280px] z-[70] animate-in slide-in-from-bottom-4">
        <div className="bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-full p-1 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <button 
            type="button" 
            onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} 
            className="size-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            type="button" 
            onClick={toggleAudio} 
            className="flex-1 mx-1.5 flex items-center justify-center gap-2 bg-emerald-500 text-black py-2.5 rounded-full shadow-xl shadow-emerald-500/20 group hover:bg-emerald-400 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-black animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          
          <button 
            type="button" 
            onClick={() => { if (chapterNum < currentBookData.chapters) handleUpdateNavigation(bookParam, chapterNum + 1); }} 
            className="size-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .v { 
          font-weight: 900; 
          color: #10b981; 
          margin-right: 12px; 
          font-size: 0.75em; 
          opacity: 0.7; 
          font-family: var(--font-sans);
        }
        .bible-content p { 
          margin-bottom: 1.8rem; 
          line-height: 1.9; 
          font-family: var(--font-serif); 
          font-style: italic; 
          color: #f4f4f5; 
          font-size: 1.25rem;
        }
        .bible-content h3 { 
          font-size: 1.75rem; 
          color: #10b981; 
          font-family: var(--font-serif); 
          font-weight: bold; 
          margin-bottom: 2rem; 
          margin-top: 1rem; 
          border-left: 4px solid #10b981; 
          padding-left: 1.25rem; 
          font-style: italic;
        }
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
