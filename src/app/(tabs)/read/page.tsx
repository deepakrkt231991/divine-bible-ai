
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Search,
  History,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, limit, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { smartBibleSearch } from '@/ai/flows/smart-bible-search';
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
    bookSearch: '',
    globalSearch: '',
    isSearchOpen: false
  });

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Search State
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Fetch search history
  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'search_history'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore, user]);
  const { data: searchHistory } = useCollection(historyQuery);

  const currentBook = useMemo(() => BIBLE_BOOKS.find(b => b.id === state.bookId), [state.bookId]);

  const filteredBooksByCanon = useMemo(() => {
    if (state.canon === 'standard') {
      return BIBLE_BOOKS.filter(b => b.canon === 'standard');
    }
    return BIBLE_BOOKS;
  }, [state.canon]);

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
      toast({ title: "Kitab Uplabdh Nahi Hai", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBibleContent(state.bookId, state.chapter, state.translation);
  }, [state.bookId, state.chapter, state.translation, fetchBibleContent]);

  const handleGlobalSearch = async () => {
    if (!state.globalSearch.trim()) return;
    setLoading(true);
    setSearchResults([]);
    setAiSuggestions([]);
    
    // Save to history
    if (user && firestore) {
      addDoc(collection(firestore, 'users', user.uid, 'search_history'), {
        query: state.globalSearch,
        createdAt: serverTimestamp(),
        userId: user.uid
      });
    }

    try {
      // 1. Try Bolls.life Keyword Search
      const searchUrl = `https://bolls.life/search/${state.translation}/?search=${encodeURIComponent(state.globalSearch)}&match_case=false`;
      const response = await fetch(searchUrl);
      const results = await response.json();
      setSearchResults(results.slice(0, 20));

      // 2. Trigger AI Smart Search for Context
      setAiSearchLoading(true);
      const aiResults = await smartBibleSearch({ query: state.globalSearch });
      setAiSuggestions(aiResults.suggestedVerses);
    } catch (e) {
      console.error(e);
      toast({ title: "Search Error", variant: "destructive" });
    } finally {
      setLoading(false);
      setAiSearchLoading(false);
    }
  };

  const goToVerse = (bookId: number, chapter: number) => {
    setState(prev => ({ ...prev, bookId, chapter, isSearchOpen: false }));
    fetchBibleContent(bookId, chapter, state.translation);
  };

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

  const handleBookmark = async (v: any) => {
    if (!user) {
      toast({ title: "Sign In Required" });
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
    toast({ title: "Verse Bookmarked" });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Sticky Smart Search Bar */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <Input 
                value={state.globalSearch}
                onChange={(e) => setState(prev => ({ ...prev, globalSearch: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                onFocus={() => setState(prev => ({ ...prev, isSearchOpen: true }))}
                placeholder="Dukh mein shanti, Love, or verse..."
                className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-12 text-sm focus:ring-emerald-500/20"
              />
              {state.isSearchOpen && (
                <button 
                  onClick={() => setState(prev => ({ ...prev, isSearchOpen: false }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              )}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="bg-emerald-500/10 text-emerald-500 rounded-2xl h-12 px-4 border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              {/* Book Selector UI (Restored from previous turn) */}
              <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl">
                 <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/50">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <DialogTitle className="font-serif italic text-2xl text-emerald-500">Bible Selector</DialogTitle>
                        <button 
                          onClick={() => setState(prev => ({ ...prev, canon: prev.canon === 'standard' ? 'full' : 'standard' }))}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
                            state.canon === 'full' ? "bg-emerald-500 text-black border-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                          )}
                        >
                          <Layers className="w-4 h-4" />
                          {state.canon === 'standard' ? 'Standard (66)' : 'Full (81)'}
                        </button>
                      </div>
                    </div>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredBooksByCanon.map(book => (
                        <button 
                          key={book.id} 
                          onClick={() => goToVerse(book.id, 1)}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all",
                            state.bookId === book.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                          )}
                        >
                          <span className="text-xs font-bold font-serif">{book.name}</span>
                          <span className="block text-[8px] opacity-60 uppercase">{book.section}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Results Overlay */}
        {state.isSearchOpen && (
          <div className="absolute top-full left-0 w-full h-[80vh] bg-[#09090b] border-t border-white/5 overflow-y-auto animate-in slide-in-from-top-4 pb-20">
            <div className="max-w-2xl mx-auto p-6 space-y-8">
              {/* Recent History */}
              {!state.globalSearch && searchHistory && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <History className="w-3 h-3" /> Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((h) => (
                      <button 
                        key={h.id} 
                        onClick={() => setState(prev => ({ ...prev, globalSearch: h.query }))}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-emerald-500"
                      >
                        {h.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Smart Insights */}
              {aiSearchLoading ? (
                <div className="flex items-center gap-3 py-6 bg-emerald-500/5 rounded-2xl px-6 border border-emerald-500/10">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500">AI Scholar is meditating...</p>
                </div>
              ) : aiSuggestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI Smart Recommendations
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {aiSuggestions.map((s, i) => (
                      <div key={i} className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-500">{s.reference}</span>
                          <button 
                            onClick={() => {
                              // Custom logic to parse reference or just navigate
                              toast({ title: "Navigating to: " + s.reference });
                            }}
                            className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:underline"
                          >
                            Read More
                          </button>
                        </div>
                        <p className="text-sm text-zinc-300 font-serif italic">"{s.context}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Search Results</h3>
                  <div className="space-y-4">
                    {searchResults.map((res, i) => (
                      <div 
                        key={i} 
                        onClick={() => goToVerse(res.book, res.chapter)}
                        className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl group hover:border-emerald-500/40 transition-all cursor-pointer"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">{res.book_name} {res.chapter}:{res.verse}</p>
                        <p className="text-sm text-zinc-300 leading-relaxed font-serif line-clamp-3">"{res.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Reader View */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 pb-48">
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-6 opacity-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl animate-pulse">Vachan load ho raha hai...</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-serif font-bold italic text-white">{currentBook?.name} {state.chapter}</h1>
              <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                <span>{currentBook?.hindi}</span>
                <span className="size-1 rounded-full bg-zinc-800" />
                <span>{BIBLE_VERSIONS.find(v => v.id === state.translation)?.name}</span>
              </div>
            </div>

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
                    <button onClick={(e) => { e.stopPropagation(); handleBookmark(v); }} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 transition-all"><Bookmark className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); /* AI Logic here */ }} className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500"><Sparkles className="w-4 h-4" /></button>
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

      {/* Fixed Settings Controls (Typography) */}
      <div className="fixed bottom-24 right-6 z-40">
        <Dialog>
          <DialogTrigger asChild>
            <button className="size-14 rounded-full bg-emerald-500 text-black shadow-2xl flex items-center justify-center active:scale-90 transition-all">
              <Settings2 className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="font-serif italic text-emerald-500">Typography Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Font Size</span>
                  <span className="text-emerald-500">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-4">
                  <Minus className="w-4 h-4 text-zinc-600" />
                  <Slider 
                    value={[fontSize]} 
                    onValueChange={(val) => {
                      setFontSize(val[0]);
                      localStorage.setItem('bible_font_size', val[0].toString());
                    }} 
                    min={14} 
                    max={32} 
                    step={1} 
                    className="flex-1"
                  />
                  <Plus className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Translations</span>
                <div className="grid grid-cols-1 gap-2">
                  {BIBLE_VERSIONS.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setState(prev => ({ ...prev, translation: v.id }))}
                      className={cn(
                        "p-4 rounded-xl border text-left text-xs font-bold transition-all",
                        state.translation === v.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
