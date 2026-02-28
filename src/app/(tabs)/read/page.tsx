'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen, 
  Languages, 
  Loader2,
  Volume2,
  Pause,
  Bookmark
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
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
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHindi = version === 'hin_irv';

  // Load Highlights from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('bible_highlights');
    if (saved) setHighlights(JSON.parse(saved));
  }, []);

  // Zero-Cost Local Loader
  const loadChapterData = useCallback(async () => {
    setLoading(true);
    try {
      const fileName = version === 'hin_irv' ? 'hin_irv.json' : 'kjv.json';
      const res = await fetch(`/bible/${fileName}`);
      
      if (!res.ok) throw new Error("Bible data file missing");
      
      const data = await res.json();
      const content = data[book]?.[chapter.toString()] || [];
      
      if (content.length === 0) {
        // Fallback or next available
        setVerses(["Vachan taiyar kiye ja rahe hain...", "Preparing verses for your journey..."]);
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
      console.error("Local Reader Load Error:", e);
      setVerses(["Offline vachan load karne mein truti. Kripya check karein.", "Error loading offline scriptures. Please check file path."]);
    } finally {
      setLoading(false);
    }
  }, [book, chapter, version, router]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  // Web Speech API Audio (100% Free)
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
    toast({ 
      title: isHindi ? "Vachan Updated" : "Verse Updated", 
      description: newHighlights[id] ? (isHindi ? "Highlight kiya gaya" : "Highlighted") : (isHindi ? "Highlight hataya gaya" : "Removed highlight")
    });
  };

  const currentBookData = BIBLE_BOOKS.find(b => b.id === book) || BIBLE_BOOKS[0];
  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;

  const filteredBooks = BIBLE_BOOKS.filter(b => 
    b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-slate-100 max-w-md mx-auto overflow-hidden border-x border-zinc-900 font-sans relative">
      {/* Ultra-Small Header Panel */}
      <header className="px-4 py-2 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/95 backdrop-blur-md sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-emerald-500 capitalize italic leading-none">
                  {localizedBookName} {chapter}
                </h2>
                <Search className="w-3 h-3 text-zinc-600" />
              </div>
              <span className="text-[7px] uppercase text-zinc-600 tracking-[0.2em] font-black mt-0.5">
                {isHindi ? "Hindi (IRV)" : "English (KJV)"}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-900 p-0 max-h-[80vh] flex flex-col max-w-[95%] rounded-[2rem]">
            <DialogHeader className="p-4 border-b border-zinc-900">
              <DialogTitle className="text-emerald-500 font-serif italic text-xl">
                {isHindi ? "Bible Pustak Dhoondhein" : "Find Bible Book"}
              </DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? "Matti, Exodus..." : "Find book..."} 
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
                        book === b.id ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-zinc-900 text-zinc-300"
                      )}
                    >
                      <span className="font-bold text-sm">{isHindi ? b.hi : b.en}</span>
                      <span className="text-[9px] uppercase font-black opacity-40">{b.chapters} Chapters</span>
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
          onClick={() => setVersion(isHindi ? 'kjv' : 'hin_irv')}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
        >
          <Languages className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-48 hide-scrollbar bg-zinc-950">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
              {isHindi ? "Pavitra Vachan load ho rahe hain..." : "Loading Sacred Text..."}
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-700">
            {verses.map((v, i) => (
              <div 
                key={i} 
                onClick={() => toggleHighlight(i)}
                className={cn(
                  "relative group cursor-pointer transition-all duration-300 p-2 -mx-2 rounded-xl border-l-2",
                  highlights[`${book}_${chapter}_${i}`] 
                    ? "bg-emerald-500/10 border-emerald-500/50" 
                    : "border-transparent hover:bg-zinc-900/50"
                )}
              >
                <span className="text-emerald-500 font-black text-[9px] absolute -left-1 top-2.5 opacity-40">{i + 1}</span>
                <p className="pl-4 font-serif text-[1.1rem] leading-[1.7] text-slate-200 italic">{v}</p>
              </div>
            ))}
            
            {/* Seamless Navigation Button */}
            <div className="pt-12 pb-8 border-t border-zinc-900">
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
                className="w-full py-8 border-2 border-dashed border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-3 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <ChevronRight className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-emerald-500 transition-all">
                  {isHindi ? "Agla Adhyay" : "Next Chapter"}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Ultra-Small Audio Control Bar */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[80%] max-w-xs z-[70]">
        <div className="bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 rounded-full p-1 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => setChapter(prev => Math.max(1, prev - 1))}
            className="size-9 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={toggleAudio}
            className="flex items-center gap-3 bg-emerald-500 text-black px-5 py-2 rounded-full shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-black animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">{isHindi ? "Sunein" : "Listen"}</span>
              </>
            )}
          </button>

          <button 
            onClick={() => {
              if (chapter < currentBookData.chapters) setChapter(chapter + 1);
            }}
            className="size-9 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
