
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
  AlertCircle,
  Bookmark,
  Share2
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Mapping for various book names to Bolls IDs
const BOOK_LOOKUP: Record<string, number> = {
  "utpatti": 1, "genesis": 1, "उत्पत्ति": 1, "gen": 1, "exo": 2, "exodus": 2, "nirgaman": 2, "निर्गमन": 2,
  "lev": 3, "leviticus": 3, "num": 4, "numbers": 4, "deu": 5, "deuteronomy": 5,
  "mat": 40, "matthew": 40, "matti": 40, "मत्ती": 40, "mrk": 41, "mark": 41, "markus": 41, "मरकुस": 41,
  "luk": 42, "luke": 42, "lukas": 42, "लूका": 42, "jhn": 43, "john": 43, "yuhanna": 43, "यूहन्ना": 43,
  "tob": 67, "tobit": 67, "तोबित": 67, "jdt": 68, "judith": 68, "यहूदीत": 68
};

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isPending, startTransition] = useTransition();

  const bookParam = (searchParams.get('book') || 'MAT').toLowerCase();
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const versionParam = searchParams.get('version') || 'HINIRV';
  
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toLowerCase() === bookParam || 
    b.usfm.toLowerCase() === bookParam ||
    b.en.toLowerCase() === bookParam ||
    b.hi === searchParams.get('book')
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  const loadBibleContent = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    setErrorState(null);
    
    // 1. Check Local Static Data first (for Exodus 7 / Matthew 2 optimization)
    const localData = (window as any).BIBLE_DATA;
    const normalizedBook = bid.toLowerCase();
    const staticBookKey = normalizedBook === 'exo' || normalizedBook === 'exodus' ? 'exodus' : 
                         normalizedBook === 'mat' || normalizedBook === 'matthew' ? 'matthew' : normalizedBook;

    if (localData && localData[staticBookKey] && localData[staticBookKey][cid]) {
      const fallbackVerses = localData[staticBookKey][cid].map((text: string, i: number) => ({
        verse: i + 1,
        text: text
      }));
      setVerses(fallbackVerses);
      setLoading(false);
      return;
    }

    // 2. Fetch from Bolls API (Robust Fallback)
    try {
      const bollsId = BOOK_LOOKUP[normalizedBook] || currentBookData.bollsId;
      // Try HINIRV first
      let url = `https://bolls.life/get-chapter/${ver}/${bollsId}/${cid}/`;
      let res = await fetch(url);
      
      if (!res.ok && ver === 'HINIRV') {
        // Fallback to HI_IRV code if HINIRV fails
        url = `https://bolls.life/get-chapter/HI_IRV/${bollsId}/${cid}/`;
        res = await fetch(url);
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVerses(data);
          setLoading(false);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
          return;
        }
      }

      // 3. Last resort: English KJV
      const fallbackUrl = `https://bolls.life/get-chapter/KJV/${bollsId}/${cid}/`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        setVerses(data);
      } else {
        throw new Error("Vachan nahi mil paye");
      }

      setLoading(false);
    } catch (e) {
      console.error("Reader Error:", e);
      setErrorState("Vachan load nahi ho paye. Connection check karein.");
      setLoading(false);
    }
  }, [currentBookData.bollsId]);

  useEffect(() => {
    if (!(window as any).BIBLE_DATA) {
      const script = document.createElement("script");
      script.src = "/bible-data.js";
      script.onload = () => loadBibleContent(bookParam, chapterNum, versionParam);
      document.body.appendChild(script);
    } else {
      loadBibleContent(bookParam, chapterNum, versionParam);
    }
  }, [bookParam, chapterNum, versionParam, loadBibleContent]);

  const handleUpdateNavigation = (newBook: string, newChapter: number, newVersion?: string) => {
    setSelectorOpen(false);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', newBook);
      params.set('chapter', newChapter.toString());
      params.set('version', newVersion || versionParam);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const handleBookmark = async (v: any) => {
    if (!user || !firestore) {
      toast({ title: "Sign In", description: "Bookmark karne ke liye login karein." });
      return;
    }
    const cleanText = v.text.replace(/<(?:.|\n)*?>/gm, '');
    await addDoc(collection(firestore, 'users', user.uid, 'bookmarks'), {
      userId: user.uid,
      bookName: currentBookData.hi,
      chapter: chapterNum,
      verseNumber: v.verse,
      verseText: cleanText,
      translation: versionParam,
      createdAt: serverTimestamp()
    });
    toast({ title: "Vachan Saved!" });
  };

  const toggleAudio = () => {
    if (isPlaying) { 
      window.speechSynthesis.cancel(); 
      setIsPlaying(false); 
      return; 
    }
    const text = verses.map(v => v.text.replace(/<(?:.|\n)*?>/gm, '')).join(" ");
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = versionParam.toUpperCase().includes('HIN') ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const isHindi = versionParam.toUpperCase().includes('HIN');
  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
     b.usfm.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      {/* Top Header */}
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
                {isHindi ? 'HINIRV' : 'English KJV'}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem] shadow-2xl overflow-hidden">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                Select Book
              </DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dhoondhein..." 
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
          onClick={() => handleUpdateNavigation(bookParam, chapterNum, versionParam.toUpperCase() === 'KJV' ? 'HINIRV' : 'KJV')}
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-64 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full py-40 opacity-40">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">Loading Vachan...</p>
          </div>
        ) : errorState ? (
          <div className="flex flex-col items-center py-20 text-zinc-500 text-center gap-6">
            <AlertCircle className="w-16 h-16 opacity-20" />
            <p className="font-serif italic text-lg">{errorState}</p>
            <button onClick={() => loadBibleContent(bookParam, chapterNum, versionParam)} className="text-emerald-500 text-xs font-black uppercase border border-emerald-500/20 px-6 py-2 rounded-full">Retry</button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert prose-emerald max-w-none">
              {verses.map((v: any) => (
                <div key={v.verse} className="flex gap-4 mb-8 items-start group relative">
                  <div className="flex flex-col items-center gap-2 mt-1.5">
                    <span className="text-emerald-500 font-black text-sm min-w-[24px] text-center bg-emerald-500/5 rounded-lg py-1">
                      {v.verse}
                    </span>
                    <button onClick={() => handleBookmark(v)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-emerald-500">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xl leading-relaxed text-zinc-100 font-serif italic m-0">
                    {v.text.replace(/<(?:.|\n)*?>/gm, '')}
                  </p>
                </div>
              ))}
            </div>
            
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
                className="w-full py-12 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl text-emerald-500">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-emerald-500">Next Chapter</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sleek Minimal Control Bar - Sticked near bottom panel */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] transition-all">
        <div className="bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <button 
            type="button" 
            onClick={() => handleUpdateNavigation(currentBookData.id, Math.max(1, chapterNum - 1))} 
            className="size-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            type="button" 
            onClick={toggleAudio} 
            className="flex items-center gap-2 bg-emerald-500 text-black px-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-all group hover:bg-emerald-400"
          >
            {isPlaying ? (
              <><Pause className="w-4 h-4 fill-black animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest">Stop</span></>
            ) : (
              <><Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" /><span className="text-[10px] font-black uppercase tracking-widest">Suniye</span></>
            )}
          </button>

          <button 
            type="button" 
            onClick={() => { if (chapterNum < currentBookData.chapters) handleUpdateNavigation(currentBookData.id, chapterNum + 1); }} 
            className="size-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BookItem({ b, expandedBook, currentChapter, isHindi, onExpand, onSelect }: any) {
  const isExpanded = expandedBook === b.id;
  return (
    <div className="space-y-1.5">
      <button 
        type="button"
        onClick={() => onExpand(isExpanded ? null : b.id)}
        className={cn("w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none", isExpanded ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-zinc-900/40 border-white/5 text-zinc-400")}
      >
        <div className="flex flex-col items-start text-left">
          <span className="font-bold text-sm tracking-wide">{isHindi ? b.hi : b.en}</span>
          <span className="text-[9px] uppercase font-black opacity-30 tracking-widest mt-1">{b.chapters} Chapters</span>
        </div>
        <div className={cn("size-2 rounded-full", isExpanded ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")} />
      </button>
      {isExpanded && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/60 rounded-[2rem] border border-white/5 mt-2 animate-in zoom-in-95 duration-300">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
            <button key={ch} type="button" onClick={() => onSelect(b.id, ch)} className={cn("size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90 outline-none", currentChapter === ch ? "bg-emerald-500 text-black" : "bg-zinc-950 text-zinc-600 border border-white/5")}>{ch}</button>
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
