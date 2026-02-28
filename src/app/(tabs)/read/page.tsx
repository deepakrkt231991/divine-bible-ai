'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Languages, 
  Loader2,
  Volume2,
  Pause,
  ArrowRight
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

function ReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [book, setBook] = useState(searchParams.get('book') || 'genesis');
  const [chapter, setChapter] = useState(parseInt(searchParams.get('chapter') || '1'));
  const [version, setVersion] = useState(searchParams.get('version') || 'hin_irv');
  
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHindi = version === 'hin_irv';

  // Load highlights from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bible_highlights');
    if (saved) setHighlights(JSON.parse(saved));
  }, []);

  const loadChapterData = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    try {
      const fileName = ver === 'hin_irv' ? 'hin_irv.json' : 'kjv.json';
      const res = await fetch(`/bible/${fileName}`);
      
      if (!res.ok) throw new Error("Bible data file missing");
      
      const data = await res.json();
      
      // Auto-fallback logic
      const bookData = data[bid] || data['genesis'];
      const content = bookData?.[cid.toString()] || bookData?.['1'] || [];
      
      setVerses(content);

      // Sync URL
      const params = new URLSearchParams();
      params.set('book', bid);
      params.set('chapter', cid.toString());
      params.set('version', ver);
      router.replace(`/read?${params.toString()}`);
      
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (e) {
      console.error("Local Reader Load Error:", e);
      setVerses(["Vachan dhoondne mein dikkat hui. Please check /public/bible/kjv.json and hin_irv.json files."]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadChapterData(book, chapter, version);
  }, [book, chapter, version, loadChapterData]);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    if (verses.length === 0) return;

    const textToSpeak = verses.join(" ");
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleHighlight = (index: number) => {
    const id = `${book}_${chapter}_${index}`;
    const newHighlights = { ...highlights, [id]: !highlights[id] };
    setHighlights(newHighlights);
    localStorage.setItem('bible_highlights', JSON.stringify(newHighlights));
  };

  const currentBookData = BIBLE_BOOKS.find(b => b.id === book) || BIBLE_BOOKS[0];
  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;

  const filteredBooks = BIBLE_BOOKS.filter(b => 
    b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.hi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-slate-100 max-w-md mx-auto overflow-hidden relative border-x border-white/5 shadow-2xl">
      {/* Header - Compact */}
      <header className="px-4 py-3 border-b border-zinc-900 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-emerald-500 capitalize italic leading-none">
                  {localizedBookName} {chapter}
                </h2>
                <Search className="w-3.5 h-3.5 text-zinc-600" />
              </div>
              <span className="text-[8px] uppercase text-zinc-600 tracking-[0.2em] font-black mt-1">
                {isHindi ? "Hindi (IRV)" : "English (KJV)"}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-900 p-0 max-h-[85vh] flex flex-col max-w-[92%] rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-5 border-b border-zinc-900">
              <DialogTitle className="text-emerald-500 font-serif italic text-xl">
                {isHindi ? "Pustak Chunein" : "Select Book"}
              </DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? "Bible dhoondhein..." : "Search Bible..."} 
                  className="w-full bg-zinc-900 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 text-white"
                />
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 p-3">
              <div className="grid grid-cols-1 gap-1.5">
                {filteredBooks.map((b) => (
                  <div key={b.id} className="space-y-1">
                    <button 
                      onClick={() => {
                        setBook(b.id);
                        setChapter(1);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                        book === b.id ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-zinc-900 text-zinc-400"
                      )}
                    >
                      <span className="font-bold text-sm">{isHindi ? b.hi : b.en}</span>
                      <span className="text-[9px] uppercase font-black opacity-30 tracking-widest">{b.chapters} Chapters</span>
                    </button>
                    {book === b.id && (
                      <div className="grid grid-cols-5 gap-2 p-3 bg-zinc-900/50 rounded-[1.5rem] mb-3 border border-white/5 shadow-inner">
                        {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
                          <button
                            key={ch}
                            onClick={() => {
                              setChapter(ch);
                              setSelectorOpen(false);
                            }}
                            className={cn(
                              "size-10 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                              chapter === ch ? "bg-emerald-500 text-black shadow-lg" : "bg-zinc-800 text-zinc-500 hover:text-emerald-500"
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
          onClick={() => setVersion(isHindi ? 'kjv' : 'hin_irv')}
          className="size-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 pb-48 hide-scrollbar bg-[#09090b]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30 py-32">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">
              {isHindi ? "Pavitra Shastra Load Ho Raha Hai..." : "Preparing The Word..."}
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {verses.map((v, i) => (
              <div 
                key={i} 
                onClick={() => toggleHighlight(i)}
                className={cn(
                  "relative group cursor-pointer transition-all duration-300 p-3 -mx-2 rounded-2xl border-l-2",
                  highlights[`${book}_${chapter}_${i}`] 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" 
                    : "border-transparent hover:bg-white/5"
                )}
              >
                <span className="text-emerald-500 font-black text-[10px] absolute -left-1 top-4 opacity-40">{i + 1}</span>
                <p className="pl-5 font-serif text-[1.15rem] leading-[1.8] text-zinc-100 italic">{v}</p>
              </div>
            ))}
            
            <div className="pt-16 pb-12 border-t border-zinc-900/50">
              <button 
                onClick={() => {
                  if (chapter < currentBookData.chapters) setChapter(chapter + 1);
                  else {
                    const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === book);
                    if (currentIndex < BIBLE_BOOKS.length - 1) {
                      setBook(BIBLE_BOOKS[currentIndex + 1].id);
                      setChapter(1);
                    }
                  }
                }}
                className="w-full py-10 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-emerald-500/30 transition-all shadow-xl bg-zinc-900/20"
              >
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-emerald-500/10">
                  <ArrowRight className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500 transition-all">
                  {isHindi ? "Agla Adhyay" : "Next Chapter"}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Audio Bar - Ultra Sleek */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[70]">
        <div className="bg-zinc-900/95 backdrop-blur-3xl border border-white/5 rounded-full p-1.5 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <button 
            onClick={() => setChapter(prev => Math.max(1, prev - 1))}
            className="size-11 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-3 bg-emerald-500 text-black px-8 py-3 rounded-full shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all group"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 group-hover:animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isHindi ? "Sunein" : "Listen"}</span>
              </>
            )}
          </button>

          <button 
            onClick={() => {
              if (chapter < currentBookData.chapters) setChapter(chapter + 1);
            }}
            className="size-11 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
