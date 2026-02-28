
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, BookOpen, Layers, X, PlayCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 1. Permanent Fallback Data
const BIBLE_81_FALLBACK = [
  { bookid: 1, name: "Utpatti (Genesis)", chapters: 50, type: "OT" },
  { bookid: 2, name: "Nirgaman (Exodus)", chapters: 40, type: "OT" },
  { bookid: 40, name: "Matti (Matthew)", chapters: 28, type: "NT" },
  { bookid: 43, name: "Yuhanna (John)", chapters: 21, type: "NT" },
  { bookid: 70, name: "Wisdom", chapters: 19, type: "Extra" },
  { bookid: 78, name: "2 Maccabees", chapters: 15, type: "Extra" },
  { bookid: 81, name: "Psalm 151", chapters: 1, type: "Extra" }
];

export default function BibleReaderPage() {
  const [state, setState] = useState({
    translation: "IRV_HIN",
    bookId: 1,
    bookName: "Utpatti",
    chapter: 1,
    verses: [],
    bookList: [],
    loading: true,
    error: false,
    selectorOpen: false,
    searchQuery: ""
  });

  // 2. Safe API Fetching Logic
  const fetchBibleContent = useCallback(async (bid: number, cid: number) => {
    setState(prev => ({ ...prev, loading: true, error: false }));
    const version = bid > 66 ? 'RSV' : state.translation;
    const url = `https://bolls.life/get-chapter/${version}/${bid}/${cid}/`;

    try {
      const res = await fetch(url);
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
         throw new Error("Invalid API Response Format");
      }
      const data = await res.json();
      setState(prev => ({ ...prev, verses: data, loading: false }));
    } catch (e) {
      console.error("Reader Error:", e);
      setState(prev => ({ ...prev, error: true, loading: false }));
    }
  }, [state.translation]);

  // 3. Initial Load for Book List
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
    fetchBibleContent(state.bookId, state.chapter);
  }, [state.translation, fetchBibleContent, state.bookId, state.chapter]);

  const handleBookSelect = (book: any) => {
    setState(prev => ({ ...prev, bookId: book.bookid, bookName: book.name, chapter: 1 }));
    fetchBibleContent(book.bookid, 1);
  };

  const handleChapterSelect = (ch: number) => {
    setState(prev => ({ ...prev, chapter: ch, selectorOpen: false }));
    fetchBibleContent(state.bookId, ch);
  };

  const filteredBooks = state.bookList.filter((b: any) => 
    b.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-slate-100 max-w-md mx-auto overflow-hidden border-x border-white/5">
      {/* HEADER */}
      <header className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-50">
        <Dialog open={state.selectorOpen} onOpenChange={(o) => setState(prev => ({...prev, selectorOpen: o}))}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2 group">
                <h2 className="font-serif text-lg font-bold text-primary group-active:scale-95 transition-all">
                  {state.bookName} {state.chapter}
                </h2>
                <Layers className="w-4 h-4 text-zinc-500" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.2em] font-black">
                {state.bookId > 66 ? 'RSV (81 Books)' : 'Hindi (IRV)'}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 p-0 max-h-[80vh] flex flex-col">
            <DialogHeader className="p-4 border-b border-zinc-900">
              <DialogTitle className="text-primary font-serif italic text-xl">Select Book</DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({...prev, searchQuery: e.target.value}))}
                  placeholder="Search Bible books..." 
                  className="w-full bg-zinc-900 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 p-2">
              <div className="grid grid-cols-1 gap-1">
                {filteredBooks.map((book: any) => (
                  <button 
                    key={book.bookid}
                    onClick={() => handleBookSelect(book)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl transition-all",
                      state.bookId === book.bookid ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-zinc-300"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">{book.name}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{book.chapters} Chapters</span>
                    </div>
                    {state.bookId === book.bookid && (
                      <div className="grid grid-cols-5 gap-1 mt-4 w-full pt-4 border-t border-primary/10">
                        {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
                          <button
                            key={ch}
                            onClick={(e) => { e.stopPropagation(); handleChapterSelect(ch); }}
                            className={cn(
                              "size-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                              state.chapter === ch ? "bg-primary text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            )}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </header>

      {/* MAIN READER */}
      <main className="flex-1 overflow-y-auto px-6 py-10 pb-48 scroll-smooth hide-scrollbar">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Consuming Scripture...</p>
          </div>
        ) : state.error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-6">
            <div className="size-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500/50">
              <X className="w-10 h-10" />
            </div>
            <p className="text-zinc-500 text-sm font-serif italic">Maaf kijiye, vachan load nahi ho paaye.</p>
            <Button onClick={() => fetchBibleContent(state.bookId, state.chapter)} variant="outline" className="border-primary/20 text-primary rounded-full px-8 uppercase text-[10px] font-black tracking-widest">Retry</Button>
          </div>
        ) : (
          <div className="space-y-8 font-serif text-xl leading-[1.8] animate-in fade-in duration-700">
            {state.verses.map((v: any) => (
              <p key={v.pk} className="group cursor-pointer hover:bg-primary/5 p-2 -mx-2 rounded-2xl transition-all relative">
                <span className="text-primary font-bold text-xs absolute -left-1 top-3 opacity-40">{v.verse}</span>
                <span className="text-zinc-200">{v.text}</span>
              </p>
            ))}
            
            {/* NAVIGATION CONTROLS */}
            <div className="pt-12 pb-20 border-t border-white/5 flex flex-col gap-6">
              <button 
                onClick={() => handleChapterSelect(state.chapter + 1)}
                className="w-full py-10 border-2 border-dashed border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 group hover:border-primary/30 transition-all"
              >
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <ChevronRight className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-primary transition-all">Next Chapter</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COMPACT FLOATING CONTROLS */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-40">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/5 rounded-full p-1.5 flex items-center justify-between shadow-2xl shadow-black">
          <button 
            onClick={() => handleChapterSelect(Math.max(1, state.chapter - 1))}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-1 rounded-full border border-white/5">
            <PlayCircle className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Listen</span>
          </div>
          <button 
            onClick={() => handleChapterSelect(state.chapter + 1)}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
