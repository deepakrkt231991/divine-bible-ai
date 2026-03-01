
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
  Share2,
  Bookmark
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isPending, startTransition] = useTransition();

  // URL State handling
  const bookParam = searchParams.get('book') || 'MAT';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const version = searchParams.get('version') || 'HINIRV';
  
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Find book data
  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toUpperCase() === bookParam.toUpperCase() || 
    b.usfm.toUpperCase() === bookParam.toUpperCase() ||
    b.en.toLowerCase() === bookParam.toLowerCase() ||
    b.hi === bookParam ||
    b.bollsId.toString() === bookParam
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  const loadBibleContent = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    setVerses([]); // Clear previous to show loading state properly
    try {
      const bookData = BIBLE_BOOKS.find(b => 
        b.id.toUpperCase() === bid.toUpperCase() || 
        b.usfm.toUpperCase() === bid.toUpperCase() ||
        b.en.toLowerCase() === bid.toLowerCase() ||
        b.hi === bid ||
        b.bollsId.toString() === bid
      ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

      // PRIMARY ENGINE: Bolls.life API
      // Standard Codes: HINIRV (Hindi), KJV (English)
      const bollsCode = ver.toUpperCase() === 'KJV' ? 'KJV' : 'HINIRV';
      const url = `https://bolls.life/get-chapter/${bollsCode}/${bookData.bollsId}/${cid}/`;
      
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        // Bolls get-chapter returns an array of verse objects [{verse: 1, text: "..."}, ...]
        if (Array.isArray(data) && data.length > 0) {
          setVerses(data);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
          setLoading(false);
          return;
        }
      }

      // FALLBACK: If API fails, try a secondary mapping or show error
      throw new Error("No data found");
      
    } catch (e) {
      console.error("Reader Error:", e);
      setVerses([]);
      setLoading(false);
      toast({ 
        title: "Vachan nahi mile", 
        description: "Internet check karein ya dusra chapter chunein.", 
        variant: "destructive" 
      });
    }
  }, [toast]);

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

  const handleBookmark = async (v: any) => {
    if (!user || !firestore) {
      toast({ title: "Sign In", description: "Vachan bookmark karne ke liye login karein." });
      return;
    }
    const cleanText = v.text.replace(/<(?:.|\n)*?>/gm, '');
    await addDoc(collection(firestore, 'users', user.uid, 'bookmarks'), {
      userId: user.uid,
      bookName: currentBookData.hi,
      chapter: chapterNum,
      verseNumber: v.verse,
      verseText: cleanText,
      translation: version,
      createdAt: serverTimestamp()
    });
    toast({ title: "Bookmarked!", description: "Vachan aapke profile mein save ho gaya hai." });
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
    utterance.lang = version.toUpperCase() === 'HINIRV' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const isHindi = version.toUpperCase() === 'HINIRV';
  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
     b.usfm.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      {/* Header */}
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
                {isHindi ? 'Hindi IRV' : 'English KJV'}
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
                <TabsTrigger value="old" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Purana</TabsTrigger>
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">81-Book</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Naya</TabsTrigger>
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
          onClick={() => handleUpdateNavigation(bookParam, chapterNum, version.toUpperCase() === 'KJV' ? 'HINIRV' : 'KJV')}
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Vachan load ho rahe hain...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert prose-emerald max-w-none">
              {verses.length > 0 ? (
                verses.map((v: any) => (
                  <div key={v.verse} className="flex gap-4 mb-8 items-start group relative">
                    <div className="flex flex-col items-center gap-2 mt-1.5">
                      <span className="text-emerald-500 font-black text-sm min-w-[24px] text-center bg-emerald-500/5 rounded-lg py-1">
                        {v.verse}
                      </span>
                      <button 
                        onClick={() => handleBookmark(v)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-emerald-500"
                      >
                        <Bookmark className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xl leading-relaxed text-zinc-100 font-serif italic m-0">
                      {v.text.replace(/<(?:.|\n)*?>/gm, '')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-20 text-zinc-500 text-center gap-4">
                  <AlertCircle className="w-12 h-12 opacity-20" />
                  <p className="italic">Vachan load nahi ho paye.<br/>Chapter {chapterNum} check karein.</p>
                </div>
              )}
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
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl">
                  <ArrowRight className="w-8 h-8 text-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Agla Adhyay Padhein</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Control Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl">
          <button type="button" onClick={() => handleUpdateNavigation(currentBookData.id, Math.max(1, chapterNum - 1))} className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
          <button type="button" onClick={toggleAudio} className="flex-1 mx-4 flex items-center justify-center gap-4 bg-emerald-500 text-black py-4 rounded-[1.75rem] shadow-xl group hover:bg-emerald-400 transition-all">
            {isPlaying ? <><Pause className="w-5 h-5 fill-black animate-pulse" /><span className="text-[11px] font-black uppercase tracking-[0.2em]">Stop Audio</span></> : <><Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-black uppercase tracking-[0.2em]">Suniye</span></>}
          </button>
          <button type="button" onClick={() => { if (chapterNum < currentBookData.chapters) handleUpdateNavigation(currentBookData.id, chapterNum + 1); }} className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"><ChevronRight className="w-6 h-6" /></button>
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
