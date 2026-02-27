
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic">More Resources</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
            Register
          </button>
          <Link href="/profile" className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 md:px-8 max-w-2xl mx-auto w-full space-y-10 py-8">
        {/* Language Selection Quick Access */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Languages className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-lg font-semibold italic text-emerald-500">App Language</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'IRV_HIN', label: 'Hindi', sub: 'IRV Translation' },
              { id: 'KJV', label: 'English', sub: 'KJV Translation' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleLangSelect(item.id)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all relative group overflow-hidden",
                  lang === item.id 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/30"
                )}
              >
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{item.label}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">{item.sub}</p>
                  </div>
                  {lang === item.id && <Check className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* AI Creation Tools Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-lg font-semibold italic text-emerald-500">AI Creation Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Link href="/ai" className="relative group overflow-hidden rounded-[2rem] aspect-[21/9] border border-zinc-800 cursor-pointer shadow-2xl block">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1755150427184-5707e795f22e?q=80&w=1080")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex items-end">
                <div className="z-10 w-full flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-xl">AI Image Generator</h3>
                    <p className="text-zinc-300 text-xs mt-1">Create sacred visual meditations</p>
                  </div>
                  <div className="bg-emerald-500 text-black p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => toast({ title: "Coming Soon", description: "AI Voice narration is being prepared." })} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex flex-col gap-4 hover:border-emerald-500/40 transition-all cursor-pointer group">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <Mic className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Voice</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">Narration</p>
                </div>
              </div>
              <div onClick={() => toast({ title: "Coming Soon", description: "AI Video reflections feature is in development." })} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex flex-col gap-4 hover:border-emerald-500/40 transition-all cursor-pointer group">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <Video className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Video</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">Reflections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bible Study & Engagement */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-lg font-semibold italic text-emerald-500">Bible Study</h2>
          </div>
          <div className="space-y-3">
            <Link href="/quiz" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group block">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Bible Quiz</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>

            <Link href="/plans" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group block">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Bible Reading Plans</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>

            <Link href="/profile" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group block">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Saved Bookmarks</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>
          </div>
        </section>

        {/* Community & Personal */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <HeartHandshake className="w-5 h-5 text-emerald-500" />
            <h2 className="font-serif text-lg font-semibold italic text-emerald-500">Community & Personal</h2>
          </div>
          <div className="space-y-3">
            <Link href="/community" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group block">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Prayer Requests</span>
              </div>
              <div className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Active Feed</div>
            </Link>

            <Link href="/profile" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group block">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Personal Notes</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>

            <Link href="/profile" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group block">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm">Profile Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </Link>
          </div>
        </section>

        <div className="mt-12 text-center pb-8 border-t border-zinc-800/50 pt-10">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Divine Compass v2.4.0</p>
          <p className="text-zinc-700 text-xs mt-3 italic font-serif">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
