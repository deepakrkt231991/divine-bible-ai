
'use client';

import React from 'react';
import { Compass, Share2, Bookmark, BookOpen, HeartHandshake, ChevronRight, Calendar, User, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BibleHomePage() {
  const verseText = "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.";
  const verseRef = "Jeremiah 29:11";
  
  // AI Image generation from Pollinations.ai (Free & High Quality)
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent("Biblical oil painting of Jeremiah 29:11 plans to prosper and hope, cinematic lighting, 4k, sacred art, serene mountains")}?width=1080&height=1080&nologo=true`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 selection:bg-emerald-500/30">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Compass className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic">Divine Compass</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors px-3 py-1.5 border border-emerald-500/30 rounded-full">
            Register
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-100">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Verse of the Day Card */}
        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-56 relative">
              <Image 
                src={aiImageUrl} 
                alt="Daily Verse AI Image"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> AI Verse of the Day
                </span>
              </div>
            </div>
            <div className="p-8 -mt-12 relative z-10 text-center space-y-6">
              <h2 className="font-serif italic text-2xl md:text-3xl leading-relaxed text-zinc-100">
                "{verseText}"
              </h2>
              <p className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xs">
                — {verseRef}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-full transition-all active:scale-95 text-sm shadow-lg shadow-emerald-500/20">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <Link href="/quiz">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-full transition-all text-sm border border-emerald-500/20">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Start Quiz
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/read" className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg mb-1">Bible Reading</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Psalm 23-25</p>
          </Link>
          <Link href="/ai" className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg mb-1">AI Chaplain</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Ask Anything</p>
          </Link>
        </section>

        {/* Ministries Section (Permanent Design) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight font-serif italic text-emerald-500">Ministries</h2>
            <button className="text-emerald-500 text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group h-48 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600" alt="Kids Ministry" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">Kids Ministry</h3>
                <p className="text-zinc-300 text-xs">Sunday School & Activities</p>
              </div>
            </div>
            <div className="relative group h-48 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?q=80&w=600" alt="Youth Ministry" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">Youth Group</h3>
                <p className="text-zinc-300 text-xs">Ages 13-18 • Friday Nights</p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Card */}
        <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-3 font-serif italic text-emerald-500">
            <Calendar className="w-5 h-5" />
            Next Sunday
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-800 p-3 rounded-xl text-center min-w-[64px] border border-zinc-700">
              <span className="block text-[10px] font-black uppercase text-zinc-500 tracking-widest">Oct</span>
              <span className="block text-xl font-black text-white">27</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-zinc-100">The Path of Grace</h4>
              <p className="text-sm text-zinc-500">Main Sanctuary • 10:30 AM</p>
            </div>
            <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-5 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 border border-emerald-500/20">
              Attend
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
