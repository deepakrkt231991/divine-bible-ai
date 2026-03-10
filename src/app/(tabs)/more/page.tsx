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
  Check,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- BIBLE LANGUAGES (11+ Languages) ---
const BIBLE_LANGUAGES = [
  { code: 'hin', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', file: 'hin-hindi-osis.json' },
  { code: 'eng', name: 'English', native: 'English', flag: '🇬🇧', file: 'eng-web-osis.json' },
  { code: 'spa', name: 'Spanish', native: 'Español', flag: '🇪🇸', file: 'spa-rvr1909.json' },
  { code: 'fre', name: 'French', native: 'Français', flag: '🇫🇷', file: 'fre-lsg.json' },
  { code: 'ger', name: 'German', native: 'Deutsch', flag: '🇩🇪', file: 'ger-schl2000.json' },
  { code: 'por', name: 'Portuguese', native: 'Português', flag: '🇵🇹', file: 'por-almeida.json' },
  { code: 'tam', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', file: 'tam-irv.json' },
  { code: 'tel', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', file: 'tel-irv.json' },
  { code: 'mar', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', file: 'mar-irv.json' },
  { code: 'ara', name: 'Arabic', native: 'العربية', flag: '🇸🇦', file: 'ara-arabic-osis.json' },
  { code: 'heb', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', file: 'heb-hebrew-osis.json' },
];

export default function MorePage() {
  const { toast } = useToast();
  const [selectedLang, setSelectedLang] = useState('hin');
  const [showAllLangs, setShowAllLangs] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') || 'hin';
    setSelectedLang(savedLang);
  }, []);

  const handleLangSelect = (newLang: string) => {
    setSelectedLang(newLang);
    localStorage.setItem('bible_language', newLang);
    const lang = BIBLE_LANGUAGES.find(l => l.code === newLang);
    toast({ 
      title: "✅ Language Updated", 
      description: `Bible set to ${lang?.name} ${lang?.native ? `(${lang.native})` : ''}`,
      variant: "default"
    });
  };

  // Visible languages (first 5 + show more toggle)
  const visibleLangs = showAllLangs ? BIBLE_LANGUAGES : BIBLE_LANGUAGES.slice(0, 5);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0f0f1a] text-zinc-100">
      
      {/* === TOP HEADER WITH LOGO === */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 bg-[#0f0f1a]/95 backdrop-blur-xl border-b border-blue-500/20">
        
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 size-3 bg-amber-400 rounded-full border-2 border-[#0f0f1a] animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Divine Bible AI
            </h1>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Community Edition</p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link href="/register">
            <button className="text-[9px] font-black uppercase tracking-widest text-blue-400 px-3 py-1.5 border border-blue-500/30 rounded-full hover:bg-blue-500/10 transition-all">
              Join
            </button>
          </Link>
          <Link href="/community" className="flex items-center justify-center size-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <User className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="px-4 md:px-6 max-w-2xl mx-auto w-full space-y-10 py-6 pb-24">
        
        {/* === APP LANGUAGE SECTION === */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="font-serif text-lg font-semibold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Bible Languages
              </h2>
            </div>
            {BIBLE_LANGUAGES.length > 5 && (
              <button 
                onClick={() => setShowAllLangs(!showAllLangs)}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-medium"
              >
                {showAllLangs ? 'Show Less' : `+${BIBLE_LANGUAGES.length - 5} More`}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visibleLangs.map((item) => (
              <button
                key={item.code}
                onClick={() => handleLangSelect(item.code)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all relative group overflow-hidden",
                  selectedLang === item.code 
                    ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/10" 
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-purple-500/40 hover:bg-zinc-900 shadow-md"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.flag}</span>
                  <div>
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    {item.native && (
                      <p className="text-[9px] text-zinc-500 font-serif">{item.native}</p>
                    )}
                  </div>
                </div>
                {selectedLang === item.code && (
                  <div className="absolute top-3 right-3">
                    <Check className="w-4 h-4 text-amber-400" />
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedLang === item.code ? 'from-blue-500/5 to-purple-500/5' : ''}`} />
              </button>
            ))}
          </div>
        </section>

        {/* === AI CREATION TOOLS === */}
        <section>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="font-serif text-lg font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI Creation Tools
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* AI Image Generator - Large Card */}
            <Link href="/ai/image" className="relative group overflow-hidden rounded-3xl aspect-[21/9] border border-zinc-800 cursor-pointer shadow-2xl block">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1491841573634-6993d8bf9989?q=80&w=1200")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/60 to-transparent" />
              <div className="absolute inset-0 p-5 flex items-end">
                <div className="z-10 w-full flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-amber-400" />
                      AI Image Generator
                    </h3>
                    <p className="text-zinc-300 text-xs mt-1.5 font-serif italic opacity-90">Create sacred visual meditations</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Voice & Video - Small Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => toast({ title: "🔜 Coming Soon", description: "AI Voice narration is being prepared with multi-language support." })} 
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-purple-500/20">
                  <Mic className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Voice</h3>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mt-1">Multi-language Narration</p>
                </div>
              </div>
              
              <div 
                onClick={() => toast({ title: "🔜 Coming Soon", description: "AI Video reflections feature is in development." })} 
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="size-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-all border border-pink-500/20">
                  <Video className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">AI Video</h3>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mt-1">Visual Reflections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === BIBLE STUDY TOOLS === */}
        <section>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="font-serif text-lg font-semibold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Bible Study Tools
            </h2>
          </div>
          
          <div className="space-y-3">
            <Link href="/quiz" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900 hover:border-amber-500/40 transition-all cursor-pointer group shadow-md">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                </div>
                <span className="font-bold text-base">Bible Quiz</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-all" />
            </Link>

            <Link href="/plans" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900 hover:border-amber-500/40 transition-all cursor-pointer group shadow-md">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <span className="font-bold text-base">Reading Plans</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-all" />
            </Link>

            <Link href="/community" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900 hover:border-amber-500/40 transition-all cursor-pointer group shadow-md">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                  <Bookmark className="w-5 h-5 text-amber-400" />
                </div>
                <span className="font-bold text-base">Saved Verses</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-all" />
            </Link>
          </div>
        </section>

        {/* === COMMUNITY & PERSONAL === */}
        <section>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <HeartHandshake className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-serif text-lg font-semibold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Community & Personal
            </h2>
          </div>
          
          <div className="space-y-3">
            <Link href="/community" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900 hover:border-blue-500/40 transition-all cursor-pointer group shadow-md">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                  <HeartHandshake className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-bold text-base">Prayer Community</span>
              </div>
              <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-500/20">Live</div>
            </Link>

            <Link href="/community/notes" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900 hover:border-blue-500/40 transition-all cursor-pointer group shadow-md">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-bold text-base">My Notes</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-all" />
            </Link>

            <Link href="/community/settings" className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:bg-zinc-900 hover:border-blue-500/40 transition-all cursor-pointer group shadow-md">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-bold text-base">Community Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-all" />
            </Link>
          </div>
        </section>

        {/* === FOOTER === */}
        <div className="mt-12 text-center pb-24 border-t border-zinc-800/50 pt-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="size-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em]">Divine Bible AI</span>
          </div>
          <p className="text-zinc-600 text-[9px] font-medium">v2.4.0 • Community Edition</p>
          <p className="text-zinc-700 text-sm mt-4 italic font-serif bg-gradient-to-r from-amber-200/80 to-orange-200/80 bg-clip-text text-transparent">
            "Thy word is a lamp unto my feet"
          </p>
          <p className="text-zinc-700 text-xs mt-1 font-serif">— Psalm 119:105</p>
        </div>
      </div>
    </div>
  );
}