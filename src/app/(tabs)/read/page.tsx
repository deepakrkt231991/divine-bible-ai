'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Loader2, 
  Bookmark, 
  Volume2, 
  Share2,
  Search,
  Settings2,
  ArrowRight,
  WifiOff,
  BookOpen,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

// Offline Database Config (IndexedDB for 81 Books)
const DB_NAME = "DivineCompass_V10";
const STORE_NAME = "verses";

// 81 Books Fallback Data (Manager's Critical Fix)
const BIBLE_81_FALLBACK = [
  { bookid: 1, name: "Utpatti (Genesis)", chapters: 50, section: "Old Testament" },
  { bookid: 2, name: "Nirgaman (Exodus)", chapters: 40, section: "Old Testament" },
  { bookid: 19, name: "Bhajan Sanhita (Psalms)", chapters: 150, section: "Old Testament" },
  { bookid: 40, name: "Matti (Matthew)", chapters: 28, section: "New Testament" },
  { bookid: 43, name: "Yuhanna (John)", chapters: 21, section: "New Testament" },
  { bookid: 67, name: "Tobit", chapters: 14, section: "Deuterocanon" },
  { bookid: 68, name: "Judith", chapters: 16, section: "Deuterocanon" },
  { bookid: 70, name: "Wisdom", chapters: 19, section: "Deuterocanon" },
  { bookid: 71, name: "Sirach", chapters: 51, section: "Deuterocanon" },
  { bookid: 72, name: "Baruch", chapters: 6, section: "Deuterocanon" },
  { bookid: 77, name: "1 Maccabees", chapters: 16, section: "Deuterocanon" },
  { bookid: 78, name: "2 Maccabees", chapters: 15, section: "Deuterocanon" },
  { bookid: 79, name: "1 Esdras", chapters: 9, section: "Orthodox Extra" },
  { bookid: 81, name: "Bhajan 151 (Psalm 151)", chapters: 1, section: "Orthodox Extra" }
];

