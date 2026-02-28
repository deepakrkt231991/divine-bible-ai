'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Offline Database Config
const DB_NAME = "DivineBibleDB_V8";
const STORE_NAME = "verses";
const MemoryCache = new Map();

// 81 Books Fallback Data (Manager's Fix)
const BIBLE_81_FALLBACK = [
  // OT (1-39)
  { bookid: 1, name: "Utpatti (Genesis)", chapters: 50 },
  { bookid: 19, name: "Bhajan Sanhita (Psalms)", chapters: 150 },
  // NT (40-66)
  { bookid: 40, name: "Matti (Matthew)", chapters: 28 },
  { bookid: 43, name: "Yuhanna (John)", chapters: 21 },
  // Deuterocanon/Extra (67-81)
  { bookid: 67, name: "Tobit", chapters: 14 },
  { bookid: 68, name: "Judith", chapters: 16 },
  { bookid: 70, name: "Wisdom", chapters: 19 },
  { bookid: 71, name: "Sirach", chapters: 51 },
  { bookid: 72, name: "Baruch", chapters: 6 },
  { bookid: 77, name: "1 Maccabees", chapters: 16 },
  { bookid: 78, name: "2 Maccabees", chapters: 15 },
  { bookid: 81, name: "Bhajan 151 (Psalm 151)", chapters: 1 }
];

