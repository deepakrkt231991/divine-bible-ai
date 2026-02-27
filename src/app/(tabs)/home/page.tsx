
'use client';

import React from 'react';
import { Compass, Share2, Bookmark, BookOpen, Calendar, User, Sparkles, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function BibleHomePage() {
  const { firestore } = useFirebase();
  const verseText = "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.";
  const verseRef = "Jeremiah 29:11";
  const aiImageUrl = `https://pollinations.ai/p/${encodeURIComponent("Biblical oil painting of Jeremiah 29:11 plans to prosper and hope, cinematic lighting, 4k, sacred art")}?width=1080&height=1920&model=flux`;

  // Fetch Live Prayer Circle (Top 5 Recent)
  const prayerCircleQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'prayer_requests'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);

  const { data: recentPrayers } = useCollection(prayerCircleQuery);

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
          <Link href="/profile" className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Live Prayer Circle Widget */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Prayer Circle</h3>
            <Link href="/community" className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest hover:underline">Join All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recentPrayers?.map((prayer, i) => (
              <div key={prayer.id} className="flex-shrink-0 flex flex-col items-center gap-2 w-20 group cursor-pointer">
                <div className={cn(
                  "size-16 rounded-full p-1 border-2 transition-all duration-500",
                  prayer.amenCount > 10 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" : "border-white/10"
                )}>
                  <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-emerald-500 font-bold text-xl border border-white/5">
                    {prayer.isAnonymous ? '?' : prayer.userName?.[0] || 'U'}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest truncate w-full text-center">
                    {prayer.isAnonymous ? 'Anonymous' : prayer.userName}
                  </span>
                  <div className="px-2 py-0.5 bg-white/5 rounded-full flex items-center gap-1">
                    <span className="text-[9px] text-emerald-500">🙏 {prayer.amenCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Explore Word</p>
          </Link>
          <Link href="/ai" className="bg-zinc-900/50 p-6 rounded-[1.5rem] border border-zinc-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg">AI scholar</h3>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Ask Wise One</p>
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
