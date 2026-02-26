"use client";
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Sparkles, Baby, Book, MessageCircle, Share2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { getSingleVerse } from '@/lib/youversion';

export default function BibleHomePage() {
  const [activeTab, setActiveTab] = useState('youth');
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVOTD = async () => {
      try {
        // Fetching John 3:16 as the representative Verse of the Day
        const data = await getSingleVerse("3034", "JHN.3.16");
        setDailyVerse(data);
      } catch (error) {
        console.error("VOTD Error:", error);
        setDailyVerse({
          reference: "John 3:16",
          content: "Kyunki Parmeshwar ne jagat se aisa prem kiya ki usne apna eklowta Putra de diya...",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVOTD();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24 container mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-emerald-500">Divine Bible AI</h1>
          <p className="text-zinc-400 text-sm">Deepak, aapka aaj ka safar...</p>
        </div>
        <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-xs text-emerald-400">
          🔥 5 Day Streak
        </div>
      </header>

      {/* Verse of the Day - Premium Card */}
      <Card className="bg-gradient-to-br from-emerald-900/40 to-zinc-900 border-emerald-500/30 p-6 mb-8 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
          <Share2 className="w-5 h-5 cursor-pointer" />
        </div>
        <p className="text-emerald-400 text-xs font-medium mb-2 uppercase tracking-tighter">Vachan of the Day</p>
        
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full bg-zinc-800" />
            <Skeleton className="h-4 w-1/3 bg-zinc-800" />
          </div>
        ) : (
          <>
            <p className="text-xl font-serif leading-relaxed mb-4">
              "{dailyVerse?.content?.replace(/<[^>]*>?/gm, '') || dailyVerse?.content}"
            </p>
            <p className="text-sm text-zinc-500 italic">- {dailyVerse?.reference}</p>
          </>
        )}
      </Card>

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
          <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-bold text-blue-400 mb-2 text-lg">Daily Audio Drama 🎭</h3>
            <p className="text-sm text-zinc-400 mb-4">David aur Goliath ki kahani sound effects ke saath suniye!</p>
            <button className="w-full bg-blue-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/20">
              ▶ Listen Now
            </button>
          </div>
        )}

        {activeTab === 'youth' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-bold text-emerald-400 mb-2 text-lg">AI Spiritual Guide 🤖</h3>
            <p className="text-sm text-zinc-400 mb-4">Aapke career ya relationships se jude sawal Bible se poochein.</p>
            <div className="flex gap-2">
              <input 
                placeholder="Talk to AI..." 
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-emerald-500 transition-all"
              />
              <button className="bg-emerald-500 p-2 rounded-lg text-black hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scholars' && (
          <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-bold text-purple-400 mb-2 text-lg">Deep Study Tool 📖</h3>
            <p className="text-sm text-zinc-400 mb-4">Greek aur Hebrew meanings ke saath verses ko gehraayi se samjhein.</p>
            <button className="w-full bg-purple-500 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20">
              Open Dictionary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