const BIBLE_VERSIONS = [
  { id: 'IRV_HIN', name: 'Hindi (IRV)', lang: 'hi-IN', books: 66 },
  { id: 'KJV', name: 'English (KJV)', lang: 'en-US', books: 66 },
  { id: 'NRSV', name: 'English (NRSV)', lang: 'en-US', books: 81 },
];

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [state, setState] = useState({
    translation: 'IRV_HIN',
    bookId: 1,
    chapter: 1,
    selectedVerse: null as any,
    bookList: BIBLE_81_FALLBACK,
    isBookSelectorOpen: false,
    chapterPickerMode: false,
    selectedBookForPicker: null as any
  });

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // IndexedDB Setup for Zero-Latency Local Storage
  const openDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = (e: any) => reject(e.target.error);
    });
  }, []);

  const fetchBookList = useCallback(async () => {
    try {
      const res = await fetch(`https://bolls.life/get-books/${state.translation}/`);
      if (!res.ok) throw new Error("API Failure");
      const books = await res.json();
      setState(prev => ({ ...prev, bookList: Array.isArray(books) ? books : BIBLE_81_FALLBACK }));
    } catch (e) {
      console.warn("Book list fetch failed, using fallback.");
      setState(prev => ({ ...prev, bookList: BIBLE_81_FALLBACK }));
    }
  }, [state.translation]);

  const loadChapter = useCallback(async (bId: number, chap: number, trans: string) => {
    // AUTO-SWITCH TRANSLATION (Fix for "Unexpected Token T" on 81-book range)
    let targetTrans = trans;
    if (bId > 66 && (trans === 'IRV_HIN' || trans === 'KJV')) {
      targetTrans = 'NRSV';
      setState(prev => ({ ...prev, translation: 'NRSV' }));
      toast({ title: "Auto-Switch", description: "This book is available in NRSV (81 books canon)." });
    }

    const cacheKey = `${targetTrans}_${bId}_${chap}`;
    setLoading(true);
    setError(null);

    try {
      // 1. Check IndexedDB first (Offline/Zero-Latency)
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const offlineData = await new Promise<any>((resolve) => {
        const req = store.get(cacheKey);
        req.onsuccess = () => resolve(req.result);
      });

      if (offlineData) {
        setVerses(offlineData.data);
        setLoading(false);
        return;
      }

      // 2. Fetch from API
      const response = await fetch(`https://bolls.life/get-chapter/${targetTrans}/${bId}/${chap}/`);
      const textData = await response.text();

      if (textData.startsWith("{") || textData.startsWith("[")) {
        const data = JSON.parse(textData);
        if (Array.isArray(data)) {
          setVerses(data);
          // Save for Offline use
          const saveTx = db.transaction(STORE_NAME, "readwrite");
          saveTx.objectStore(STORE_NAME).put({ id: cacheKey, data, timestamp: Date.now() });
        } else {
          throw new Error("Invalid Data Format");
        }
      } else {
        throw new Error("Server returned non-JSON data");
      }
    } catch (e) {
      console.error("Bible Load Error:", e);
      setError("Vachan load nahi ho paye. Kripaya dobara koshish karein ya version switch karein.");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [openDB, toast]);

  useEffect(() => {
    fetchBookList();
    loadChapter(state.bookId, state.chapter, state.translation);
    
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [state.bookId, state.chapter, state.translation]);

  // Instant Filtered Book List for 81 Books
  const filteredBooks = useMemo(() => {
    return state.bookList.filter(book => 
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      book.bookid.toString() === searchQuery
    );
  }, [state.bookList, searchQuery]);

  const handleBookSelect = (book: any) => {
    setState(prev => ({ ...prev, selectedBookForPicker: book, chapterPickerMode: true }));
  };

  const handleChapterSelect = (chap: number) => {
    setState(prev => ({ 
      ...prev, 
      bookId: prev.selectedBookForPicker.bookid, 
      chapter: chap, 
      isBookSelectorOpen: false, 
      chapterPickerMode: false,
      selectedVerse: null
    }));
  };

  const handleBookmark = async (v: any) => {
    if (!user || !firestore) {
      toast({ title: "Note", description: "Vachan save karne ke liye sign in karein." });
      return;
    }
    const bookmarkId = `${state.bookId}_${state.chapter}_${v.verse}`;
    const ref = doc(firestore, 'users', user.uid, 'bookmarks', bookmarkId);
    setDoc(ref, {
      userId: user.uid,
      verseId: bookmarkId,
      verseText: v.text,
      bookName: state.bookList.find(b => b.bookid === state.bookId)?.name || "Bible",
      chapter: state.chapter,
      verseNumber: v.verse,
      translation: state.translation,
      createdAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "Vachan Saved" });
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#09090b]">
      {/* Top Header Panel (Sticky & Locked) */}
      <header className="sticky top-0 z-[100] bg-[#09090b]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <Dialog open={state.isBookSelectorOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isBookSelectorOpen: open, chapterPickerMode: false, searchQuery: '' }))}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-3 group">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all shadow-lg">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold font-serif italic text-white leading-none">
                    {state.bookList.find(b => b.bookid === state.bookId)?.name || "Genesis"} {state.chapter}
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Select Book</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl z-[110]">
              <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/40">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="font-serif italic text-2xl text-emerald-500">
                      {state.chapterPickerMode ? `Chapters: ${state.selectedBookForPicker?.name}` : "Pavitra Shastra"}
                    </DialogTitle>
                    {state.chapterPickerMode && (
                      <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, chapterPickerMode: false }))} className="text-emerald-500">
                        Back to Books
                      </Button>
                    )}
                  </div>
                  {!state.chapterPickerMode && (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <Input 
                        placeholder="Matti, Psalms, Tobit..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-12 text-sm focus:ring-emerald-500/20"
                      />
                    </div>
                  )}
                </div>
              </DialogHeader>
              <ScrollArea className="h-[65vh] p-6">
                {!state.chapterPickerMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBooks.length === 0 ? (
                      <div className="col-span-full py-10 text-center text-zinc-600 font-serif italic">Koi book nahi mili...</div>
                    ) : (
                      filteredBooks.map(book => (
                        <button 
                          key={book.bookid} 
                          onClick={() => handleBookSelect(book)}
                          className={cn(
                            "p-5 rounded-2xl border text-left transition-all relative group overflow-hidden",
                            state.bookId === book.bookid ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/30"
                          )}
                        >
                          <div className="relative z-10 flex flex-col">
                            <span className="text-sm font-bold font-serif">{book.name}</span>
                            <span className="text-[9px] uppercase font-black tracking-widest opacity-50 mt-1">{book.chapters} Chapters</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3 pb-10">
                    {Array.from({ length: state.selectedBookForPicker?.chapters || 1 }, (_, i) => i + 1).map(chap => (
                      <button 
                        key={chap} 
                        onClick={() => handleChapterSelect(chap)}
                        className={cn(
                          "aspect-square rounded-2xl border flex items-center justify-center font-bold transition-all text-sm shadow-xl",
                          state.chapter === chap && state.bookId === state.selectedBookForPicker.bookid 
                            ? "bg-emerald-500 text-black border-emerald-500" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/40"
                        )}
                      >
                        {chap}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-3">
            {isOffline && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full animate-pulse">
                <WifiOff className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Offline</span>
              </div>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <button className="size-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all shadow-xl">
                  <Settings2 className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 rounded-[2.5rem] p-8 z-[120]">
                <DialogHeader><DialogTitle className="font-serif italic text-emerald-500 text-2xl">Reading Style</DialogTitle></DialogHeader>
                <div className="space-y-10 pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      <span>Font Size</span>
                      <span className="text-emerald-500">{fontSize}px</span>
                    </div>
                    <Slider value={[fontSize]} onValueChange={(val) => setFontSize(val[0])} min={14} max={36} step={1} />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Translation</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {BIBLE_VERSIONS.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => setState(prev => ({ ...prev, translation: v.id, selectedVerse: null }))} 
                          className={cn(
                            "p-5 rounded-2xl border text-left text-xs font-bold transition-all flex justify-between items-center",
                            state.translation === v.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 shadow-xl"
                          )}
                        >
                          {v.name}
                          {state.translation === v.id && <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content Area (Scrollable with Bottom Padding) */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-[200px] scroll-smooth">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-8 opacity-40">
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-2xl animate-pulse">Consulting Scriptures...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-8">
            <div className="size-24 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-2xl">
              <Info className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-xl font-serif italic text-zinc-400 max-w-xs">{error}</p>
            <Button variant="outline" onClick={() => loadChapter(state.bookId, state.chapter, state.translation)} className="rounded-full px-12 py-6 border-emerald-500 text-emerald-500 font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500/10">
              Retry Connection
            </Button>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-6 opacity-40">
            <BookOpen className="w-20 h-20 text-zinc-800" />
            <p className="text-xl font-serif italic">Is chapter mein koi vachan nahi mila.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-12 px-8 space-y-12">
            <div className="space-y-4 mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Holy Word</span>
              <h1 className="text-5xl font-bold font-serif italic text-white leading-tight">
                {state.bookList.find(b => b.bookid === state.bookId)?.name} {state.chapter}
              </h1>
              <div className="h-1.5 w-20 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>

            <div className="space-y-12">
              {verses.map((v, i) => (
                <div 
                  key={v.pk || i} 
                  onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                  className={cn(
                    "p-5 rounded-[2rem] transition-all duration-700 relative group border border-transparent cursor-pointer",
                    state.selectedVerse?.pk === v.pk 
                      ? "bg-emerald-500/5 border-emerald-500/20 shadow-2xl scale-[1.03] ring-1 ring-emerald-500/10" 
                      : "hover:bg-zinc-900/40"
                  )}
                >
                  <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-zinc-200 font-serif">
                    <span className="text-emerald-500 font-bold mr-4 opacity-40 text-[0.8em]">{v.verse}</span>
                    <span>{v.text}</span>
                  </p>
                  
                  {state.selectedVerse?.pk === v.pk && (
                    <div className="flex items-center gap-3 mt-6 animate-in slide-in-from-top-4 duration-500">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBookmark(v); }} 
                        className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl hover:text-emerald-500 transition-all shadow-2xl active:scale-90"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) navigator.share({ title: 'Divine Compass Verse', text: `"${v.text}" — ${state.bookList.find(b => b.bookid === state.bookId)?.name} ${state.chapter}:${v.verse}` });
                        }} 
                        className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl hover:text-emerald-500 shadow-2xl active:scale-90 transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                const nextChapter = state.chapter + 1;
                setState(prev => ({ ...prev, chapter: nextChapter, selectedVerse: null }));
              }}
              className="w-full py-14 bg-zinc-900/30 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-emerald-500 hover:bg-emerald-500/10 transition-all group shadow-2xl hover:border-emerald-500/20"
            >
              <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-xl">
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 block mb-2">Continue Path</span>
                <span className="text-xl font-bold font-serif italic text-zinc-200">Next Chapter {state.chapter + 1}</span>
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
