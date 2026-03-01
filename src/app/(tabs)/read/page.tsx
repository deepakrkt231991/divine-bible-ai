'use client';

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
  Highlighter
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // URL state sync - Default to Matthew 1
  const bookId = searchParams.get('book') || 'matthew';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const version = searchParams.get('version') || 'hin_irv';
  
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(bookId);

  const isHindi = version === 'hin_irv';
  const scrollRef = useRef<HTMLDivElement>(null);

  // HYBRID LOADER: Tries local JSON, falls back to API
  const loadChapterData = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    try {
      const fileName = ver === 'hin_irv' ? 'hin_irv.json' : ver === 'orthodox' ? 'orthodox.json' : 'kjv.json';
      let foundVerses: string[] = [];

      // 1. TRY LOCAL FETCH
      try {
        const res = await fetch(`/bible/${fileName}`);
        if (res.ok) {
          const data = await res.json();
          const chapterKey = cid.toString();

          // Handle Array Format (Scrollmapper)
          if (Array.isArray(data)) {
            const bookObj = data.find(item => 
              (item.book?.toLowerCase() === bid.toLowerCase() || item.book_nr?.toString() === bid) && 
              item.chapter_nr?.toString() === chapterKey
            );
            if (bookObj && bookObj.chapter) {
              foundVerses = Object.values(bookObj.chapter).map((v: any) => v.verse || v.text || "");
            }
          } 
          // Handle Object Format (Flat)
          else if (typeof data === 'object') {
            const bookData = data[bid];
            if (bookData && bookData[chapterKey]) {
              foundVerses = Array.isArray(bookData[chapterKey]) ? bookData[chapterKey] : Object.values(bookData[chapterKey]);
            }
          }
        }
      } catch (localErr) {
        console.warn("Local file missing or error, trying API fallback...");
      }

      // 2. FALLBACK TO BOLLS API (Real-time reliable backup)
      if (foundVerses.length === 0) {
        const bookData = BIBLE_BOOKS.find(b => b.id === bid) || BIBLE_BOOKS.find(b => b.id === 'matthew')!;
        const bollsVer = ver === 'hin_irv' ? 'IRV_HIN' : ver === 'orthodox' ? 'IRV_HIN' : 'KJV';
        const apiRes = await fetch(`https://bolls.life/get-chapter/${bollsVer}/${bookData.bollsId}/${cid}/`);
        
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          foundVerses = apiData.map((v: any) => v.text);
        }
      }

      if (foundVerses.length > 0) {
        setVerses(foundVerses);
      } else {
        setVerses(["Is adhyay ka content upload ho raha hai. Please check connection."]);
      }
      
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (e) {
      console.error("Reader Load Error:", e);
      setVerses(["Scripture load nahi ho saki. Internet connect karein."]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapterData(bookId, chapterNum, version);
  }, [bookId, chapterNum, version, loadChapterData]);

  // Persistent Highlights Load
  useEffect(() => {
    const saved = localStorage.getItem('bible_highlights');
    if (saved) setHighlights(JSON.parse(saved));
  }, []);

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
    if (isPlaying) { 
      window.speechSynthesis.cancel(); 
      setIsPlaying(false); 
      return; 
    }
    if (verses.length === 0) return;
    const utterance = new SpeechSynthesisUtterance(verses.join(" "));
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleHighlight = (index: number) => {
    const id = `${bookId}_${chapterNum}_${index}`;
    const newHighlights = { ...highlights, [id]: !highlights[id] };
    setHighlights(newHighlights);
    localStorage.setItem('bible_highlights', JSON.stringify(newHighlights));
  };

  const currentBookData = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.hi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      {/* Header Panel */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic leading-none">
                  {localizedBookName} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.3em] font-black mt-1.5">
                {version === 'orthodox' ? 'Orthodox 81' : isHindi ? 'Hindi IRV' : 'English KJV'}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem] shadow-2xl overflow-hidden">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                {isHindi ? "Pustak Chuniye" : "Select Scripture"}
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
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Apocrypha</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">NT</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
                {['old', 'deuterocanon', 'new'].map((testament) => (
                  <TabsContent key={testament} value={testament} className="m-0">
                    <div className="grid grid-cols-1 gap-1.5">
                      {filteredBooks(testament as any).map(b => (
                        <BookItem 
                          key={b.id} 
                          b={b} 
                          currentChapter={chapterNum} 
                          isHindi={isHindi} 
                          onExpand={setExpandedBook} 
                          expandedBook={expandedBook} 
                          onSelect={handleUpdateNavigation} 
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        <button 
          type="button"
          onClick={() => handleUpdateNavigation(bookId, chapterNum, version === 'kjv' ? 'hin_irv' : version === 'hin_irv' ? 'orthodox' : 'kjv')}
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Consulting Scriptures...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="text-center space-y-3 mb-12">
              <h1 className="text-4xl font-serif font-bold italic text-white leading-tight">{localizedBookName}</h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-emerald-500/30" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">Chapter {chapterNum}</span>
                <div className="h-px w-8 bg-emerald-500/30" />
              </div>
            </div>

            {verses.map((v, i) => (
              <div key={i} className={cn("relative group transition-all duration-500 p-5 -mx-3 rounded-[2rem] border-l-4", highlights[`${bookId}_${chapterNum}_${i}`] ? "bg-emerald-500/10 border-emerald-500/50 shadow-2xl" : "border-transparent hover:bg-white/5")}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-emerald-500 font-black text-[10px] opacity-40 uppercase tracking-widest">{i + 1}</span>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => toggleHighlight(i)} className="text-zinc-600 hover:text-emerald-500"><Highlighter className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="font-serif text-[1.25rem] leading-[1.8] text-zinc-100 italic">{v}</p>
              </div>
            ))}
            
            <div className="pt-20 pb-16 text-center">
              <button 
                type="button"
                onClick={() => {
                  if (chapterNum < currentBookData.chapters) handleUpdateNavigation(bookId, chapterNum + 1);
                  else {
                    const idx = BIBLE_BOOKS.findIndex(b => b.id === bookId);
                    if (idx < BIBLE_BOOKS.length - 1) handleUpdateNavigation(BIBLE_BOOKS[idx + 1].id, 1);
                  }
                }}
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl">
                  <ArrowRight className="w-8 h-8 text-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Read Next Chapter</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Audio Controls */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl">
          <button type="button" onClick={() => handleUpdateNavigation(bookId, Math.max(1, chapterNum - 1))} className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
          <button type="button" onClick={toggleAudio} className="flex-1 mx-4 flex items-center justify-center gap-4 bg-emerald-500 text-black py-4 rounded-[1.75rem] shadow-xl group hover:bg-emerald-400 transition-all">
            {isPlaying ? <><Pause className="w-5 h-5 fill-black animate-pulse" /><span className="text-[11px] font-black uppercase tracking-[0.2em]">Stop Audio</span></> : <><Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-black uppercase tracking-[0.2em]">Listen</span></>}
          </button>
          <button type="button" onClick={() => { if (chapterNum < currentBookData.chapters) handleUpdateNavigation(bookId, chapterNum + 1); }} className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );
}

function BookItem({ b, expandedBook, currentChapter, isHindi, onExpand, onSelect }: any) {
  const isExpanded = expandedBook === b.id;
  return (
    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
      <button 
        type="button"
        onClick={() => onExpand(isExpanded ? null : b.id)}
        className={cn("w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none", isExpanded ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xl" : "bg-zinc-900/40 border-white/5 hover:border-emerald-500/20 text-zinc-400")}
      >
        <div className="flex flex-col items-start text-left">
          <span className="font-bold text-sm tracking-wide">{isHindi ? b.hi : b.en}</span>
          <span className="text-[9px] uppercase font-black opacity-30 tracking-widest mt-1">{b.chapters} Chapters</span>
        </div>
        <div className={cn("size-2 rounded-full transition-all duration-500", isExpanded ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")} />
      </button>
      {isExpanded && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/60 rounded-[2rem] border border-white/5 shadow-inner mt-2 animate-in zoom-in-95 duration-300">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
            <button key={ch} type="button" onClick={() => onSelect(b.id, ch)} className={cn("size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90 outline-none", currentChapter === ch ? "bg-emerald-500 text-black shadow-xl" : "bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/5")}>{ch}</button>
          ))}
        </div>
      )}
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
