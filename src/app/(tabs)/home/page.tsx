"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  BookOpen, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  CalendarDays, 
  ChevronRight,
  HandHeart,
  Bell,
  UserCircle
} from "lucide-react";
import { getSingleVerse } from "@/lib/youversion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BibleHomePage() {
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const verseBg = PlaceHolderImages.find(img => img.id === 'verse-bg');
  const kidsImg = PlaceHolderImages.find(img => img.id === 'kids-ministry');
  const youthImg = PlaceHolderImages.find(img => img.id === 'youth-ministry');

  useEffect(() => {
    const fetchVOTD = async () => {
      try {
        const data = await getSingleVerse("3034", "JER.29.11");
        setDailyVerse(data);
      } catch (error) {
        setDailyVerse({
          reference: "Jeremiah 29:11",
          content: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVOTD();
  }, []);

  return (
    <div className="min-h-screen bg-background text-zinc-100 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Divine Compass</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center overflow-hidden">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Verse of the Day Card */}
        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-emerald-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <Card className="relative bg-zinc-900 border-white/5 rounded-[2rem] overflow-hidden shadow-2xl border-none">
            <div className="h-48 relative">
              {verseBg && (
                <Image 
                  src={verseBg.imageUrl} 
                  alt={verseBg.description}
                  fill
                  className="object-cover"
                  data-ai-hint={verseBg.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                  Verse of the Day
                </span>
              </div>
            </div>
            <div className="p-8 -mt-12 relative z-10 text-center space-y-6">
              {loading ? (
                <div className="space-y-4 flex flex-col items-center">
                  <Skeleton className="h-8 w-full bg-white/5" />
                  <Skeleton className="h-8 w-2/3 bg-white/5" />
                  <Skeleton className="h-4 w-1/3 bg-white/5" />
                </div>
              ) : (
                <>
                  <h2 className="font-serif italic text-2xl md:text-3xl leading-relaxed text-zinc-100">
                    "{dailyVerse?.content?.replace(/<[^>]*>?/gm, '') || dailyVerse?.content}"
                  </h2>
                  <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs">
                    — {dailyVerse?.reference}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-emerald-400 text-zinc-950 font-bold rounded-full transition-all active:scale-95 text-sm">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-100 font-bold rounded-full transition-all text-sm">
                      <Bookmark className="w-4 h-4" /> Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/read" className="block">
            <Card className="bg-zinc-900 p-5 rounded-3xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-1">Daily Reading</h3>
              <p className="text-zinc-500 text-xs">Psalm 23-25</p>
            </Card>
          </Link>
          <Link href="/ai" className="block">
            <Card className="bg-zinc-900 p-5 rounded-3xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-1">AI Guide</h3>
              <p className="text-zinc-500 text-xs">Ask anything</p>
            </Card>
          </Link>
        </section>

        {/* Ministries */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight font-serif italic">Ministries</h2>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kids Ministry */}
            <div className="relative group h-48 rounded-[2rem] overflow-hidden cursor-pointer border border-white/5">
              {kidsImg && (
                <Image 
                  src={kidsImg.imageUrl} 
                  alt={kidsImg.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={kidsImg.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
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
            <div className="relative group h-48 rounded-[2rem] overflow-hidden cursor-pointer border border-white/5">
              {youthImg && (
                <Image 
                  src={youthImg.imageUrl} 
                  alt={youthImg.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={youthImg.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
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
        <section className="bg-zinc-900 rounded-[2.5rem] border border-white/5 p-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 font-serif italic">
            <CalendarDays className="w-5 h-5 text-primary" />
            Next Sunday
          </h2>
          <div className="flex items-center gap-6">
            <div className="bg-primary/10 p-4 rounded-3xl text-center min-w-[72px] border border-primary/20">
              <span className="block text-[10px] font-black uppercase text-primary tracking-widest">Oct</span>
              <span className="block text-2xl font-black text-white">27</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg leading-tight mb-1">The Path of Grace</h4>
              <p className="text-sm text-zinc-500">Main Sanctuary • 10:30 AM</p>
            </div>
            <button className="bg-primary hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95">
              Attend
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}