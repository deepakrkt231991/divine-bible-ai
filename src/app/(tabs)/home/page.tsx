"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, MessageCircle, Share2, Play, Bookmark, Clock } from "lucide-react";
import { getSingleVerse } from "@/lib/youversion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

export default function BibleHomePage() {
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVOTD = async () => {
      try {
        const data = await getSingleVerse("3034", "JHN.3.16");
        setDailyVerse(data);
      } catch (error) {
        setDailyVerse({
          reference: "Psalm 23:1",
          content: "The Lord is my shepherd; I shall not want.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVOTD();
  }, []);

  return (
    <div className="min-h-screen bg-background text-white p-6 pb-24 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary tracking-tight">Divine Compass</h1>
          <p className="text-zinc-500 text-sm mt-1">Peace be with you, Deepak</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20 text-xs font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> 5 Day Streak
        </div>
      </header>

      {/* Daily Verse Card */}
      <Card className="glass relative overflow-hidden p-8 rounded-[2rem] border-primary/20 shadow-2xl group">
        <div className="absolute top-0 right-0 p-6 opacity-40 group-hover:opacity-100 transition-opacity">
          <Share2 className="w-5 h-5 cursor-pointer text-primary" />
        </div>
        <div className="space-y-6">
          <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Verse of the Day</span>
          
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full bg-zinc-800/50" />
              <Skeleton className="h-8 w-2/3 bg-zinc-800/50" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-2xl font-serif leading-relaxed italic text-zinc-100">
                "{dailyVerse?.content?.replace(/<[^>]*>?/gm, '') || dailyVerse?.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/30" />
                <p className="text-sm font-medium text-primary uppercase tracking-widest">{dailyVerse?.reference}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/read" className="block">
          <Card className="glass hover:bg-primary/10 transition-all p-6 rounded-3xl border-none flex flex-col items-center gap-3 group">
            <div className="p-4 bg-primary/20 rounded-2xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-sm">Bible Reading</span>
          </Card>
        </Link>
        <Link href="/ai" className="block">
          <Card className="glass hover:bg-primary/10 transition-all p-6 rounded-3xl border-none flex flex-col items-center gap-3 group">
            <div className="p-4 bg-primary/20 rounded-2xl group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-sm">AI Chat Guide</span>
          </Card>
        </Link>
      </div>

      {/* Continue Reading */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Continue Reading
          </h2>
          <span className="text-xs text-primary font-bold">View History</span>
        </div>
        
        <Card className="glass p-5 rounded-3xl border-none flex items-center gap-4 hover:bg-zinc-900/40 transition-colors">
          <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-primary">
            JHN
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">John 4:14</h3>
            <p className="text-xs text-zinc-500">Living Water - Chapter 4</p>
          </div>
          <div className="p-3 bg-primary rounded-full">
            <Play className="w-4 h-4 text-black fill-black" />
          </div>
        </Card>
      </section>

      {/* Bookmarks Quick Link */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" /> Your Bookmarks
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass min-w-[140px] p-4 rounded-3xl border-none space-y-2">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-bold">Psalm 23:4</p>
              <p className="text-[10px] text-zinc-500 line-clamp-1">Even though I walk...</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}