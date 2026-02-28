
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Search, 
  BookOpen, 
  Languages, 
  Check, 
  Loader2,
  Bookmark
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

  // 1. Load Highlights from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('bible_highlights');
    if (saved) setHighlights(JSON.parse(saved));
  }, []);

  // 2. Load Chapter Data (Step 3 Logic)
  const loadChapterData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/bibles/${version}.json`);
      if (!res.ok) throw new Error("File not found");
      const data = await res.json();
      const content = data[book]?.[chapter.toString()] || [];
      setVerses(content);
      
      // Update URL without refresh
      const params = new URLSearchParams();
      params.set('book', book);
      params.set('chapter', chapter.toString());
      params.set('version', version);
      router.replace(`/read?${params.toString()}`);
    } catch (e) {
      console.error(e);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [book, chapter, version, router]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  // 3. Audio Logic (Step 5 Logic)
  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const currentVersion = BIBLE_INDEX.versions.find(v => v.id === version);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentVersion?.lang || 'hi-IN';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speak(verses.join(" "));
    }
  };

  // 4. Highlight Logic
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
    toast({ title: "Updated", description: "Reflection state updated." });
  };

  const filteredBooks = BIBLE_INDEX.books.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.id.includes(searchQuery.toLowerCase())
  );

  const currentBookData = BIBLE_INDEX.books.find(b => b.id === book);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-slate-100 max-w-md mx-auto overflow-hidden border-x border-white/5 font-sans">
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2 group">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize">
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
              <DialogTitle className="text-emerald-500 font-serif italic text-xl">Select Book</DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dhoondhein: Matti, Genesis..." 
                  className="w-full bg-zinc-900 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500/30"
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
                      <span className="font-bold text-sm text-left">{b.name}</span>
                      <span className="text-[9px] uppercase font-black tracking-widest opacity-40">{b.chapters} Ch.</span>
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
          onClick={() => {
            const nextV = version === 'hin_irv' ? 'kjv' : 'hin_irv';
            setVersion(nextV);
            toast({ title: "Version Changed", description: `Switched to ${nextV === 'kjv' ? 'English (KJV)' : 'Hindi (IRV)'}` });
          }}
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-emerald-500"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-48 hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Retrieving Sacred Words...</p>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-40">
            <BookOpen className="w-16 h-16 mb-6" />
            <p className="font-serif italic">This chapter is being prepared for your journey.</p>
          </div>
        ) : (
          <div className="space-y-8 font-serif text-[1.35rem] leading-[1.85] text-slate-200 animate-in fade-in duration-700">
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
                <p className="pl-4">{v}</p>
              </div>
            ))}
            
            {/* Nav Footer inside Scroll */}
            <div className="pt-16 pb-20 border-t border-white/5 flex flex-col gap-6">
              <button 
                onClick={() => setChapter(prev => prev + 1)}
                className="w-full py-12 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <ChevronRight className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-emerald-500 transition-all block">Next Chapter</span>
                  <span className="text-[10px] text-zinc-700 italic font-serif">Continue your study</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Controls */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-40">
        <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => setChapter(prev => Math.max(1, prev - 1))}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-4 bg-emerald-500 text-black px-6 py-2 rounded-full shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Listen</span>
          </button>

          <button 
            onClick={() => setChapter(prev => prev + 1)}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
