
'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, BookOpen, ChevronLeft, ChevronRight, RefreshCw, Bookmark, Share2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

// 1. Permanent Fallback Data (For 81-book support & API failure)
const BIBLE_81_FALLBACK = [
  { bookid: 1, name: "Utpatti (Genesis)", chapters: 50 },
  { bookid: 2, name: "Nirgaman (Exodus)", chapters: 40 },
  { bookid: 19, name: "Bhajan Sanhita (Psalms)", chapters: 150 },
  { bookid: 40, name: "Matti (Matthew)", chapters: 28 },
  { bookid: 43, name: "Yuhanna (John)", chapters: 21 },
  { bookid: 67, name: "Tobit", chapters: 14 },
  { bookid: 68, name: "Judith", chapters: 16 },
  { bookid: 70, name: "Wisdom", chapters: 19 },
  { bookid: 71, name: "Sirach", chapters: 51 },
  { bookid: 78, name: "2 Maccabees", chapters: 15 },
  { bookid: 81, name: "Psalm 151", chapters: 1 }
];

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [state, setState] = useState({
    translation: "IRV_HIN",
    book: 1,
    chapter: 1,
    verses: [] as any[],
    bookList: BIBLE_81_FALLBACK,
    loading: true,
    error: false,
    selectedVerse: null as any
  });

  // 2. Safe API Fetching Logic (Universal Engine)
  const fetchBibleContent = useCallback(async (bid: number, cid: number) => {
    setState(prev => ({ ...prev, loading: true, error: false, book: bid, chapter: cid }));
    
    // Auto-switch for 81 books support
    const version = bid > 66 ? 'RSV' : state.translation;
    const url = `https://bolls.life/get-chapter/${version}/${bid}/${cid}/`;

    try {
      const res = await fetch(url);
      
      // Check if response is JSON (Prevents "Unexpected Token T" Error)
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
         throw new Error("Invalid API Response Format");
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Not an array");
      
      setState(prev => ({ ...prev, verses: data, loading: false }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Reader Engine Error:", e);
      setState(prev => ({ ...prev, error: true, loading: false }));
    }
  }, [state.translation]);

  // 3. Initial Load & Book List
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`https://bolls.life/get-books/${state.translation}/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setState(prev => ({ ...prev, bookList: Array.isArray(data) ? data : BIBLE_81_FALLBACK }));
      } catch (e) {
        setState(prev => ({ ...prev, bookList: BIBLE_81_FALLBACK }));
      }
    };
    fetchBooks();
    fetchBibleContent(state.book, state.chapter);
  }, [state.translation, fetchBibleContent]);

  const currentBookName = state.bookList.find(b => b.bookid === state.book)?.name || "Bible";

  const handleBookmark = async (v: any) => {
    if (!user || !firestore) {
      toast({ title: "Login Required", description: "Please sign in to save verses." });
      return;
    }
    const bookmarkId = `${state.book}_${state.chapter}_${v.verse}`;
    const ref = doc(firestore, 'users', user.uid, 'bookmarks', bookmarkId);
    await setDoc(ref, {
      userId: user.uid,
      verseId: bookmarkId,
      verseText: v.text,
      bookName: currentBookName,
      chapter: state.chapter,
      verseNumber: v.verse,
      translation: state.translation,
      createdAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "Vachan Saved", description: "Saved to your spiritual profile." });
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-slate-100 max-w-md mx-auto overflow-hidden border-x border-white/5">
      {/* HEADER: Sticky & Locked */}
      <header className="p-4 border-b border-white/5 bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-[100] flex justify-between items-center">
        <div className="flex flex-col items-center w-full text-center">
          <h2 className="font-serif italic font-bold text-xl text-emerald-500 leading-none">
            {currentBookName} {state.chapter}
          </h2>
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-600 mt-2">
            {state.translation === 'IRV_HIN' ? 'Hindi (IRV)' : 'English (RSV)'}
          </span>
        </div>
      </header>

      {/* MAIN READER AREA */}
      <main className="flex-1 overflow-y-auto px-6 py-10 pb-48 scroll-smooth hide-scrollbar">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6 opacity-40">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Connecting Scriptures...</p>
          </div>
        ) : state.error ? (
          <div className="flex flex-col items-center justify-center py-40 text-center gap-8 px-6">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <p className="text-zinc-400 font-serif italic text-lg">Vachan dhoondne mein dikkat hui.</p>
              <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Internet check karein</p>
            </div>
            <button 
              onClick={() => fetchBibleContent(state.book, state.chapter)} 
              className="bg-emerald-500 text-black px-10 py-3.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Retry Load
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {state.verses.map((v: any) => (
              <div 
                key={v.pk} 
                onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                className={cn(
                  "p-4 rounded-2xl transition-all duration-300 cursor-pointer",
                  state.selectedVerse?.pk === v.pk ? "bg-emerald-500/10 border-l-4 border-emerald-500 shadow-lg" : "hover:bg-white/5"
                )}
              >
                <p className="font-serif text-xl leading-[1.8] text-zinc-200">
                  <span className="text-emerald-500 font-bold text-sm mr-4 opacity-50">{v.verse}</span>
                  <span>{v.text}</span>
                </p>
                
                {state.selectedVerse?.pk === v.pk && (
                  <div className="flex gap-3 mt-6 animate-in slide-in-from-top-2 duration-300">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleBookmark(v); }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 py-3 rounded-xl flex items-center justify-center gap-2 hover:text-emerald-500 transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Save</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({ title: 'Divine Compass', text: `"${v.text}" — ${currentBookName} ${state.chapter}:${v.verse}` });
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 py-3 rounded-xl flex items-center justify-center gap-2 hover:text-emerald-500 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Share</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* NEXT CHAPTER BUTTON */}
            <button 
              onClick={() => fetchBibleContent(state.book, state.chapter + 1)}
              className="w-full py-12 mt-12 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-emerald-500 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-all">
                <ChevronRight className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block mb-1">Continue Path</span>
                <span className="text-lg font-bold font-serif italic text-zinc-300">Agla Chapter {state.chapter + 1}</span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* COMPACT FLOATING CONTROLS */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-6 z-40">
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/5 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => fetchBibleContent(state.book, state.chapter - 1)} 
            disabled={state.chapter <= 1}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 disabled:opacity-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 pr-4">
            <button className="w-11 h-11 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
              <PlayCircle className="w-7 h-7" />
            </button>
            <div className="flex flex-col">
              <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Audio Bible</span>
              <span className="text-[10px] text-zinc-400 font-medium">Listening Ready</span>
            </div>
          </div>

          <button 
            onClick={() => fetchBibleContent(state.book, state.chapter + 1)} 
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
