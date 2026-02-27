
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  User, 
  Loader2, 
  Bookmark, 
  FileText, 
  Settings2, 
  Minus, 
  Plus, 
  Sparkles, 
  Volume2, 
  ChevronDown,
  Play,
  Pause,
  ArrowRight,
  X,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';

// 66 Books Mapping for Bolls.life
const BIBLE_BOOKS = [
  { id: 1, name: "Genesis", chapters: 50 }, { id: 2, name: "Exodus", chapters: 40 },
  { id: 3, name: "Leviticus", chapters: 27 }, { id: 4, name: "Numbers", chapters: 36 },
  { id: 5, name: "Deuteronomy", chapters: 34 }, { id: 6, name: "Joshua", chapters: 24 },
  { id: 7, name: "Judges", chapters: 21 }, { id: 8, name: "Ruth", chapters: 4 },
  { id: 9, name: "1 Samuel", chapters: 31 }, { id: 10, name: "2 Samuel", chapters: 24 },
  { id: 11, name: "1 Kings", chapters: 22 }, { id: 12, name: "2 Kings", chapters: 25 },
  { id: 13, name: "1 Chronicles", chapters: 29 }, { id: 14, name: "2 Chronicles", chapters: 36 },
  { id: 15, name: "Ezra", chapters: 10 }, { id: 16, name: "Nehemiah", chapters: 13 },
  { id: 17, name: "Esther", chapters: 10 }, { id: 18, name: "Job", chapters: 42 },
  { id: 19, name: "Psalms", chapters: 150 }, { id: 20, name: "Proverbs", chapters: 31 },
  { id: 21, name: "Ecclesiastes", chapters: 12 }, { id: 22, name: "Song of Solomon", chapters: 8 },
  { id: 23, name: "Isaiah", chapters: 66 }, { id: 24, name: "Jeremiah", chapters: 52 },
  { id: 25, name: "Lamentations", chapters: 5 }, { id: 26, name: "Ezekiel", chapters: 48 },
  { id: 27, name: "Daniel", chapters: 12 }, { id: 28, name: "Hosea", chapters: 14 },
  { id: 29, name: "Joel", chapters: 3 }, { id: 30, name: "Amos", chapters: 9 },
  { id: 31, name: "Obadiah", chapters: 1 }, { id: 32, name: "Jonah", chapters: 4 },
  { id: 33, name: "Micah", chapters: 7 }, { id: 34, name: "Nahum", chapters: 3 },
  { id: 35, name: "Habakkuk", chapters: 3 }, { id: 36, name: "Zephaniah", chapters: 3 },
  { id: 37, name: "Haggai", chapters: 2 }, { id: 38, name: "Zechariah", chapters: 14 },
  { id: 39, name: "Malachi", chapters: 4 }, { id: 40, name: "Matthew", chapters: 28 },
  { id: 41, name: "Mark", chapters: 16 }, { id: 42, name: "Luke", chapters: 24 },
  { id: 43, name: "John", chapters: 21 }, { id: 44, name: "Acts", chapters: 28 },
  { id: 45, name: "Romans", chapters: 16 }, { id: 46, name: "1 Corinthians", chapters: 16 },
  { id: 47, name: "2 Corinthians", chapters: 13 }, { id: 48, name: "Galatians", chapters: 6 },
  { id: 49, name: "Ephesians", chapters: 6 }, { id: 50, name: "Philippians", chapters: 4 },
  { id: 51, name: "Colossians", chapters: 4 }, { id: 52, name: "1 Thessalonians", chapters: 5 },
  { id: 53, name: "2 Thessalonians", chapters: 3 }, { id: 54, name: "1 Timothy", chapters: 6 },
  { id: 55, name: "2 Timothy", chapters: 4 }, { id: 56, name: "Titus", chapters: 3 },
  { id: 57, name: "Philemon", chapters: 1 }, { id: 58, name: "Hebrews", chapters: 13 },
  { id: 59, name: "James", chapters: 5 }, { id: 60, name: "1 Peter", chapters: 5 },
  { id: 61, name: "2 Peter", chapters: 3 }, { id: 62, name: "1 John", chapters: 5 },
  { id: 63, name: "2 John", chapters: 1 }, { id: 64, name: "3 John", chapters: 1 },
  { id: 65, name: "Jude", chapters: 1 }, { id: 66, name: "Revelation", chapters: 22 }
];

