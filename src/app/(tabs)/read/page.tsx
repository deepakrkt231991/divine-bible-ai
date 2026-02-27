'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, User, PlayCircle, Settings2, Languages, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type Translation = 'KJV' | 'IRV_HIN';

export default function BibleReaderPage() {
  const [translation, setTranslation] = useState<Translation>('IRV_HIN');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [view, setView] = useState<'index' | 'reader'>('index');
  const [currentContent, setCurrentContent] = useState<any>(null);

  // Bolls.life API logic for Language Toggle
  const fetchBibleContent = async (bookId: number, chapter: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://bolls.life/get-text/${translation}/${bookId}/${chapter}/`);
      const data = await res.json();
      setCurrentContent(data);
      setView('reader');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const bollsBooks = [
    { name: "Genesis", id: 1, short: "Ge", chapters: 50, snippet: "In the beginning God created..." },
    { name: "Exodus", id: 2, short: "Ex", chapters: 40, snippet: "These are the names of the sons..." },
    { name: "Matthew", id: 40, short: "Mt", chapters: 28, snippet: "The book of the generation of Jesus..." },
    { name: "John", id: 43, short: "Jn", chapters: 21, snippet: "In the beginning was the Word..." },
  ];

  const playVerse = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = translation === 'IRV_HIN' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight italic text-white">Divine Compass</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
            <button className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <User className="w-5 h-5 text-slate-100" />
            </button>
          </div>
        </div>

        {/* Search & Language Toggle */}
        <div className="px-4 pb-4 max-w-2xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              className="bg-zinc-900/50 border-zinc-800 rounded-xl pl-10 focus:ring-emerald-500" 
              placeholder="Search books or chapters..." 
            />
          </div>
          
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800/50">
            <button 
              onClick={() => setTranslation('IRV_HIN')}
              className={cn(
                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                translation === 'IRV_HIN' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-100"
              )}
            >
              <Languages className="w-3.5 h-3.5" /> Hindi
            </button>
            <button 
              onClick={() => setTranslation('KJV')}
              className={cn(
                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                translation === 'KJV' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-100"
              )}
            >
              <Languages className="w-3.5 h-3.5" /> English
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {view === 'index' ? (
          <>
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-2xl font-serif font-bold text-zinc-100 italic">Scriptures</h3>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">All Books</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {bollsBooks.map((book) => (
                <div 
                  key={book.id} 
                  onClick={() => fetchBibleContent(book.id, 1)}
                  className="group bg-zinc-900/40 border border-zinc-800 p-5 rounded-[1.5rem] hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all cursor-pointer shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-serif text-xl font-bold group-hover:scale-110 transition-transform">
                      {book.short}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); playVerse(book.snippet); }}
                      className="size-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-emerald-500/20 transition-colors border border-zinc-700"
                    >
                      <PlayCircle className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500" />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-zinc-100">{book.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1 uppercase font-black tracking-widest">{book.chapters} Chapters</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <button 
              onClick={() => setView('index')}
              className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:underline mb-4"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Books
            </button>
            
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 font-serif italic">Loading Vachan...</p>
              </div>
            ) : (
              <article className="prose prose-invert max-w-none">
                {currentContent?.map((v: any) => (
                  <p key={v.pk} className="text-lg leading-relaxed mb-4">
                    <span className="text-emerald-500 font-black text-xs mr-3">{v.verse}</span>
                    {v.text}
                  </p>
                ))}
              </article>
            )}
          </div>
        )}
      </main>
    </div>
  );
}