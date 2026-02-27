
'use client';

import React from 'react';
import { Bell, Compass, Share2, Bookmark, BookOpen, HeartHandshake, ChevronRight, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BibleHomePage() {
  const verseBg = PlaceHolderImages.find(img => img.id === 'verse-bg');
  const kidsImg = PlaceHolderImages.find(img => img.id === 'kids-ministry');
  const youthImg = PlaceHolderImages.find(img => img.id === 'youth-ministry');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Divine Compass</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <Bell className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-primary" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Verse of the Day Card */}
        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-48 relative">
              {verseBg && (
                <Image 
                  src={verseBg.imageUrl} 
                  alt={verseBg.description}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Verse of the Day
                </span>
              </div>
            </div>
            <div className="p-8 -mt-12 relative z-10 text-center space-y-6">
              <h2 className="font-serif italic text-2xl md:text-3xl leading-relaxed text-zinc-100">
                "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
              </h2>
              <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
                — Jeremiah 29:11
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-emerald-400 text-zinc-950 font-bold rounded-full transition-all active:scale-95 text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-full transition-all text-sm">
                  <Bookmark className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Daily Reading</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Psalm 23-25</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <HeartHandshake className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-1">Prayer List</h3>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">4 new requests</p>
          </div>
        </section>

        {/* Ministries */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight font-serif italic">Ministries</h2>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kids Ministry */}
            <div className="relative group h-48 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800">
              {kidsImg && (
                <Image 
                  src={kidsImg.imageUrl} 
                  alt={kidsImg.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Kids Ministry</h3>
                  <p className="text-zinc-400 text-xs">Sunday School & Activities</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            {/* Youth Ministry */}
            <div className="relative group h-48 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800">
              {youthImg && (
                <Image 
                  src={youthImg.imageUrl} 
                  alt={youthImg.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Youth Group</h3>
                  <p className="text-zinc-400 text-xs">Ages 13-18 • Friday Nights</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
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
