'use client';

import React from 'react';
import { Compass, Share2, Bookmark, BookOpen, Calendar, User, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BibleHomePage() {
  const verseText = "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.";
  const verseRef = "Jeremiah 29:11";
  const aiImageUrl = `https://pollinations.ai/p/${encodeURIComponent("Biblical oil painting of Jeremiah 29:11 plans to prosper and hope, cinematic lighting, 4k, sacred art")}?width=1080&height=1920&model=flux`;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Compass className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">Divine Compass</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
            Register
          </button>
          <button className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Verse Card */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-emerald-500/20 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#121214] border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="h-64 relative">
              <Image src={aiImageUrl} alt="Verse Image" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/40 to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">Verse of the Day</span>
              </div>
            </div>
            <div className="p-10 -mt-16 relative z-10 text-center space-y-6">
              <h2 className="font-serif italic text-2xl md:text-3xl leading-relaxed text-zinc-100">"{verseText}"</h2>
              <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs">— {verseRef}</p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] rounded-full transition-all active:scale-95 shadow-lg">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-2 px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-black uppercase tracking-widest text-[11px] rounded-full border border-emerald-500/20">
                  <Bookmark className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Actions Grid */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/read" className="bg-zinc-900/50 p-6 rounded-[1.5rem] border border-zinc-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg">Bible Reading</h3>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Psalm 23-25</p>
          </Link>
          <Link href="/ai" className="bg-zinc-900/50 p-6 rounded-[1.5rem] border border-zinc-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg">AI Magic</h3>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Ask Chaplain</p>
          </Link>
        </section>

        {/* Ministries Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight font-serif italic text-emerald-500">Ministries</h2>
            <button className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group h-48 rounded-[1.5rem] overflow-hidden cursor-pointer border border-zinc-800">
              <Image className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600" alt="Kids" fill unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white font-bold text-lg">Kids Ministry</h3>
                <p className="text-zinc-300 text-xs">Sunday School</p>
              </div>
            </div>
            <div className="relative group h-48 rounded-[1.5rem] overflow-hidden cursor-pointer border border-zinc-800">
              <Image className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=600" alt="Youth" fill unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white font-bold text-lg">Youth Group</h3>
                <p className="text-zinc-300 text-xs">Ages 13-18</p>
              </div>
            </div>
          </div>
        </section>

        {/* Event Card */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 shadow-2xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 font-serif italic text-emerald-500">
            <Calendar className="w-5 h-5" /> Next Sunday
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-800 p-3 rounded-xl text-center min-w-[64px] border border-zinc-700">
              <span className="block text-[10px] font-black uppercase text-zinc-500">Oct</span>
              <span className="block text-xl font-black text-white">27</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">The Path of Grace</h4>
              <p className="text-xs text-zinc-500">Main Sanctuary • 10:30 AM</p>
            </div>
            <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] transition-all">
              Attend
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}