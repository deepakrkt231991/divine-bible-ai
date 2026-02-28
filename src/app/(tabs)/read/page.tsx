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
  ArrowRight,
  BookOpen,
  PlusCircle,
  X,
  Highlighter
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  // State Management initialized from URL or defaults
  const [book, setBook] = useState(searchParams.get('book') || 'genesis');
  const [chapter, setChapter] = useState(parseInt(searchParams.get('chapter') || '1'));
  const [version, setVersion] = useState(searchParams.get('version') || 'hin_irv');
  
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, boolean>>({});
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(searchParams.get('book') || 'genesis');
  const [noteContent, setNoteContent] = useState("");
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);

  const isHindi = version === 'hin_irv';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync state with URL when searchParams change (e.g., when navigation happens)
  useEffect(() => {
    const b = searchParams.get('book');
    const c = searchParams.get('chapter');
    const v = searchParams.get('version');
    if (b) setBook(b);
    if (c) setChapter(parseInt(c));
    if (v) setVersion(v);
  }, [searchParams]);

  // Load Highlights from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('bible_highlights');
    if (saved) setHighlights(JSON.parse(saved));
  }, []);

  // MASTER LOADER: Robust fetch for both Array and Object JSON formats
  const loadChapterData = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    try {
      const fileName = ver === 'hin_irv' ? 'hin_irv.json' : 'kjv.json';
      const res = await fetch(`/bible/${fileName}`);
      if (!res.ok) throw new Error("Bible data file missing");
      
      const json = await res.json();
      let foundVerses: string[] = [];

      // UNIVERSAL LOADER LOGIC
      if (Array.isArray(json)) {
        // Scrollmapper Array Format: [{book: "Genesis", chapter_nr: 1, chapter: {"1": {verse: "..."}}}, ...]
        const entry = json.find(
          (item: any) =>
            item.book?.toLowerCase() === bid.toLowerCase() &&
            item.chapter_nr?.toString() === cid.toString()
        );
        if (entry?.chapter) {
          foundVerses = Object.values(entry.chapter).map((v: any) => 
            typeof v === 'string' ? v : (v as any).verse
          );
        }
      } else if (typeof json === 'object' && json !== null) {
        // Standard Object Format: {"genesis": {"1": ["v1", "v2"], "2": [...]}}
        const bookKey = Object.keys(json).find(k => k.toLowerCase() === bid.toLowerCase());
        const bookData = bookKey ? (json as any)[bookKey] : null;
        if (bookData) {
          const chapterKey = cid.toString();
          const chapterData = bookData[chapterKey];
          if (Array.isArray(chapterData)) {
            foundVerses = chapterData;
          } else if (typeof chapterData === 'object' && chapterData !== null) {
            foundVerses = Object.values(chapterData).map((v: any) => 
              typeof v === 'string' ? v : (v as any).verse
            );
          }
        }
      }

      if (foundVerses.length > 0) {
        setVerses(foundVerses);
      } else {
        // Fallback: If chapter not found, attempt Genesis 1 or show error
        if (bid !== 'genesis' || cid !== 1) {
           loadChapterData('genesis', 1, ver);
           return;
        }
        setVerses(["Chapter content not found."]);
      }
      
      // Update local state and URL without full reload
      setBook(bid);
      setChapter(cid);
      const params = new URLSearchParams(searchParams);
      params.set('book', bid);
      params.set('chapter', cid.toString());
      params.set('version', ver);
      router.push(`?${params.toString()}`, { scroll: false });

      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (e) {
      console.error("Reader Load Error:", e);
      setVerses(["Error loading scripture. Please ensure JSON files are present in public/bible/"]);
    } finally {
      setLoading(false);
    }
  }, [router, searchParams]);

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
    utterance.rate = 0.9;
    
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
    toast({ title: highlights[id] ? "Highlight Removed" : "Verse Highlighted" });
  };

  const handleSaveNote = async () => {
    if (!user || !firestore || activeVerseIndex === null) {
      toast({ title: "Note", description: "Please sign in to save personal notes." });
      return;
    }
    
    const noteData = {
      userId: user.uid,
      verseId: `${book}_${chapter}_${activeVerseIndex}`,
      content: noteContent,
      bookName: book,
      verseText: verses[activeVerseIndex],
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(firestore, 'users', user.uid, 'notes'), noteData);
      toast({ title: "Note Saved", description: "Your reflection has been added to your profile." });
      setNoteContent("");
      setActiveVerseIndex(null);
    } catch (e) {
      console.error(e);
    }
  };

  const currentBookData = BIBLE_BOOKS.find(b => b.id === book) || BIBLE_BOOKS[0];
  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;

  const filteredBooks = (testament: 'old' | 'new') => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.hi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative selection:bg-emerald-500/30">
      {/* Top Navigation Header */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic leading-none">
                  {localizedBookName} {chapter}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.3em] font-black mt-1.5">
                {isHindi ? "Hindi (IRV)" : "English (KJV)"}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem] shadow-2xl overflow-hidden focus:outline-none">
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
                  placeholder={isHindi ? "Pustak dhoondhein..." : "Search books..."} 
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 text-white placeholder:text-zinc-600 outline-none"
                />
              </div>
            </DialogHeader>

            <Tabs defaultValue={currentBookData.testament} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5 h-12">
                <TabsTrigger value="old" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all">
                  {isHindi ? "Purana Niyam" : "Old Testament"}
                </TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all">
                  {isHindi ? "Naya Niyam" : "New Testament"}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="old" className="h-full mt-0 focus-visible:outline-none">
                  <ScrollArea className="h-[50vh] px-6">
                    <div className="grid grid-cols-1 gap-1.5 py-4">
                      {filteredBooks('old').map((b) => (
                        <BookItem key={b.id} b={b} expandedBook={expandedBook} currentChapter={chapter} isHindi={isHindi} onExpand={setExpandedBook} onSelect={(bid, cid) => {
                          loadChapterData(bid, cid, version);
                          setSelectorOpen(false);
                        }} />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="new" className="h-full mt-0 focus-visible:outline-none">
                  <ScrollArea className="h-[50vh] px-6">
                    <div className="grid grid-cols-1 gap-1.5 py-4">
                      {filteredBooks('new').map((b) => (
                        <BookItem key={b.id} b={b} expandedBook={expandedBook} currentChapter={chapter} isHindi={isHindi} onExpand={setExpandedBook} onSelect={(bid, cid) => {
                          loadChapterData(bid, cid, version);
                          setSelectorOpen(false);
                        }} />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        <button 
          type="button"
          onClick={() => setVersion(isHindi ? 'kjv' : 'hin_irv')}
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 active:scale-90 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* Main Reading Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">
              {isHindi ? "Dhyan Lagayein..." : "Preparing..."}
            </p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-3 mb-12">
              <h1 className="text-4xl font-serif font-bold italic text-white leading-tight">{localizedBookName}</h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-8 bg-emerald-500/30" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">{isHindi ? 'Adhyay' : 'Chapter'} {chapter}</span>
                <div className="h-px w-8 bg-emerald-500/30" />
              </div>
            </div>

            {verses.map((v, i) => (
              <div 
                key={i} 
                className={cn(
                  "relative group transition-all duration-500 p-5 -mx-3 rounded-[2rem] border-l-4",
                  highlights[`${book}_${chapter}_${i}`] 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-2xl" 
                    : "border-transparent hover:bg-white/5"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-emerald-500 font-black text-[10px] opacity-40 uppercase tracking-widest">{i + 1}</span>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => toggleHighlight(i)} className="text-zinc-600 hover:text-emerald-500 transition-colors">
                      <Highlighter className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setActiveVerseIndex(i)} className="text-zinc-600 hover:text-emerald-500 transition-colors">
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="font-serif text-[1.25rem] leading-[1.8] text-zinc-100 italic">{v}</p>
              </div>
            ))}
            
            <div className="pt-20 pb-16 border-t border-white/5 text-center">
              <button 
                type="button"
                onClick={() => {
                  if (chapter < currentBookData.chapters) loadChapterData(book, chapter + 1, version);
                  else {
                    const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === book);
                    if (currentIndex < BIBLE_BOOKS.length - 1) {
                      loadChapterData(BIBLE_BOOKS[currentIndex + 1].id, 1, version);
                    }
                  }
                }}
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-2xl"
              >
                <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                  <ArrowRight className="w-8 h-8 text-emerald-500" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500 transition-colors">
                  {isHindi ? "Agla Adhyay Padhein" : "Read Next Chapter"}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Audio & Control Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
          <button 
            type="button"
            onClick={() => loadChapterData(book, Math.max(1, chapter - 1), version)}
            className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            type="button"
            onClick={toggleAudio}
            className="flex-1 mx-4 flex items-center justify-center gap-4 bg-emerald-500 text-black py-4 rounded-[1.75rem] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all group"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-black animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isHindi ? "Sunein" : "Listen"}</span>
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={() => {
              if (chapter < currentBookData.chapters) loadChapterData(book, chapter + 1, version);
            }}
            className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Notes Overlay */}
      {activeVerseIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md mx-auto bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl italic text-emerald-500">Reflections</h3>
              <button type="button" onClick={() => setActiveVerseIndex(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6 text-zinc-500" />
              </button>
            </div>
            <p className="text-zinc-500 text-xs italic line-clamp-2">"{verses[activeVerseIndex]}"</p>
            <textarea 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your spiritual insight..."
              className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm h-32 focus:ring-2 focus:ring-emerald-500/20 text-zinc-200 resize-none outline-none"
            />
            <button 
              type="button"
              onClick={handleSaveNote}
              className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"
            >
              Save to Study
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookItem({ b, expandedBook, currentChapter, isHindi, onExpand, onSelect }: { 
  b: any, 
  expandedBook: string | null, 
  currentChapter: number, 
  isHindi: boolean, 
  onExpand: (id: string | null) => void,
  onSelect: (bid: string, cid: number) => void 
}) {
  const isExpanded = expandedBook === b.id;
  
  return (
    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
      <button 
        type="button"
        onClick={() => onExpand(isExpanded ? null : b.id)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none",
          isExpanded ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xl" : "bg-zinc-900/40 border-white/5 hover:border-emerald-500/20 text-zinc-400"
        )}
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
            <button
              key={ch}
              type="button"
              onClick={() => onSelect(b.id, ch)}
              className={cn(
                "size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90 outline-none",
                currentChapter === ch ? "bg-emerald-500 text-black shadow-xl shadow-emerald-500/20" : "bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/5"
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
