'use client';
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Sparkles, Baby, Book, MessageCircle, Share2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { getSingleVerse } from '@/lib/youversion';
import type { Passage } from '@/types';

const BIBLE_VERSION_ID = '3034'; // ID from working cURL example
const VERSE_OF_THE_DAY_ID = 'JHN.3.16';

export default function BibleHomePage() {
  const [activeTab, setActiveTab] = useState('youth');
  const [verseOfTheDay, setVerseOfTheDay] = useState<{ reference: string; content: string } | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      setVerseLoading(true);
      if (!process.env.NEXT_PUBLIC_YOUVERSION_KEY) {
        console.warn("YouVersion API key not found. Using fallback verse.");
        setVerseOfTheDay({
          reference: "John 14:6",
          content: "Main hi maarg, satya aur jeevan hoon.",
        });
        setVerseLoading(false);
        return;
      }
      
      try {
        const passage = await getSingleVerse(BIBLE_VERSION_ID, VERSE_OF_THE_DAY_ID);

        if (!passage || !passage.content) {
          throw new Error("Failed to fetch verse: API returned invalid data.");
        }

        const plainTextContent = passage.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        const referenceText = typeof passage.reference === 'string' 
          ? passage.reference 
          : (passage.reference?.human || 'Unknown Reference');
        
        setVerseOfTheDay({
          reference: referenceText,
          content: plainTextContent,
        });
      } catch (error) {
        console.error("Failed to fetch verse of the day:", error);
        setVerseOfTheDay({
          reference: "John 14:6",
          content: "Main hi maarg, satya aur jeevan hoon.",
        });
      } finally {
        setVerseLoading(false);
      }
    };
    fetchVerse();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24 container mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-emerald-500">Divine Bible AI</h1>
          <p className="text-zinc-400 text-sm">Friend, aapka aaj ka safar...</p>
        </div>
        <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-xs text-emerald-400">
          🔥 5 Day Streak
        </div>
      </header>

      {/* Verse of the Day - Premium Card */}
      {verseLoading ? (
        <Skeleton className="h-36 w-full rounded-lg bg-zinc-800" />
      ) : (
        <Card className="bg-gradient-to-br from-emerald-900/40 to-zinc-900 border-emerald-500/30 p-6 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <Share2 className="w-5 h-5 cursor-pointer" />
          </div>
          <p className="text-emerald-400 text-xs font-medium mb-2 uppercase tracking-tighter">Vachan of the Day</p>
          <p className="text-xl font-serif leading-relaxed mb-4">
            "{verseOfTheDay?.content}"
          </p>
          <p className="text-sm text-zinc-500 italic">- {verseOfTheDay?.reference}</p>
        </Card>
      )}

      {/* Age Group Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['Kids', 'Youth', 'Scholars'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.toLowerCase() 
              ? 'bg-emerald-500 text-black' 
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            {tab === 'Kids' && <Baby className="inline w-3 h-3 mr-1" />}
            {tab === 'Youth' && <Sparkles className="inline w-3 h-3 mr-1" />}
            {tab === 'Scholars' && <Book className="inline w-3 h-3 mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Content Based on Age */}
      <div className="space-y-4">
        {activeTab === 'kids' && (
          <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
            <h3 className="font-bold text-blue-400 mb-2 text-lg">Daily Audio Drama 🎭</h3>
            <p className="text-sm text-zinc-400 mb-4">David aur Goliath ki kahani sound effects ke saath suniye!</p>
            <button className="w-full bg-blue-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
              ▶ Listen Now
            </button>
          </div>
        )}

        {activeTab === 'youth' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
            <h3 className="font-bold text-emerald-400 mb-2 text-lg">AI Spiritual Guide 🤖</h3>
            <p className="text-sm text-zinc-400 mb-4">Aapke career ya relationships se jude sawal Bible se poochein.</p>
            <div className="flex gap-2">
              <input 
                placeholder="Talk to AI..." 
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500"
              />
              <button className="bg-emerald-500 p-2 rounded-lg text-black">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scholars' && (
          <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl">
            <h3 className="font-bold text-purple-400 mb-2 text-lg">Deep Study Tool 📖</h3>
            <p className="text-sm text-zinc-400">Greek aur Hebrew meanings ke saath verses ko gehraayi se samjhein.</p>
          </div>
        )}
      </div>
    </div>
  );
}
