// src/app/(tabs)/read/page.tsx
// ✅ Complete Bible Reader UI - Matches your design

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChapter } from '@/lib/bible-loader';
import { ChevronLeft, ChevronRight, Play, Pause, Settings, Search, Home, BookOpen, Users, MoreHorizontal, Volume2 } from 'lucide-react';

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-zinc-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <ReaderContent />
    </Suspense>
  );
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const bookParam = searchParams.get('book') || 'GEN';
  const chapterParam = parseInt(searchParams.get('chapter') || '1');
  const langParam = searchParams.get('lang') || 'eng-kjv';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  
  const { verses, loading, error } = useChapter(bookParam.toLowerCase(), chapterParam, langParam);
  
  // Book display names
  const bookNames: Record<string, string> = {
    'gen': 'Genesis', 'exod': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers',
    'deut': 'Deuteronomy', 'josh': 'Joshua', 'judg': 'Judges', 'ruth': 'Ruth',
    '1sam': '1 Samuel', '2sam': '2 Samuel', '1kgs': '1 Kings', '2kgs': '2 Kings',
    '1chr': '1 Chronicles', '2chr': '2 Chronicles', 'ezra': 'Ezra', 'neh': 'Nehemiah',
    'esth': 'Esther', 'job': 'Job', 'ps': 'Psalms', 'prov': 'Proverbs',
    'eccl': 'Ecclesiastes', 'song': 'Song of Solomon', 'isa': 'Isaiah',
    'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezek': 'Ezekiel', 'dan': 'Daniel',
    'hos': 'Hosea', 'joel': 'Joel', 'amos': 'Amos', 'obad': 'Obadiah',
    'jonah': 'Jonah', 'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk',
    'zeph': 'Zephaniah', 'hag': 'Haggai', 'zech': 'Zechariah', 'mal': 'Malachi',
    'matt': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John',
    'acts': 'Acts', 'rom': 'Romans', '1cor': '1 Corinthians', '2cor': '2 Corinthians',
    'gal': 'Galatians', 'eph': 'Ephesians', 'phil': 'Philippians', 'col': 'Colossians',
    '1thess': '1 Thessalonians', '2thess': '2 Thessalonians', '1tim': '1 Timothy',
    '2tim': '2 Timothy', 'titus': 'Titus', 'phlm': 'Philemon', 'heb': 'Hebrews',
    'jas': 'James', '1pet': '1 Peter', '2pet': '2 Peter', '1john': '1 John',
    '2john': '2 John', '3john': '3 John', 'jude': 'Jude', 'rev': 'Revelation',
    'tob': 'Tobit', 'jdt': 'Judith', 'wis': 'Wisdom', 'sir': 'Sirach',
    'bar': 'Baruch', '1macc': '1 Maccabees', '2macc': '2 Maccabees'
  };
  
  const bookName = bookNames[bookParam.toLowerCase()] || bookParam;
  
  const handlePrevChapter = () => {
    if (chapterParam > 1) {
      router.push(`/read?book=${bookParam}&chapter=${chapterParam - 1}&lang=${langParam}`);
    }
  };
  
  const handleNextChapter = () => {
    router.push(`/read?book=${bookParam}&chapter=${chapterParam + 1}&lang=${langParam}`);
  };
  
  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // Add actual audio logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !verses) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Chapter not found'}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-zinc-950 rounded-full font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center bg-zinc-950/95 backdrop-blur-md p-4 border-b border-zinc-800 justify-between">
        <button className="text-slate-100 hover:text-primary transition-colors">
          <Settings className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight">
            {bookName} {chapterParam}
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
            King James Version
          </span>
        </div>
        <button className="text-slate-100 hover:text-primary transition-colors">
          <Search className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-40">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[1px] flex-1 bg-zinc-800"></div>
            <span className="text-zinc-400 text-xs font-medium tracking-widest uppercase">
              Chapter {chapterParam}
            </span>
            <div className="h-[1px] flex-1 bg-zinc-800"></div>
          </div>
          
          <div className="space-y-6 font-serif leading-relaxed text-lg lg:text-xl text-slate-200">
            {verses.map((verse: any) => (
              <p key={verse.verse}>
                <span className="text-primary font-bold text-sm align-top mr-1 font-display">
                  {verse.verse}
                </span>
                {verse.text}
              </p>
            ))}
          </div>
        </div>
      </main>

      {/* Audio Player */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full p-2 flex items-center justify-between shadow-2xl pointer-events-auto">
          <button 
            onClick={handlePrevChapter}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleAudio}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-zinc-950 shadow-lg shadow-primary/20"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-zinc-950" /> : <Play className="w-6 h-6 fill-zinc-950" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">
                Audio Bible
              </span>
              <span className="text-xs text-white font-medium">
                Listening to Ch. {chapterParam}
              </span>
            </div>
          </div>
          <button 
            onClick={handleNextChapter}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 px-4 pb-6 pt-3 z-30">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Home</p>
          </button>
          <button 
            onClick={() => router.push('/read')}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <BookOpen className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Bible</p>
          </button>
          <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <Volume2 className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Chaplain</p>
          </button>
          <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <Users className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Community</p>
          </button>
          <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">More</p>
          </button>
        </div>
      </nav>
    </div>
  );
}