'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Loader2, 
  Bookmark, 
  Share2,
  Search,
  Settings2,
  ArrowRight,
  WifiOff,
  BookOpen,
  Info,
  ChevronLeft,
  ChevronRight,
  PlayCircle
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

// UNIVERSAL BIBLE ENGINE CONFIG
const DB_NAME = "DivineBible_V15";
const STORE_NAME = "verses";

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
  { id: 'IRV_HIN', name: 'Hindi (IRV)', books: 66 },
  { id: 'KJV', name: 'English (KJV)', books: 66 },
  { id: 'NRSV', name: 'English (NRSV)', books: 81 },
  { id: 'RSV', name: 'Revised Standard (RSV)', books: 81 },
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
  const [fontSize, setFontSize] = useState(19);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined') return;
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
      const trans = state.translation || 'IRV_HIN';
      const res = await fetch(`https://bolls.life/get-books/${trans}/`);
      if (!res.ok) throw new Error("API failure");
      const books = await res.json();
      setState(prev => ({ ...prev, bookList: Array.isArray(books) ? books : BIBLE_81_FALLBACK }));
    } catch (e) {
      console.warn("Using fallback book list.");
      setState(prev => ({ ...prev, bookList: BIBLE_81_FALLBACK }));
    }
  }, [state.translation]);

  const loadChapter = useCallback(async (bId: number, chap: number, trans: string) => {
    // UNIVERSAL AUTO-SWITCH LOGIC (For 81-book support)
    let currentTrans = trans;
    if (bId > 66 && (trans === 'IRV_HIN' || trans === 'KJV')) {
      currentTrans = 'NRSV';
      setState(prev => ({ ...prev, translation: 'NRSV' }));
      toast({ title: "Auto-Switch", description: "This book is being loaded from the 81-book canon." });
    }

    const cacheKey = `${currentTrans}_${bId}_${chap}`;
    setLoading(true);
    setError(null);

    try {
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

      const response = await fetch(`https://bolls.life/get-chapter/${currentTrans}/${bId}/${chap}/`);
      const textData = await response.text();

      if (textData.startsWith("{") || textData.startsWith("[")) {
        const data = JSON.parse(textData);
        if (Array.isArray(data)) {
          setVerses(data);
          const saveTx = db.transaction(STORE_NAME, "readwrite");
          saveTx.objectStore(STORE_NAME).put({ id: cacheKey, data });
        } else {
          throw new Error("Invalid Format");
        }
      } else {
        throw new Error("Non-JSON response from server");
      }
    } catch (e) {
      console.error("Bible Engine Error:", e);
      setError("Vachan load nahi hue. Kripaya internet check karein ya Retry dabayein.");
    } finally {
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
  }, [state.bookId, state.chapter, state.translation, fetchBookList, loadChapter]);

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
      toast({ title: "Login Required", description: "Please sign in to save verses." });
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
    toast({ title: "Bookmark Saved", description: "Saved to your spiritual profile." });
  };

  const currentBookName = state.bookList.find(b => b.bookid === state.bookId)?.name || "Utpatti";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#09090b]">
      {/* HEADER: Sticky & Locked */}
      <header className="sticky top-0 z-[100] bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <Dialog 
            open={state.isBookSelectorOpen} 
            onOpenChange={(open) => setState(prev => ({ ...prev, isBookSelectorOpen: open, chapterPickerMode: false }))}
          >
            <DialogTrigger asChild>
              <button className="flex items-center gap-3 group text-left">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all shadow-lg">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-serif italic text-white leading-none">
                    {currentBookName} {state.chapter}
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Pavitra Vachan</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl z-[110]">
              <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/40">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="font-serif italic text-2xl text-emerald-500">
                      {state.chapterPickerMode ? `${state.selectedBookForPicker?.name}` : "Divine Selector"}
                    </DialogTitle>
                    {state.chapterPickerMode && (
                      <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, chapterPickerMode: false }))} className="text-emerald-500">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                  </div>
                  {!state.chapterPickerMode && (
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <Input 
                        placeholder="Search books: Matti, Tobit..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-12 text-sm focus:ring-emerald-500/20"
                      />
                    </div>
                  )}
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] p-6">
                {!state.chapterPickerMode ? (
                  <div className="grid grid-cols-1 gap-2.5 pb-20">
                    {filteredBooks.map(book => (
                      <button 
                        key={book.bookid} 
                        onClick={() => handleBookSelect(book)}
                        className={cn(
                          "p-5 rounded-2xl border text-left transition-all relative group overflow-hidden",
                          state.bookId === book.bookid ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/30"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold font-serif">{book.name}</span>
                          <span className="text-[9px] uppercase font-black tracking-widest opacity-50">{book.chapters} Chapters</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3 pb-20">
                    {Array.from({ length: state.selectedBookForPicker?.chapters || 1 }, (_, i) => i + 1).map(chap => (
                      <button 
                        key={chap} 
                        onClick={() => handleChapterSelect(chap)}
                        className={cn(
                          "aspect-square rounded-2xl border flex items-center justify-center font-bold transition-all text-sm",
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
                <DialogHeader><DialogTitle className="font-serif italic text-emerald-500 text-2xl">Reader Settings</DialogTitle></DialogHeader>
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
                            state.translation === v.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                          )}
                        >
                          {v.name}
                          {state.translation === v.id && <div className="size-2 rounded-full bg-emerald-500" />}
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-[200px] scroll-smooth">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl animate-pulse">Vachan load ho rahe hain...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-8">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <Info className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-lg font-serif italic text-zinc-400">{error}</p>
            <Button 
              onClick={() => loadChapter(state.bookId, state.chapter, state.translation)} 
              className="bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] px-10 py-4 rounded-full"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-12 px-8">
            <div className="mb-16 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">Divine Scriptures</span>
              <h1 className="text-5xl font-bold font-serif italic text-white leading-tight">
                {currentBookName} {state.chapter}
              </h1>
              <div className="h-1.5 w-20 bg-emerald-500 rounded-full" />
            </div>

            <div className="space-y-6">
              {verses.map((v, i) => (
                <div 
                  key={v.pk || i} 
                  onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                  className={cn(
                    "verse-line",
                    state.selectedVerse?.pk === v.pk && "highlight-emerald"
                  )}
                >
                  <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-zinc-200 font-serif">
                    <span className="text-emerald-500 font-bold mr-4 opacity-40 text-[0.8em]">{v.verse}</span>
                    <span>{v.text}</span>
                  </p>
                  
                  {state.selectedVerse?.pk === v.pk && (
                    <div className="flex items-center gap-3 mt-6 animate-in slide-in-from-top-4 duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBookmark(v); }} 
                        className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl hover:text-emerald-500 transition-all shadow-xl"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({ 
                              title: 'Divine Compass', 
                              text: `"${v.text}" — ${currentBookName} ${state.chapter}:${v.verse}` 
                            });
                          }
                        }} 
                        className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl hover:text-emerald-500 shadow-xl transition-all"
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
              onClick={() => loadChapter(state.bookId, state.chapter + 1, state.translation)}
              className="w-full py-14 bg-zinc-900/30 border border-white/5 rounded-[3rem] mt-16 flex flex-col items-center justify-center gap-6 text-emerald-500 hover:bg-emerald-500/10 transition-all group"
            >
              <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-all">
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 block mb-2">Continue Journey</span>
                <span className="text-xl font-bold font-serif italic text-zinc-200">Next Chapter {state.chapter + 1}</span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* BOTTOM NAV: Compact Control Panel */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-[40]">
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/5 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => loadChapter(state.bookId, state.chapter - 1, state.translation)} 
            disabled={state.chapter <= 1}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-400 disabled:opacity-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <button className="w-11 h-11 rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              <PlayCircle className="w-7 h-7" />
            </button>
            <div className="flex flex-col">
              <span className="text-[8px] text-emerald-500 uppercase font-black tracking-widest">Audio Bible</span>
              <span className="text-[10px] text-zinc-400 font-medium">Ready</span>
            </div>
          </div>
          <button 
            onClick={() => loadChapter(state.bookId, state.chapter + 1, state.translation)} 
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