const BIBLE_VERSIONS = [
  { id: 'IRV_HIN', name: 'Hindi (IRV)', lang: 'hi-IN' },
  { id: 'KJV', name: 'English (KJV)', lang: 'en-US' },
  { id: 'IRV_MAR', name: 'Marathi (IRV)', lang: 'mr-IN' },
];

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  // Bible Engine State
  const [state, setState] = useState({
    translation: 'IRV_HIN',
    bookId: 43, // Default: John
    chapter: 1,
    selectedVerse: null as any
  });

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // AI Insight State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const currentBook = useMemo(() => BIBLE_BOOKS.find(b => b.id === state.bookId), [state.bookId]);

  // Load Preferences
  useEffect(() => {
    const savedVer = localStorage.getItem('bible_version') || 'IRV_HIN';
    const savedSize = localStorage.getItem('bible_font_size');
    const savedBook = localStorage.getItem('bible_book_id');
    const savedChapter = localStorage.getItem('bible_chapter');

    setState(prev => ({
      ...prev,
      translation: savedVer,
      bookId: savedBook ? parseInt(savedBook) : prev.bookId,
      chapter: savedChapter ? parseInt(savedChapter) : prev.chapter
    }));

    if (savedSize) setFontSize(parseInt(savedSize));
  }, []);

  const fetchBibleContent = useCallback(async (bId: number, chap: number, trans: string) => {
    setLoading(true);
    setVerses([]);
    try {
      const url = `https://bolls.life/get-chapter/${trans}/${bId}/${chap}/`;
      const response = await fetch(url);
      const data = await response.json();
      setVerses(data);
      
      // Persist navigation
      localStorage.setItem('bible_book_id', bId.toString());
      localStorage.setItem('bible_chapter', chap.toString());
      localStorage.setItem('bible_version', trans);
    } catch (e) {
      toast({ title: "Connection Error", description: "Vachan load karne mein dikkat hui.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBibleContent(state.bookId, state.chapter, state.translation);
  }, [state.bookId, state.chapter, state.translation, fetchBibleContent]);

  const handleSpeak = (text: string) => {
    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = BIBLE_VERSIONS.find(v => v.id === state.translation)?.lang || 'en-US';
    utterance.lang = lang;
    utterance.onend = () => setIsAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsAudioPlaying(true);
  };

  const handleExplainAI = async (verse: any) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await aiScriptureQuestion({
        passage: `${currentBook?.name} ${state.chapter}:${verse.verse}`,
        question: `Please explain this verse simply: "${verse.text}"`
      });
      setAiResponse(res.answer);
    } catch (e) {
      toast({ title: "AI Error", description: "Gemini connection failed." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleBookmark = async (v: any) => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please register to save bookmarks." });
      return;
    }
    const bId = `${state.translation}_${state.bookId}_${state.chapter}_${v.verse}`;
    const ref = doc(firestore, 'users', user.uid, 'bookmarks', bId);
    
    setDoc(ref, {
      userId: user.uid,
      verseId: bId,
      verseText: v.text,
      bookName: currentBook?.name,
      chapter: state.chapter,
      verseNumber: v.verse,
      translation: state.translation,
      createdAt: serverTimestamp()
    }, { merge: true });

    toast({ title: "Verse Bookmarked", description: "Saved to your library." });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* World Class Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center p-5 justify-between max-w-2xl mx-auto">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-3 group">
                <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-serif font-bold italic text-white flex items-center gap-2">
                    {currentBook?.name} {state.chapter} <ChevronDown className="w-4 h-4 text-emerald-500" />
                  </h2>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em]">Bible Engine V2</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/50">
                <DialogTitle className="font-serif italic text-2xl text-emerald-500 flex items-center gap-3">
                  <BookOpen className="w-6 h-6" /> Select Book & Chapter
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BIBLE_BOOKS.map(book => (
                    <div key={book.id} className="space-y-2">
                      <button 
                        onClick={() => setState(prev => ({ ...prev, bookId: book.id, chapter: 1 }))}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-left transition-all",
                          state.bookId === book.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/40"
                        )}
                      >
                        <span className="text-xs font-bold font-serif">{book.name}</span>
                      </button>
                      {state.bookId === book.id && (
                        <div className="grid grid-cols-4 gap-2 px-1">
                          {Array.from({ length: Math.min(book.chapters, 12) }).map((_, i) => (
                            <DialogClose key={i} asChild>
                              <button 
                                onClick={() => setState(prev => ({ ...prev, chapter: i + 1 }))}
                                className={cn(
                                  "size-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all",
                                  state.chapter === i + 1 ? "bg-emerald-500 text-black border-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                                )}
                              >
                                {i + 1}
                              </button>
                            </DialogClose>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn("p-2.5 rounded-xl border transition-all", showSettings ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400")}
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <div className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Controls */}
        <div className="px-5 pb-5 max-w-2xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          {BIBLE_VERSIONS.map(ver => (
            <button
              key={ver.id}
              onClick={() => setState(prev => ({ ...prev, translation: ver.id }))}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                state.translation === ver.id 
                  ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
              )}
            >
              {ver.name}
            </button>
          ))}
        </div>

        {/* Font Settings */}
        {showSettings && (
          <div className="px-5 pb-5 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
            <div className="bg-zinc-900/95 border border-zinc-800 p-6 rounded-[2.5rem] space-y-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Font Size Control</span>
                <span className="text-emerald-500">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Minus className="w-4 h-4 text-zinc-600" />
                <Slider value={[fontSize]} onValueChange={(v) => { setFontSize(v[0]); localStorage.setItem('bible_font_size', v[0].toString()); }} min={14} max={36} step={1} className="flex-1" />
                <Plus className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Reader Content */}
      <main className="flex-1 max-w-2xl mx-auto px-6 pt-10 pb-48">
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-6 opacity-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl animate-pulse">Summoning Pavitra Vachan...</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {verses.map(v => (
              <div 
                key={v.pk} 
                onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                className={cn(
                  "group relative pb-8 border-b border-white/5 last:border-none transition-all duration-300",
                  state.selectedVerse?.pk === v.pk && "bg-emerald-500/5 -mx-4 px-4 rounded-xl"
                )}
              >
                <p style={{ fontSize: `${fontSize}px` }} className="leading-[1.9] text-zinc-200 font-serif">
                  <span className="text-emerald-500/40 font-black text-[0.6em] align-top mr-4">#{v.verse}</span>
                  {v.text}
                </p>
                
                {/* Selection Toolbar (Inline) */}
                {state.selectedVerse?.pk === v.pk && (
                  <div className="flex items-center gap-2 mt-6 animate-in slide-in-from-top-2 duration-300">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleBookmark(v); }}
                      className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all shadow-xl"
                    >
                      <Bookmark className="w-4.5 h-4.5" />
                    </button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleExplainAI(v); }}
                          className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 hover:bg-emerald-500/20 transition-all shadow-xl"
                        >
                          <Sparkles className="w-4.5 h-4.5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] p-8 max-w-md w-[92%]">
                        <DialogHeader>
                          <DialogTitle className="font-serif italic text-2xl text-emerald-500 flex items-center gap-3">
                            <Sparkles className="w-6 h-6" /> AI Insight
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] mt-6 text-zinc-200 leading-relaxed whitespace-pre-wrap">
                          {aiLoading ? (
                            <div className="flex flex-col items-center py-10 gap-4 opacity-40">
                              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Consulting Wisdom...</p>
                            </div>
                          ) : aiResponse || "Insight available on click."}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSpeak(v.text); }}
                      className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all shadow-xl"
                    >
                      <Volume2 className="w-4.5 h-4.5" />
                    </button>

                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(v.text);
                        toast({ title: "Copied!", description: "Verse text copied to clipboard." });
                      }}
                      className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all shadow-xl"
                    >
                      <Share2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Next Chapter Button */}
            {currentBook && state.chapter < currentBook.chapters && (
              <button 
                onClick={() => setState(prev => ({ ...prev, chapter: prev.chapter + 1, selectedVerse: null }))}
                className="w-full py-6 bg-zinc-900/50 border border-white/5 rounded-[2rem] flex items-center justify-center gap-4 text-emerald-500 hover:bg-emerald-500/10 transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Next: Chapter {state.chapter + 1}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Fixed Audio Sync Panel (Footer) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-bottom-8 duration-700">
        <div className="bg-[#121214]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
              <Volume2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{currentBook?.name} {state.chapter}</h4>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">Audio Bible Active</p>
            </div>
          </div>
          <button 
            onClick={() => handleSpeak(verses.map(v => v.text).join(' '))}
            className="size-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-90 transition-all"
          >
            {isAudioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-black" />}
          </button>
        </div>
      </div>
    </div>
  );
}
