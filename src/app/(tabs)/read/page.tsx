'use client';

import React, { useState } from 'react';
import { Search, BookOpen, ChevronRight, User, PlayCircle, Settings2, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export default function BibleIndexPage() {
  const [testament, setTestament] = useState<'old' | 'new'>('old');
  const [fontSize, setFontSize] = useState(20);
  const [showSettings, setShowSettings] = useState(false);

  const books = [
    { name: "Genesis", short: "Ge", chapters: 50, snippet: "In the beginning God created the heavens...", progress: 32 },
    { name: "Exodus", short: "Ex", chapters: 40, snippet: "These are the names of the sons of Israel...", progress: 0 },
    { name: "Leviticus", short: "Le", chapters: 27, snippet: "The Lord called to Moses and spoke...", progress: 0 },
    { name: "Numbers", short: "Nu", chapters: 36, snippet: "The Lord spoke to Moses in the Tent...", progress: 0 },
    { name: "Deuteronomy", short: "De", chapters: 34, snippet: "These are the words Moses spoke...", progress: 0 },
  ];

  const historicalBooks = [
    { name: "Joshua", short: "Js", chapters: 24, type: "Historical" },
    { name: "Judges", short: "Jg", chapters: 21, type: "Historical" },
    { name: "Ruth", short: "Ru", chapters: 4, type: "Historical" },
  ];

  // Browser-based TTS for Marathi/Hindi Support as requested
  const playVerse = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prefer Hindi or Marathi voices
    const targetVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('mr')) || voices[0];
    if (targetVoice) utterance.voice = targetVoice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight italic text-white">Bible Reader</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn("p-2 rounded-full transition-colors hover:bg-zinc-800", showSettings && "bg-emerald-500/10 text-emerald-500")}
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
            <button className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <Input 
              className="block w-full pl-12 pr-4 py-7 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-zinc-500 text-base transition-all" 
              placeholder="Search books or chapters..." 
            />
          </div>
        </div>

        {/* Font Settings Overlay */}
        {showSettings && (
          <div className="px-4 pb-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
            <Card className="bg-zinc-900 p-8 rounded-[2rem] border border-emerald-500/20 shadow-2xl">
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <span>Reading Font Size</span>
                  <span className="text-emerald-500">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-6">
                  <Minus className="w-5 h-5 text-zinc-500" />
                  <Slider 
                    value={[fontSize]} 
                    onValueChange={(val) => setFontSize(val[0])} 
                    min={14} max={42} step={1}
                    className="flex-1"
                  />
                  <Plus className="w-5 h-5 text-zinc-500" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Testament Tabs */}
        <div className="px-4 pb-5 max-w-2xl mx-auto">
          <div className="flex gap-1.5 p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-inner">
            <button 
              onClick={() => setTestament('old')}
              className={cn(
                "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                testament === 'old' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-zinc-100"
              )}
            >
              Old Testament
            </button>
            <button 
              onClick={() => setTestament('new')}
              className={cn(
                "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                testament === 'new' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-zinc-100"
              )}
            >
              New Testament
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8 px-1">
          <h3 className="text-2xl font-serif font-bold text-zinc-100 italic">The Pentateuch</h3>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">5 Books</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {books.map((book) => (
            <div key={book.name} className="group relative bg-[#121214] border border-zinc-800 p-6 rounded-[1.5rem] hover:border-emerald-500/40 hover:bg-zinc-900 transition-all cursor-pointer shadow-xl">
              <div className="flex justify-between items-start mb-5">
                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-serif text-2xl font-bold group-hover:scale-110 transition-transform">
                  {book.short}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); playVerse(book.snippet); }}
                    className="size-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-emerald-500/20 transition-colors border border-zinc-700"
                  >
                    <PlayCircle className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
                  </button>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-2.5 py-1.5 rounded-lg border border-white/5">
                    {book.chapters} CH
                  </span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-zinc-100 mb-2" style={{ fontSize: `${fontSize * 0.9}px` }}>{book.name}</h4>
              <p className="text-sm text-zinc-500 line-clamp-1 italic font-serif leading-relaxed">"{book.snippet}"</p>
              
              <div className="mt-6 flex items-center gap-4">
                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 glow-primary transition-all duration-1000" style={{ width: `${book.progress}%` }}></div>
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em]",
                  book.progress > 0 ? "text-emerald-500" : "text-zinc-600"
                )}>
                  {book.progress > 0 ? `${book.progress}%` : "START"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8 px-1">
          <h3 className="text-2xl font-serif font-bold text-zinc-100 italic">Historical Books</h3>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">12 Books</span>
        </div>

        <div className="space-y-4 mb-16">
          {historicalBooks.map((book) => (
            <div key={book.name} className="flex items-center gap-5 p-6 bg-[#121214] border border-zinc-800 rounded-2xl hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg">
              <div className="size-14 shrink-0 rounded-2xl bg-zinc-800 flex items-center justify-center font-serif font-bold text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors border border-zinc-700">
                {book.short}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-zinc-100">{book.name}</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                  {book.chapters} Chapters • {book.type}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}