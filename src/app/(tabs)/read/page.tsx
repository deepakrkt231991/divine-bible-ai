
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
  RefreshCw,
  Trash2,
  WifiOff,
  BookOpen,
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

// Database Config for Offline Support
const DB_NAME = "DivineBibleDB_V6";
const STORE_NAME = "verses";
const MemoryCache = new Map();

// Bible Canon Config
const BIBLE_SECTIONS = {
  "Old Testament": Array.from({ length: 39 }, (_, i) => i + 1),
  "New Testament": Array.from({ length: 27 }, (_, i) => i + 40),
  "Deuterocanonical": Array.from({ length: 12 }, (_, i) => i + 67),
  "Orthodox Extra": Array.from({ length: 3 }, (_, i) => i + 79)
};

const BIBLE_VERSIONS = [
  { id: 'IRV_HIN', name: 'Hindi (IRV)', lang: 'hi-IN', books: 66 },
  { id: 'KJV', name: 'English (KJV)', lang: 'en-US', books: 66 },
  { id: 'IRV_MAR', name: 'Marathi (IRV)', lang: 'mr-IN', books: 66 },
  { id: 'NRSV', name: 'English (NRSV)', lang: 'en-US', books: 81 },
];

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [state, setState] = useState({
    translation: 'IRV_HIN',
    bookId: 1, // Default: Genesis
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

  // IndexedDB Setup for Persistent Offline Cache
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

  // Fetch Full Book List
  const fetchBookList = useCallback(async () => {
    try {
      const res = await fetch(`https://bolls.life/get-books/${state.translation}/`);
      if (!res.ok) throw new Error("API failure");
      const books = await res.json();
      setState(prev => ({ ...prev, bookList: Array.isArray(books) ? books : [] }));
    } catch (e) {
      console.error("Book list fetch error:", e);
    }
  }, [state.translation]);

  // Load Chapter with Robust Error Handling
  const loadChapter = useCallback(async (bId: number, chap: number, trans: string) => {
    // Auto-Switch for Extra Books
    let targetTrans = trans;
    if (bId > 66 && (trans === 'IRV_HIN' || trans === 'KJV' || trans === 'IRV_MAR')) {
      targetTrans = 'NRSV';
      setState(prev => ({ ...prev, translation: 'NRSV' }));
      toast({ title: "Version Switched", description: "Vachan NRSV (81 books) mein available hai." });
    }

    const cacheKey = `${targetTrans}_${bId}_${chap}`;
    
    // Check Memory Cache
    if (MemoryCache.has(cacheKey)) {
      setVerses(MemoryCache.get(cacheKey));
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Check IndexedDB first
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const offlineData = await new Promise<any>((resolve) => {
        const req = store.get(cacheKey);
        req.onsuccess = () => resolve(req.result);
      });

      if (offlineData) {
        MemoryCache.set(cacheKey, offlineData.data);
        setVerses(offlineData.data);
        setLoading(false);
        return;
      }

      // 2. Fetch from API
      const url = `https://bolls.life/get-chapter/${targetTrans}/${bId}/${chap}/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      
      const text = await response.text();
      // Validate JSON
      if (!text.startsWith("{") && !text.startsWith("[")) {
        throw new Error("Invalid API Data (Not JSON)");
      }

      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        setVerses(data);
        MemoryCache.set(cacheKey, data);
        
        // Save to IndexedDB
        const saveTx = db.transaction(STORE_NAME, "readwrite");
        saveTx.objectStore(STORE_NAME).put({ id: cacheKey, data, timestamp: Date.now() });
      } else {
        setVerses([]);
        setError("Is chapter mein koi vachan nahi mila.");
      }
    } catch (e: any) {
      console.error("Bible Load Error:", e);
      setError("Vachan load nahi ho paye. Kripaya internet check karein ya thodi der baad koshish karein.");
    } finally {
      setLoading(false);
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
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmark = async (v: any) => {
    if (!user || !firestore) {
      toast({ title: "Sign In Required", description: "Vachan save karne ke liye login karein." });
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
    toast({ title: "Vachan Saved", description: "Added to your Divine Library." });
  };

  const handleSpeak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BIBLE_VERSIONS.find(v => v.id === state.translation)?.lang || 'hi-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#09090b]">
      {/* Fixed Header */}
      <header className="sticky top-0 z-[60] bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5">
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
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Change Chapter</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl z-[100]">
              <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/50">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="font-serif italic text-2xl text-emerald-500">
                    {state.chapterPickerMode ? `Chapters: ${state.selectedBookForPicker?.name}` : "Pavitra Shastra"}
                  </DialogTitle>
                  {!state.chapterPickerMode && (
                    <div className="relative flex-1 max-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                      <Input 
                        placeholder="Search..." 
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
                                  state.bookId === book.bookid ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/30"
                                )}
                              >
                                <span className="text-xs font-bold font-serif">{book.name}</span>
                                <span className="block text-[8px] opacity-60 mt-1 uppercase">{book.chapters} Chapters</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: state.selectedBookForPicker?.chapters || 0 }, (_, i) => i + 1).map(chap => (
                      <button 
                        key={chap} 
                        onClick={() => handleChapterSelect(chap)}
                        className={cn(
                          "aspect-square rounded-2xl border flex items-center justify-center font-bold transition-all",
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
              <button className="size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all">
                <Settings2 className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-8 z-[100]">
              <DialogHeader><DialogTitle className="font-serif italic text-emerald-500">Settings</DialogTitle></DialogHeader>
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase"><span>Font Size</span><span>{fontSize}px</span></div>
                  <Slider value={[fontSize]} onValueChange={(val) => setFontSize(val[0])} min={14} max={32} step={1} />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase">Translation</span>
                  <div className="grid grid-cols-1 gap-2">
                    {BIBLE_VERSIONS.map(v => (
                      <button 
                        key={v.id} 
                        onClick={() => setState(prev => ({ ...prev, translation: v.id, selectedVerse: null }))} 
                        className={cn("p-4 rounded-xl border text-left text-xs font-bold transition-all", state.translation === v.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-400")}
                      >
                        {v.name} {v.books === 81 ? "(81 Books)" : ""}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    indexedDB.deleteDatabase(DB_NAME);
                    window.location.reload();
                  }}
                  className="w-full p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-between"
                >
                  <span>Clear Storage</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-40">
        {isOffline && (
          <div className="bg-orange-500/10 border-b border-orange-500/20 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-3 h-3 text-orange-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">Offline Mode</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
            <RefreshCw className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl animate-pulse">Vachan load ho rahe hain...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-6 opacity-50">
            <BookOpen className="w-16 h-16 text-zinc-700" />
            <div className="space-y-2">
              <p className="text-xl font-serif italic">{error}</p>
            </div>
            <Button variant="outline" onClick={() => loadChapter(state.bookId, state.chapter, state.translation)} className="rounded-full px-10 border-emerald-500 text-emerald-500">
              Try Again
            </Button>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10 gap-6 opacity-50">
            <BookOpen className="w-16 h-16 text-zinc-700" />
            <p className="text-xl font-serif italic">Vachan is version mein available nahi hain.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-10 px-6 space-y-10">
            {verses.map((v, i) => (
              <div 
                key={i} 
                onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                className={cn(
                  "verse-row p-4 rounded-2xl transition-all duration-500 relative group",
                  state.selectedVerse?.pk === v.pk ? "bg-emerald-500/5 border-l-4 border-emerald-500 shadow-xl" : "hover:bg-zinc-900/40"
                )}
              >
                <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-zinc-200 font-serif">
                  <span className="text-emerald-500 font-bold mr-3">{v.verse}</span>
                  <span>{v.text}</span>
                </p>
                {state.selectedVerse?.pk === v.pk && (
                  <div className="flex items-center gap-2 mt-4 animate-in slide-in-from-top-2">
                    <button onClick={() => handleBookmark(v)} className="size-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:text-emerald-500 transition-all shadow-xl"><Bookmark className="w-4 h-4" /></button>
                    <button onClick={() => handleSpeak(v.text)} className="size-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:text-emerald-500 shadow-xl"><Volume2 className="w-4 h-4" /></button>
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
              className="w-full py-10 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-emerald-500 hover:bg-emerald-500/10 transition-all group"
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

