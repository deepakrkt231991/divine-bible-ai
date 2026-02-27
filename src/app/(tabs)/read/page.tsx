"use client";

import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Bell, 
  ChevronRight, 
  Layers 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BibleIndexPage() {
  const [testament, setTestament] = useState<'old' | 'new'>('old');

  const books = [
    { name: "Genesis", short: "Ge", chapters: 50, snippet: "In the beginning God created...", progress: 32 },
    { name: "Exodus", short: "Ex", chapters: 40, snippet: "These are the names of the sons...", progress: 0 },
    { name: "Leviticus", short: "Le", chapters: 27, snippet: "The Lord called to Moses and spoke...", progress: 0 },
    { name: "Numbers", short: "Nu", chapters: 36, snippet: "The Lord spoke to Moses in the...", progress: 0 },
  ];

  const historicalBooks = [
    { name: "Joshua", short: "Js", chapters: 24, type: "Historical" },
    { name: "Judges", short: "Jg", chapters: 21, type: "Historical" },
    { name: "Ruth", short: "Ru", chapters: 4, type: "Historical" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight">Divine Compass</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-zinc-400" />
            </button>
            <button className="size-10 rounded-full border-2 border-primary/30 overflow-hidden bg-zinc-800">
              <div className="w-full h-full flex items-center justify-center text-primary font-bold">JD</div>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              className="block w-full pl-10 pr-4 py-6 bg-zinc-900/50 border-zinc-800 rounded-2xl focus:ring-1 focus:ring-primary focus:border-primary placeholder-zinc-500 text-sm transition-all shadow-xl" 
              placeholder="Search books, verses, or keywords..." 
            />
          </div>
        </div>

        {/* Testament Tabs */}
        <div className="px-4 pb-4 max-w-2xl mx-auto">
          <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/50">
            <button 
              onClick={() => setTestament('old')}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                testament === 'old' ? "bg-primary text-zinc-950 shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              Old Testament
            </button>
            <button 
              onClick={() => setTestament('new')}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                testament === 'new' ? "bg-primary text-zinc-950 shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              New Testament
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif font-bold text-zinc-100 italic">The Pentateuch</h3>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
            5 Books
          </span>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {books.map((book) => (
            <div key={book.name} className="group relative bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] hover:border-primary/40 hover:bg-zinc-900/60 transition-all cursor-pointer shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-bold group-hover:scale-110 transition-transform">
                  {book.short}
                </div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-2 py-1.5 rounded-lg border border-white/5">
                  {book.chapters} Chapters
                </span>
              </div>
              <h4 className="text-lg font-bold text-zinc-100 mb-1">{book.name}</h4>
              <p className="text-xs text-zinc-500 line-clamp-1 italic">{book.snippet}</p>
              
              <div className="mt-5 flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${book.progress}%` }}></div>
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  book.progress > 0 ? "text-primary" : "text-zinc-600"
                )}>
                  {book.progress > 0 ? `${book.progress}% Read` : "Start"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* History Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif font-bold text-zinc-100 italic">Historical Books</h3>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
            12 Books
          </span>
        </div>

        <div className="space-y-3 mb-12">
          {historicalBooks.map((book) => (
            <div key={book.name} className="flex items-center gap-4 p-5 bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem] hover:border-primary/40 transition-all cursor-pointer group shadow-lg">
              <div className="size-12 shrink-0 rounded-2xl bg-zinc-800 flex items-center justify-center font-serif font-bold text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {book.short}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-zinc-100 text-lg">{book.name}</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                  {book.chapters} Chapters • {book.type}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

import { cn } from '@/lib/utils';