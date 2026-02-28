'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Mic, 
  Video, 
  HelpCircle, 
  Calendar, 
  Bookmark, 
  HeartHandshake, 
  FileText, 
  Settings, 
  ChevronRight, 
  ArrowRight,
  User,
  LayoutGrid,
  Languages,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MorePage() {
  const { toast } = useToast();
  const [lang, setLang] = useState('IRV_HIN');

  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') || 'IRV_HIN';
    setLang(savedLang);
  }, []);

  const handleLangSelect = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('bible_language', newLang);
    toast({ 
      title: "Language Updated", 
      description: `Bible translation set to ${newLang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}.` 
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-zinc-950/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">More Resources</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/register">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
          </Link>
          <Link href="/profile" className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <div className="px-5 md:px-8 max-w-2xl mx-auto w-full space-y-12 py-10">
        {/* Language Selection */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <Languages className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-xl font-semibold italic text-white">App Language</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'IRV_HIN', label: 'Hindi', sub: 'IRV Translation' },
              { id: 'KJV', label: 'English', sub: 'KJV Translation' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleLangSelect(item.id)}
                className={cn(
                  "p-6 rounded-[1.5rem] border text-left transition-all relative group overflow-hidden",
                  lang === item.id 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/30 shadow-xl"
                )}
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base">{item.label}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-2">{item.sub}</p>
                  </div>
                  {lang === item.id && <Check className="w-5 h-5" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* AI Creation Tools Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-xl font-semibold italic text-white">AI Creation Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            <Link href="/ai" className="relative group overflow-hidden rounded-[2.5rem] aspect-[21/9] border border-zinc-800 cursor-pointer shadow-2xl block">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1755150427184-5707e795f22e?q=80&w=1080")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex items-end">
                <div className="z-10 w-full flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-2xl">AI Image Generator</h3>
                    <p className="text-zinc-300 text-xs mt-2 font-serif italic">Create sacred visual meditations</p>
                  </div>
                  <div className="bg-emerald-500 text-black p-4 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-5">
              <div onClick={() => toast({ title: "Coming Soon", description: "AI Voice narration is being prepared." })} className="bg-zinc-900 border border-zinc-800 rounded-[1.75rem] p-8 flex flex-col gap-6 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-2xl">
                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-emerald-500/10">
                  <Mic className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Voice</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-2">Narration</p>
                </div>
              </div>
              <div onClick={() => toast({ title: "Coming Soon", description: "AI Video reflections feature is in development." })} className="bg-zinc-900 border border-zinc-800 rounded-[1.75rem] p-8 flex flex-col gap-6 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-2xl">
                <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-emerald-500/10">
                  <Video className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Video</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-2">Reflections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bible Study & Engagement */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-xl font-semibold italic text-white">Bible Study</h2>
          </div>
          <div className="space-y-4">
            <Link href="/quiz" className="bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-zinc-900 transition-all cursor-pointer group block shadow-xl">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <HelpCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-base">Bible Quiz</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>

            <Link href="/plans" className="bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-zinc-900 transition-all cursor-pointer group block shadow-xl">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-base">Bible Reading Plans</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>

            <Link href="/profile" className="bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-zinc-900 transition-all cursor-pointer group block shadow-xl">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Bookmark className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-base">Saved Bookmarks</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>
          </div>
        </section>

        {/* Community & Personal */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <HeartHandshake className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-xl font-semibold italic text-white">Community & Personal</h2>
          </div>
          <div className="space-y-4">
            <Link href="/community" className="bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-zinc-900 transition-all cursor-pointer group block shadow-xl">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <HeartHandshake className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-base">Prayer Requests</span>
              </div>
              <div className="bg-emerald-500/20 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active Feed</div>
            </Link>

            <Link href="/profile" className="bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-zinc-900 transition-all cursor-pointer group block shadow-xl">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-base">Personal Notes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>

            <Link href="/profile" className="bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between hover:bg-zinc-900 transition-all cursor-pointer group block shadow-xl">
              <div className="flex items-center gap-5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Settings className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="font-bold text-base">Profile Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>
          </div>
        </section>

        <div className="mt-16 text-center pb-20 border-t border-zinc-800/50 pt-12">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Divine Compass v2.4.0</p>
          <p className="text-zinc-700 text-sm mt-4 italic font-serif">"Thy word is a lamp unto my feet"</p>
        </div>
      </div>
    </div>
  );
}
