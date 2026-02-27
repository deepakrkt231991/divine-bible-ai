
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
  Share2,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import Link from 'next/link';

// 81 Books Complete List (Bolls.life IDs)
const BIBLE_BOOKS = [
  // Old Testament (1-39)
  { id: 1, name: "Genesis", hindi: "Utpatti", chapters: 50, canon: "standard", section: "Old Testament" },
  { id: 2, name: "Exodus", hindi: "Nirgaman", chapters: 40, canon: "standard", section: "Old Testament" },
  { id: 3, name: "Leviticus", hindi: "Levyavyavastha", chapters: 27, canon: "standard", section: "Old Testament" },
  { id: 4, name: "Numbers", hindi: "Ganna", chapters: 36, canon: "standard", section: "Old Testament" },
  { id: 5, name: "Deuteronomy", hindi: " व्यवस्था", chapters: 34, canon: "standard", section: "Old Testament" },
  { id: 6, name: "Joshua", hindi: "Yahoshu", chapters: 24, canon: "standard", section: "Old Testament" },
  { id: 7, name: "Judges", hindi: "Nyayi", chapters: 21, canon: "standard", section: "Old Testament" },
  { id: 8, name: "Ruth", hindi: "Rut", chapters: 4, canon: "standard", section: "Old Testament" },
  { id: 9, name: "1 Samuel", hindi: "1 Samuel", chapters: 31, canon: "standard", section: "Old Testament" },
  { id: 10, name: "2 Samuel", hindi: "2 Samuel", chapters: 24, canon: "standard", section: "Old Testament" },
  { id: 11, name: "1 Kings", hindi: "1 Raja", chapters: 22, canon: "standard", section: "Old Testament" },
  { id: 12, name: "2 Kings", hindi: "2 Raja", chapters: 25, canon: "standard", section: "Old Testament" },
  { id: 13, name: "1 Chronicles", hindi: "1 Itihas", chapters: 29, canon: "standard", section: "Old Testament" },
  { id: 14, name: "2 Chronicles", hindi: "2 Itihas", chapters: 36, canon: "standard", section: "Old Testament" },
  { id: 15, name: "Ezra", hindi: "Ezra", chapters: 10, canon: "standard", section: "Old Testament" },
  { id: 16, name: "Nehemiah", hindi: "Nehemiah", chapters: 13, canon: "standard", section: "Old Testament" },
  { id: 17, name: "Esther", hindi: "Esther", chapters: 10, canon: "standard", section: "Old Testament" },
  { id: 18, name: "Job", hindi: "Ayub", chapters: 42, canon: "standard", section: "Old Testament" },
  { id: 19, name: "Psalms", hindi: "Bhajan Sanhita", chapters: 150, canon: "standard", section: "Old Testament" },
  { id: 20, name: "Proverbs", hindi: "Nitivachan", chapters: 31, canon: "standard", section: "Old Testament" },
  { id: 21, name: "Ecclesiastes", hindi: "Sabhopadeshak", chapters: 12, canon: "standard", section: "Old Testament" },
  { id: 22, name: "Song of Solomon", hindi: "Shresthgitan", chapters: 8, canon: "standard", section: "Old Testament" },
  { id: 23, name: "Isaiah", hindi: "Yashayah", chapters: 66, canon: "standard", section: "Old Testament" },
  { id: 24, name: "Jeremiah", hindi: "Yirmayah", chapters: 52, canon: "standard", section: "Old Testament" },
  { id: 25, name: "Lamentations", hindi: "Vilapgit", chapters: 5, canon: "standard", section: "Old Testament" },
  { id: 26, name: "Ezekiel", hindi: "Yehezkel", chapters: 48, canon: "standard", section: "Old Testament" },
  { id: 27, name: "Daniel", hindi: "Daniel", chapters: 12, canon: "standard", section: "Old Testament" },
  { id: 28, name: "Hosea", hindi: "Hosea", chapters: 14, canon: "standard", section: "Old Testament" },
  { id: 29, name: "Joel", hindi: "Yoel", chapters: 3, canon: "standard", section: "Old Testament" },
  { id: 30, name: "Amos", hindi: "Amos", chapters: 9, canon: "standard", section: "Old Testament" },
  { id: 31, name: "Obadiah", hindi: "Obadiah", chapters: 1, canon: "standard", section: "Old Testament" },
  { id: 32, name: "Jonah", hindi: "Yona", chapters: 4, canon: "standard", section: "Old Testament" },
  { id: 33, name: "Micah", hindi: "Micah", chapters: 7, canon: "standard", section: "Old Testament" },
  { id: 34, name: "Nahum", hindi: "Nahum", chapters: 3, canon: "standard", section: "Old Testament" },
  { id: 35, name: "Habakkuk", hindi: "Habakkuk", chapters: 3, canon: "standard", section: "Old Testament" },
  { id: 36, name: "Zephaniah", hindi: "Zephaniah", chapters: 3, canon: "standard", section: "Old Testament" },
  { id: 37, name: "Haggai", hindi: "Haggai", chapters: 2, canon: "standard", section: "Old Testament" },
  { id: 38, name: "Zechariah", hindi: "Zechariah", chapters: 14, canon: "standard", section: "Old Testament" },
  { id: 39, name: "Malachi", hindi: "Malachi", chapters: 4, canon: "standard", section: "Old Testament" },

  // New Testament (40-66)
  { id: 40, name: "Matthew", hindi: "Matti", chapters: 28, canon: "standard", section: "New Testament" },
  { id: 41, name: "Mark", hindi: "Markus", chapters: 16, canon: "standard", section: "New Testament" },
  { id: 42, name: "Luke", hindi: "Luka", chapters: 24, canon: "standard", section: "New Testament" },
  { id: 43, name: "John", hindi: "Yuhanna", chapters: 21, canon: "standard", section: "New Testament" },
  { id: 44, name: "Acts", hindi: "Preriton ke Kam", chapters: 28, canon: "standard", section: "New Testament" },
  { id: 45, name: "Romans", hindi: "Romiyon", chapters: 16, canon: "standard", section: "New Testament" },
  { id: 46, name: "1 Corinthians", hindi: "1 Kurinthiyon", chapters: 16, canon: "standard", section: "New Testament" },
  { id: 47, name: "2 Corinthians", hindi: "2 Kurinthiyon", chapters: 13, canon: "standard", section: "New Testament" },
  { id: 48, name: "Galatians", hindi: "Galatiyon", chapters: 6, canon: "standard", section: "New Testament" },
  { id: 49, name: "Ephesians", hindi: "Ifisiyon", chapters: 6, canon: "standard", section: "New Testament" },
  { id: 50, name: "Philippians", hindi: "Filippiyon", chapters: 4, canon: "standard", section: "New Testament" },
  { id: 51, name: "Colossians", hindi: "Kulusiyon", chapters: 4, canon: "standard", section: "New Testament" },
  { id: 52, name: "1 Thessalonians", hindi: "1 Thissalunikiyon", chapters: 5, canon: "standard", section: "New Testament" },
  { id: 53, name: "2 Thessalonians", hindi: "2 Thissalunikiyon", chapters: 3, canon: "standard", section: "New Testament" },
  { id: 54, name: "1 Timothy", hindi: "1 Timothiyus", chapters: 6, canon: "standard", section: "New Testament" },
  { id: 55, name: "2 Timothy", hindi: "2 Timothiyus", chapters: 4, canon: "standard", section: "New Testament" },
  { id: 56, name: "Titus", hindi: "Titus", chapters: 3, canon: "standard", section: "New Testament" },
  { id: 57, name: "Philemon", hindi: "Filemon", chapters: 1, canon: "standard", section: "New Testament" },
  { id: 58, name: "Hebrews", hindi: "Ibraniyon", chapters: 13, canon: "standard", section: "New Testament" },
  { id: 59, name: "James", hindi: "Yaqoob", chapters: 5, canon: "standard", section: "New Testament" },
  { id: 60, name: "1 Peter", hindi: "1 Patras", chapters: 5, canon: "standard", section: "New Testament" },
  { id: 61, name: "2 Peter", hindi: "2 Patras", chapters: 3, canon: "standard", section: "New Testament" },
  { id: 62, name: "1 John", hindi: "1 Yuhanna", chapters: 5, canon: "standard", section: "New Testament" },
  { id: 63, name: "2 John", hindi: "2 Yuhanna", chapters: 1, canon: "standard", section: "New Testament" },
  { id: 64, name: "3 John", hindi: "3 Yuhanna", chapters: 1, canon: "standard", section: "New Testament" },
  { id: 65, name: "Jude", hindi: "Yahuda", chapters: 1, canon: "standard", section: "New Testament" },
  { id: 66, name: "Revelation", hindi: "Prakashitvakya", chapters: 22, canon: "standard", section: "New Testament" },
  
  // Deuterocanonical (67-78)
  { id: 67, name: "Tobit", hindi: "Tobit", chapters: 14, canon: "full", section: "Deuterocanonical" },
  { id: 68, name: "Judith", hindi: "Judith", chapters: 16, canon: "full", section: "Deuterocanonical" },
  { id: 69, name: "Esther (Greek)", hindi: "Esther (Greeki)", chapters: 7, canon: "full", section: "Deuterocanonical" },
  { id: 70, name: "Wisdom", hindi: "Wisdom", chapters: 19, canon: "full", section: "Deuterocanonical" },
  { id: 71, name: "Sirach", hindi: "Sirach", chapters: 51, canon: "full", section: "Deuterocanonical" },
  { id: 72, name: "Baruch", hindi: "Baruch", chapters: 6, canon: "full", section: "Deuterocanonical" },
  { id: 73, name: "Letter of Jeremiah", hindi: "Yeremiah ka Patra", chapters: 1, canon: "full", section: "Deuterocanonical" },
  { id: 74, name: "Prayer of Azariah", hindi: "Azariah ki Prarthna", chapters: 1, canon: "full", section: "Deuterocanonical" },
  { id: 75, name: "Susanna", hindi: "Susanna", chapters: 1, canon: "full", section: "Deuterocanonical" },
  { id: 76, name: "Bel and the Dragon", hindi: "Bel aur Azdaha", chapters: 1, canon: "full", section: "Deuterocanonical" },
  { id: 77, name: "1 Maccabees", hindi: "1 Maccabees", chapters: 16, canon: "full", section: "Deuterocanonical" },
  { id: 78, name: "2 Maccabees", hindi: "2 Maccabees", chapters: 15, canon: "full", section: "Deuterocanonical" },

  // Orthodox Extra (79-81)
  { id: 79, name: "1 Esdras", hindi: "1 Esdras", chapters: 9, canon: "full", section: "Orthodox Extra" },
  { id: 80, name: "Prayer of Manasseh", hindi: "Manasseh ki Prarthna", chapters: 1, canon: "full", section: "Orthodox Extra" },
  { id: 81, name: "Psalm 151", hindi: "Bhajan 151", chapters: 1, canon: "full", section: "Orthodox Extra" }
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
    selectedVerse: null as any,
    canon: 'standard' as 'standard' | 'full',
    bookSearch: ''
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

  // Filtering Logic for Book Selector
  const filteredBooksByCanon = useMemo(() => {
    if (state.canon === 'standard') {
      return BIBLE_BOOKS.filter(b => b.canon === 'standard');
    }
    return BIBLE_BOOKS;
  }, [state.canon]);

  const searchedBooks = useMemo(() => {
    if (!state.bookSearch) return filteredBooksByCanon;
    const s = state.bookSearch.toLowerCase();
    return filteredBooksByCanon.filter(b => 
      b.name.toLowerCase().includes(s) || b.hindi.toLowerCase().includes(s)
    );
  }, [filteredBooksByCanon, state.bookSearch]);

  const groupedBooks = useMemo(() => {
    const groups: Record<string, typeof BIBLE_BOOKS> = {};
    searchedBooks.forEach(book => {
      if (!groups[book.section]) groups[book.section] = [];
      groups[book.section].push(book);
    });
    return groups;
  }, [searchedBooks]);

  // Load Preferences
  useEffect(() => {
    const savedVer = localStorage.getItem('bible_version') || 'IRV_HIN';
    const savedSize = localStorage.getItem('bible_font_size');
    const savedBook = localStorage.getItem('bible_book_id');
    const savedChapter = localStorage.getItem('bible_chapter');
    const savedCanon = localStorage.getItem('bible_canon') as 'standard' | 'full';

    setState(prev => ({
      ...prev,
      translation: savedVer,
      bookId: savedBook ? parseInt(savedBook) : prev.bookId,
      chapter: savedChapter ? parseInt(savedChapter) : prev.chapter,
      canon: savedCanon || 'standard'
    }));

    if (savedSize) setFontSize(parseInt(savedSize));
  }, []);

  const fetchBibleContent = useCallback(async (bId: number, chap: number, trans: string) => {
    setLoading(true);
    setVerses([]);
    try {
      const url = `https://bolls.life/get-chapter/${trans}/${bId}/${chap}/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Translation not supported.");
      const data = await response.json();
      setVerses(data);
      
      localStorage.setItem('bible_book_id', bId.toString());
      localStorage.setItem('bible_chapter', chap.toString());
      localStorage.setItem('bible_version', trans);
    } catch (e) {
      toast({ 
        title: "Kitab Uplabdh Nahi Hai", 
        description: "Ye translation is Book ID ko support nahi karti.", 
        variant: "destructive" 
      });
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

  const toggleCanon = () => {
    const newCanon = state.canon === 'standard' ? 'full' : 'standard';
    setState(prev => ({ ...prev, canon: newCanon }));
    localStorage.setItem('bible_canon', newCanon);
    toast({ 
      title: "Canon Updated", 
      description: newCanon === 'standard' ? "Standard (66) books active." : "Full (81) books active." 
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Header Panel */}
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
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em]">{state.canon === 'standard' ? '66 Books' : '81 Books'}</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/50">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="font-serif italic text-2xl text-emerald-500">Bible Selector</DialogTitle>
                    <button 
                      onClick={toggleCanon}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
                        state.canon === 'full' ? "bg-emerald-500 text-black border-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      )}
                    >
                      <Layers className="w-4 h-4" />
                      {state.canon === 'standard' ? 'Standard (66)' : 'Full (81)'}
                    </button>
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500" />
                    <Input 
                      value={state.bookSearch}
                      onChange={(e) => setState(prev => ({ ...prev, bookSearch: e.target.value }))}
                      placeholder="Search books..."
                      className="bg-zinc-950 border-zinc-800 pl-12 h-12 rounded-2xl"
                    />
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[60vh] p-6">
                <div className="space-y-8">
                  {Object.entries(groupedBooks).map(([section, books]) => (
                    <div key={section} className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 px-2">{section}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {books.map(book => (
                          <div key={book.id} className="space-y-2">
                            <button 
                              onClick={() => setState(prev => ({ ...prev, bookId: book.id, chapter: 1 }))}
                              className={cn(
                                "w-full p-4 rounded-2xl border text-left transition-all",
                                state.bookId === book.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/5" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/40"
                              )}
                            >
                              <span className="text-xs font-bold font-serif">{book.name}</span>
                              <span className="block text-[8px] opacity-60">{book.hindi}</span>
                            </button>
                            {state.bookId === book.id && (
                              <div className="grid grid-cols-4 gap-2 px-1">
                                {Array.from({ length: Math.min(book.chapters, 12) }).map((_, i) => (
                                  <DialogClose key={i} asChild>
                                    <button 
                                      onClick={() => setState(prev => ({ ...prev, chapter: i + 1 }))}
                                      className={cn(
                                        "size-8 rounded-lg flex items-center justify-center text-[10px] font-bold border",
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
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
            <Link href="/profile" className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="px-5 pb-5 max-w-2xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          {BIBLE_VERSIONS.map(ver => (
            <button
              key={ver.id}
              onClick={() => setState(prev => ({ ...prev, translation: ver.id }))}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                state.translation === ver.id ? "bg-emerald-500 border-emerald-400 text-black shadow-lg" : "bg-zinc-900 border-zinc-800 text-zinc-500"
              )}
            >
              {ver.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-6 pt-10 pb-48">
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-6 opacity-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl animate-pulse">Vachan load ho raha hai...</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
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
                
                {state.selectedVerse?.pk === v.pk && (
                  <div className="flex items-center gap-2 mt-6 animate-in slide-in-from-top-2">
                    <button onClick={(e) => { e.stopPropagation(); handleBookmark(v); }} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500"><Bookmark className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleExplainAI(v); }} className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500"><Sparkles className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleSpeak(v.text); }} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500"><Volume2 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(v.text); toast({ title: "Copied!" }); }} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500"><Share2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}

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

      {/* Fixed Audio Panel */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="bg-[#121214]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Volume2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{currentBook?.name} {state.chapter}</h4>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">Audio Bible Active</p>
            </div>
          </div>
          <button 
            onClick={() => handleSpeak(verses.map(v => v.text).join(' '))}
            className="size-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center"
          >
            {isAudioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
