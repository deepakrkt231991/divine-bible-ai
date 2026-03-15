"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const bookParam = searchParams.get('book') || 'genesis';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const version = searchParams.get('version') || 'hin';

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState(1.2);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const isHindi = version === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find current book data with safe fallback
  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toLowerCase() === bookParam.toLowerCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'genesis')!;

  const loadChapter = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookCode = currentBookData.code;
      const res = await fetch(`/bible/split/${bookCode}/${chapterNum}.json`);
      
      if (!res.ok) {
        throw new Error('Chapter not found');
      }
      
      const data = await res.json();
      setVerses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [currentBookData.code, chapterNum]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

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
    
    const text = verses.map(v => v.text || v.verse).join(' ');
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const filteredBooks = (testament: 'ot' | 'nt' | 'apocrypha') => 
    BIBLE_BOOKS.filter(b => 
      (b as any).testament === testament && 
      (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
       b.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
       b.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
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
                {isHindi ? 'HINDI' : 'ENGLISH'}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem] shadow-2xl overflow-hidden">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                {isHindi ? "पुस्तक चुनें" : "Select Book"}
              </DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? "पुस्तक खोजें..." : "Search books..."}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </DialogHeader>
            <Tabs defaultValue="ot" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5 h-12">
                <TabsTrigger value="ot" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">
                  {isHindi ? "पुराना नियम" : "OT"}
                </TabsTrigger>
                <TabsTrigger value="apocrypha" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">
                  {isHindi ? "अपोक्राइफा" : "APOCRYPHA"}
                </TabsTrigger>
                <TabsTrigger value="nt" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">
                  {isHindi ? "नया नियम" : "NT"}
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 px-6 py-4">
                {['ot', 'apocrypha', 'nt'].map((testament) => (
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
                          onSelect={(bookId: string, ch: number) => handleUpdateNavigation(bookId, ch)}
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
          onClick={() => handleUpdateNavigation(bookParam, chapterNum, version === 'hin' ? 'eng' : 'hin')}
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">
              {isHindi ? "वचन लोड हो रहा है..." : "Loading..."}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-40 text-zinc-500">
            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert prose-emerald max-w-none"
                 style={{ fontSize: `${fontSize}rem` }}>
              {verses.map((v, i) => (
                <p key={i} className="mb-4">
                  <span className="text-emerald-500 font-bold mr-2">{v.verse || i+1}</span>
                  <span className="text-zinc-300">{v.text || v}</span>
                </p>
              ))}
            </div>
            
            <div className="pt-20 pb-16 text-center">
              <button 
                type="button"
                onClick={() => {
                  if (chapterNum < (currentBookData as any).chapters) {
                    handleUpdateNavigation(bookParam, chapterNum + 1);
                  } else {
                    const idx = BIBLE_BOOKS.findIndex(b => b.id === currentBookData.id);
                    if (idx < BIBLE_BOOKS.length - 1) {
                      handleUpdateNavigation(BIBLE_BOOKS[idx + 1].id, 1);
                    }
                  }
                }}
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl">
                  <ArrowRight className="w-8 h-8 text-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">
                  {isHindi ? "अगला अध्याय" : "Next Chapter"}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl">
          <button 
            type="button" 
            onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} 
            className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            type="button" 
            onClick={toggleAudio} 
            className="flex-1 mx-4 flex items-center justify-center gap-4 bg-emerald-500 text-black py-4 rounded-[1.75rem] shadow-xl group hover:bg-emerald-400 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-black animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  {isHindi ? "रोकें" : "Stop"}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  {isHindi ? "सुनें" : "Listen"}
                </span>
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (chapterNum < (currentBookData as any).chapters) {
                handleUpdateNavigation(bookParam, chapterNum + 1);
              }
            }} 
            className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
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
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none",
          isExpanded 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xl" 
            : "bg-zinc-900/40 border-white/5 hover:border-emerald-500/20 text-zinc-400"
        )}
      >
        <div className="flex flex-col items-start text-left">
          <span className="font-bold text-sm tracking-wide">{isHindi ? b.hi : b.en}</span>
          <span className="text-[9px] uppercase font-black opacity-30 tracking-widest mt-1">
            {b.chapters} {isHindi ? 'अध्याय' : 'chapters'}
          </span>
        </div>
        <div className={cn(
          "size-2 rounded-full transition-all duration-500",
          isExpanded 
            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            : "bg-white/10"
        )} />
      </button>
      {isExpanded && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/60 rounded-[2rem] border border-white/5 shadow-inner mt-2 animate-in zoom-in-95 duration-300">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
            <button 
              key={ch} 
              type="button" 
              onClick={() => onSelect(b.id, ch)} 
              className={cn(
                "size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90 outline-none",
                currentChapter === ch 
                  ? "bg-emerald-500 text-black shadow-xl" 
                  : "bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/5"
              )}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
EOF