
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Search, 
  BookOpen, 
  Languages, 
  Loader2,
  Bookmark,
  Volume2
} from 'lucide-react';
import { BIBLE_INDEX } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

export default function BibleReaderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [book, setBook] = useState(searchParams.get('book') || 'genesis');
  const [chapter, setChapter] = useState(parseInt(searchParams.get('chapter') || '1'));
  const [version, setVersion] = useState(searchParams.get('version') || 'hin_irv');
  
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Highlights from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('bible_highlights');
    if (saved) setHighlights(JSON.parse(saved));
  }, []);

  // Load Bible JSON data from public/bible/
  const loadChapterData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/bible/${version}.json`);
      if (!res.ok) throw new Error("Bible data file not found");
      const data = await res.json();
      
      const bookData = data[book];
      const content = bookData ? bookData[chapter.toString()] || [] : [];
      
      if (content.length === 0) {
        // Fallback to Chapter 1 if chapter is missing
        const fallbackContent = bookData ? bookData["1"] || [] : [];
        setVerses(fallbackContent);
      } else {
        setVerses(content);
      }
      
      // Update URL silently
      const params = new URLSearchParams();
      params.set('book', book);
      params.set('chapter', chapter.toString());
      params.set('version', version);
      router.replace(`/read?${params.toString()}`);
      
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (e) {
      console.error("Reader Load Error:", e);
      setVerses(["Scripture data load error. Please ensure Bible JSON files are in /public/bible/.", "KJV and Hindi IRV are supported."]);
    } finally {
      setLoading(false);
    }
  }, [book, chapter, version, router]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  // Zero-Cost Audio using Web Speech API
  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    if (verses.length === 0) return;

    const currentVersion = BIBLE_INDEX.versions.find(v => v.id === version);
    const textToSpeak = verses.join(" ");
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = currentVersion?.lang || 'hi-IN';
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleHighlight = (index: number) => {
    const id = `${book}_${chapter}_${index}`;
    const newHighlights = { ...highlights };
    if (newHighlights[id]) {
      delete newHighlights[id];
    } else {
      newHighlights[id] = 'bg-emerald-500/20 border-l-4 border-emerald-500';
    }
    setHighlights(newHighlights);
    localStorage.setItem('bible_highlights', JSON.stringify(newHighlights));
    toast({ title: "Verse Action", description: "Highlight saved locally." });
  };

  const filteredBooks = BIBLE_INDEX.books.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.id.includes(searchQuery.toLowerCase())
  );

  const currentBookData = BIBLE_INDEX.books.find(b => b.id === book);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-slate-100 max-w-md mx-auto overflow-hidden border-x border-white/5 font-sans relative">
      {/* Header Panel */}
      <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic">
                  {currentBookData?.name.split(' (')[0]} {chapter}
                </h2>
                <Search className="w-3.5 h-3.5 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.2em] font-black">
                {BIBLE_INDEX.versions.find(v => v.id === version)?.name}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-900 p-0 max-h-[80vh] flex flex-col max-w-[95%]">
            <DialogHeader className="p-4 border-b border-zinc-900">
              <DialogTitle className="text-emerald-500 font-serif italic text-xl">Search Bible</DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find book..." 
                  className="w-full bg-zinc-900 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500/30 text-white"
                />
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 p-2">
              <div className="grid grid-cols-1 gap-1">
                {filteredBooks.map((b) => (
                  <div key={b.id} className="space-y-1">
                    <button 
                      onClick={() => {
                        setBook(b.id);
                        setChapter(1);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                        book === b.id ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-white/5 text-zinc-300"
                      )}
                    >
                      <span className="font-bold text-sm">{b.name}</span>
                      <span className="text-[9px] uppercase font-black opacity-40">{b.chapters} Ch.</span>
                    </button>
                    {book === b.id && (
                      <div className="grid grid-cols-5 gap-2 p-3 bg-zinc-900/50 rounded-xl mb-2">
                        {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
                          <button
                            key={ch}
                            onClick={() => {
                              setChapter(ch);
                              setSelectorOpen(false);
                            }}
                            className={cn(
                              "size-9 rounded-lg flex items-center justify-center text-[11px] font-black transition-all",
                              chapter === ch ? "bg-emerald-500 text-black shadow-lg" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            )}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <button 
          onClick={() => setVersion(version === 'hin_irv' ? 'kjv' : 'hin_irv')}
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-emerald-500"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* Content Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar bg-zinc-950">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Loading Sacred Text...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {verses.map((v, i) => (
              <div 
                key={i} 
                onClick={() => toggleHighlight(i)}
                className={cn(
                  "relative group cursor-pointer transition-all duration-300 p-2 -mx-2 rounded-xl",
                  highlights[`${book}_${chapter}_${i}`] || "hover:bg-white/5"
                )}
              >
                <span className="text-emerald-500 font-black text-[10px] absolute -left-1 top-2.5 opacity-40">{i + 1}</span>
                <p className="pl-4 font-serif text-[1.25rem] leading-[1.8] text-slate-200 italic">{v}</p>
              </div>
            ))}
            
            {/* Next Nav */}
            <div className="pt-16 pb-12 border-t border-white/5">
              <button 
                onClick={() => {
                  const maxCh = currentBookData?.chapters || 1;
                  if (chapter < maxCh) setChapter(chapter + 1);
                  else {
                    const currentIndex = BIBLE_INDEX.books.findIndex(b => b.id === book);
                    if (currentIndex < BIBLE_INDEX.books.length - 1) {
                      setBook(BIBLE_INDEX.books[currentIndex + 1].id);
                      setChapter(1);
                    }
                  }
                }}
                className="w-full py-10 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <ChevronRight className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-emerald-500 transition-all block">Next Chapter</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Audio Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[85%] max-w-xs z-50">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => setChapter(prev => Math.max(1, prev - 1))}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-4 bg-emerald-500 text-black px-6 py-2.5 rounded-full shadow-xl shadow-emerald-500/20 active:scale-95 transition-all group"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Listen</span>
              </>
            )}
          </button>

          <button 
            onClick={() => setChapter(prev => prev + 1)}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