const BIBLE_SECTIONS = {
  "Old Testament": Array.from({ length: 39 }, (_, i) => i + 1),
  "New Testament": Array.from({ length: 27 }, (_, i) => i + 40),
  "Deuterocanonical": Array.from({ length: 15 }, (_, i) => i + 67),
};

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
    bookList: [] as any[],
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

  // IndexedDB Setup for Zero-Latency
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
    // AUTO-SWITCH TRANSLATION (Fix for "Unexpected Token T")
    let targetTrans = trans;
    if (bId > 66 && (trans === 'IRV_HIN' || trans === 'KJV')) {
      targetTrans = 'NRSV';
      setState(prev => ({ ...prev, translation: 'NRSV' }));
      toast({ title: "Auto-Switch", description: "Vachan NRSV (81 books) mein switch kiya gaya hai." });
    }

    const cacheKey = `${targetTrans}_${bId}_${chap}`;
    if (MemoryCache.has(cacheKey)) {
      setVerses(MemoryCache.get(cacheKey));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Check IndexedDB Offline Storage
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const offlineData = await new Promise<any>((resolve) => {
        const req = store.get(cacheKey);
        req.onsuccess = () => resolve(req.result);
      });

      if (offlineData) {
        setVerses(offlineData.data);
        MemoryCache.set(cacheKey, offlineData.data);
        setLoading(false);
        return;
      }

      // 2. API Fetch
      const response = await fetch(`https://bolls.life/get-chapter/${targetTrans}/${bId}/${chap}/`);
      const textData = await response.text();

      if (textData.startsWith("{") || textData.startsWith("[")) {
        const data = JSON.parse(textData);
        setVerses(data);
        MemoryCache.set(cacheKey, data);
        
        // Save for Offline
        const saveTx = db.transaction(STORE_NAME, "readwrite");
        saveTx.objectStore(STORE_NAME).put({ id: cacheKey, data, timestamp: Date.now() });
      } else {
        throw new Error("Invalid Response Format");
      }
    } catch (e) {
      console.error("Bible Load Error:", e);
      setError("Vachan load nahi ho paye. Kripaya dobara koshish karein.");
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
  }, [state.bookId, state.chapter, state.translation, fetchBookList, loadChapter]);

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
      {/* Header Panel */}
      <header className="sticky top-0 z-[100] bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <Dialog open={state.isBookSelectorOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isBookSelectorOpen: open, chapterPickerMode: false }))}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-3 group">
                <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold font-serif italic text-white leading-none">
                    {state.bookList.find(b => b.bookid === state.bookId)?.name || "Loading..."} {state.chapter}
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Change Book</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl z-[110]">
              <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/50">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="font-serif italic text-2xl text-emerald-500">
                    {state.chapterPickerMode ? `Chapters: ${state.selectedBookForPicker?.name}` : "Pavitra Shastra"}
                  </DialogTitle>
                  {!state.chapterPickerMode && (
                    <div className="relative flex-1 max-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <Input 
                        placeholder="Search books..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 rounded-xl h-9 pl-9 text-xs focus-visible:ring-emerald-500/20"
                      />
                    </div>
                  )}
                  {state.chapterPickerMode && (
                    <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, chapterPickerMode: false }))} className="text-emerald-500">
                      Back
                    </Button>
                  )}
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] p-6">
                {!state.chapterPickerMode ? (
                  <div className="space-y-8">
                    {Object.entries(BIBLE_SECTIONS).map(([section, ids]) => {
                      const sectionBooks = state.bookList.filter(b => ids.includes(b.bookid) && b.name.toLowerCase().includes(searchQuery.toLowerCase()));
                      if (sectionBooks.length === 0) return null;
                      return (
                        <div key={section} className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-l-2 border-emerald-500 pl-3">{section}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {sectionBooks.map(book => (
                              <button 
                                key={book.bookid} 
                                onClick={() => handleBookSelect(book)}
                                className={cn(
                                  "p-4 rounded-2xl border text-left transition-all",
                                  state.bookId === book.bookid ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/30 shadow-xl"
                                )}
                              >
                                <span className="text-xs font-bold font-serif">{book.name}</span>
                                <span className="block text-[8px] opacity-60 mt-1 uppercase tracking-widest">{book.chapters} Chapters</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: state.selectedBookForPicker?.chapters || 1 }, (_, i) => i + 1).map(chap => (
                      <button 
                        key={chap} 
                        onClick={() => handleChapterSelect(chap)}
                        className={cn(
                          "aspect-square rounded-2xl border flex items-center justify-center font-bold transition-all text-sm shadow-lg",
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

          <Dialog>
            <DialogTrigger asChild>
              <button className="size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all shadow-xl">
                <Settings2 className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-8 z-[120]">
              <DialogHeader><DialogTitle className="font-serif italic text-emerald-500">Reading Settings</DialogTitle></DialogHeader>
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest"><span>Font Size</span><span>{fontSize}px</span></div>
                  <Slider value={[fontSize]} onValueChange={(val) => setFontSize(val[0])} min={14} max={32} step={1} />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Translation</span>
                  <div className="grid grid-cols-1 gap-2">
                    {BIBLE_VERSIONS.map(v => (
                      <button 
                        key={v.id} 
                        onClick={() => setState(prev => ({ ...prev, translation: v.id, selectedVerse: null }))} 
                        className={cn("p-4 rounded-xl border text-left text-xs font-bold transition-all shadow-md", state.translation === v.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-400")}
                      >
                        {v.name} {v.books === 81 ? "(Full 81 Books)" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-[200px]">
        {isOffline && (
          <div className="bg-orange-500/10 border-b border-orange-500/20 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-3 h-3 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Offline Mode (Cached Chapter)</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40 animate-pulse">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl">Vachan load ho rahe hain...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-6">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Info className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-xl font-serif italic text-zinc-400">{error}</p>
            <Button variant="outline" onClick={() => loadChapter(state.bookId, state.chapter, state.translation)} className="rounded-full px-10 border-emerald-500 text-emerald-500">
              Retry Load
            </Button>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-6 opacity-40">
            <BookOpen className="w-16 h-16 text-zinc-700" />
            <p className="text-xl font-serif italic">Yahan koi vachan nahi dikh raha hai.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-10 px-6 space-y-10">
            {verses.map((v, i) => (
              <div 
                key={v.pk || i} 
                onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                className={cn(
                  "verse-row p-4 rounded-2xl transition-all duration-500 relative group border border-transparent",
                  state.selectedVerse?.pk === v.pk ? "bg-emerald-500/5 border-emerald-500/20 shadow-2xl scale-[1.02]" : "hover:bg-zinc-900/40"
                )}
              >
                <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-zinc-200 font-serif">
                  <span className="text-emerald-500 font-bold mr-3 opacity-60">{v.verse}</span>
                  <span>{v.text}</span>
                </p>
                {state.selectedVerse?.pk === v.pk && (
                  <div className="flex items-center gap-2 mt-4 animate-in slide-in-from-top-2">
                    <button onClick={() => handleBookmark(v)} className="size-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:text-emerald-500 transition-all shadow-xl"><Bookmark className="w-4 h-4" /></button>
                    <button onClick={() => {
                       if (navigator.share) {
                        navigator.share({ title: 'Bible Verse', text: v.text });
                       }
                    }} className="size-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:text-emerald-500 shadow-xl"><Share2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}

            <button 
              onClick={() => {
                setState(prev => ({ ...prev, chapter: prev.chapter + 1, selectedVerse: null }));
              }}
              className="w-full py-10 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-emerald-500 hover:bg-emerald-500/10 transition-all group shadow-2xl"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Next Chapter {state.chapter + 1}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
