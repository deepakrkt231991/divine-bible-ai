
'use client';

import React from 'react';
import { Compass, Share2, Bookmark, BookOpen, HeartHandshake, ChevronRight, Calendar, User, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function BibleHomePage() {
  // AI Image generation from Pollinations.ai for the Daily Verse
  const verseText = "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.";
  const verseRef = "Jeremiah 29:11";
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent("Biblical oil painting of Jeremiah 29:11 plans to prosper and hope, cinematic lighting, 4k, sacred art")}?width=1080&height=1080&nologo=true`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32 selection:bg-emerald-500/30">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic">Divine Compass</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-emerald-400 transition-colors px-3 py-1.5 border border-primary/30 rounded-full">
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
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
                <span className="px-3 py-1 bg-primary text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> AI Verse of the Day
                </span>
              </div>
            </div>
            <div className="p-8 -mt-12 relative z-10 text-center space-y-6">
              <h2 className="font-serif italic text-2xl md:text-3xl leading-relaxed text-zinc-100">
                "{verseText}"
              </h2>
              <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
                — {verseRef}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-emerald-400 text-zinc-950 font-bold rounded-full transition-all active:scale-95 text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <Link href="/quiz">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-full transition-all text-sm border border-emerald-500/20">
                    <Sparkles className="w-4 h-4 text-primary" /> Start Quiz
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/read" className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Bible Reading</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Psalm 23-25</p>
          </Link>
          <Link href="/ai" className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">AI Chat</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Ask Chaplain</p>
          </Link>
        </section>

        {/* Ministries */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight font-serif italic text-primary">Continue Reading</h2>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View Progress</button>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-zinc-800 flex items-center justify-center text-primary font-serif text-xl font-bold">
              Ge
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-zinc-100">Genesis 12: God's Call</h4>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '45%' }}></div>
              </div>
            </div>
            <Link href="/read">
              <button className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2 rounded-lg font-bold text-sm transition-all border border-primary/20">
                Resume
              </button>
            </Link>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-3 font-serif italic text-primary">
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
            <button className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 border border-primary/20">
              Attend
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
