
'use client';

import React from 'react';
import { Compass, Share2, Bookmark, BookOpen, Calendar, User, Sparkles, ArrowRight, Heart, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function BibleHomePage() {
  const { firestore } = useFirebase();
  const verseText = "Main hamesha tumhare saath hoon, sansar ke anth tak.";
  const verseRef = "Matthew 28:20";
  const aiImageUrl = `https://pollinations.ai/p/${encodeURIComponent("biblical scene jesus christ with disciples at dawn oil painting cinematic")}?width=1080&height=1920&model=flux`;

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
            <Compass className="w-5 h-5 text-emerald-500" />
          </div>
          <h1 className="text-lg font-bold tracking-tight font-serif italic text-white">Divine Compass</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center justify-center size-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <User className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Live Prayer Circle Widget */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Live Prayer Circle</h3>
            <Link href="/community" className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest hover:underline">Join Now</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recentPrayers?.map((prayer, i) => (
              <div key={prayer.id} className="flex-shrink-0 flex flex-col items-center gap-2 w-16 group cursor-pointer">
                <div className={cn(
                  "size-14 rounded-full p-1 border-2 transition-all duration-500",
                  prayer.amenCount > 10 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" : "border-white/10"
                )}>
                  <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-emerald-500 font-bold text-lg border border-white/5">
                    {prayer.isAnonymous ? '?' : prayer.userName?.[0] || 'U'}
                  </div>
                </div>
                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest truncate w-full text-center">
                  {prayer.isAnonymous ? 'Seeker' : prayer.userName?.split(' ')[0]}
                </span>
              </div>
            ))}
            {/* Call to Action Circle */}
            <Link href="/community" className="flex-shrink-0 flex flex-col items-center gap-2 w-16">
              <div className="size-14 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 hover:border-emerald-500/50 hover:text-emerald-500 transition-all">
                <span className="material-symbols-outlined text-xl">add</span>
              </div>
              <span className="text-[8px] text-zinc-700 font-black uppercase">Pray</span>
            </Link>
          </div>
        </section>

        {/* Verse Card */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-emerald-500/10 rounded-[2.5rem] blur-xl opacity-20 transition duration-1000 group-hover:opacity-40"></div>
          <div className="relative bg-[#121214] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="h-72 relative">
              <Image src={aiImageUrl} alt="Verse Image" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/60 to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">Aaj Ka Vachan</span>
              </div>
            </div>
            <div className="p-8 -mt-16 relative z-10 text-center space-y-4">
              <h2 className="font-serif italic text-xl md:text-2xl leading-relaxed text-zinc-100">"{verseText}"</h2>
              <p className="text-emerald-500 font-black tracking-[0.2em] uppercase text-[10px]">— {verseRef}</p>
              <div className="flex items-center justify-center gap-3 pt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[9px] rounded-full transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                  <Play className="w-3 h-3 fill-black" /> Listen
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-black uppercase tracking-widest text-[9px] rounded-full border border-white/5">
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/read" className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="size-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-base">Read Bible</h3>
            <p className="text-zinc-600 text-[9px] uppercase font-black tracking-widest mt-1">81 Books Ready</p>
          </Link>
          <Link href="/ai" className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="size-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-base">AI Scholar</h3>
            <p className="text-zinc-600 text-[9px] uppercase font-black tracking-widest mt-1">Ask Any Question</p>
          </Link>
        </section>

        {/* Community Card */}
        <section className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-40"></div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Global Prayer Chain</p>
            <h2 className="text-2xl font-serif italic font-bold">"Praying for one another is our greatest strength."</h2>
            <Link href="/community" className="inline-block mt-4">
              <button className="bg-emerald-500 text-black px-10 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                Share Request
              </button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
