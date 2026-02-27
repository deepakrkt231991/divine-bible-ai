'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Loader2, 
  Bookmark, 
  Sparkles, 
  Volume2, 
  X,
  Share2,
  Layers,
  Search,
  Settings2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { smartBibleSearch } from '@/ai/flows/smart-bible-search';

const BIBLE_BOOKS = [
  { id: 1, name: "Genesis", hindi: "Utpatti", chapters: 50, canon: "standard", section: "Old Testament" },
  { id: 2, name: "Exodus", hindi: "Nirgaman", chapters: 40, canon: "standard", section: "Old Testament" },
  { id: 3, name: "Leviticus", hindi: "Levyavyavastha", chapters: 27, canon: "standard", section: "Old Testament" },
  { id: 4, name: "Numbers", hindi: "Ganna", chapters: 36, canon: "standard", section: "Old Testament" },
  { id: 5, name: "Deuteronomy", hindi: "Vyavastha", chapters: 34, canon: "standard", section: "Old Testament" },
  { id: 19, name: "Psalms", hindi: "Bhajan Sanhita", chapters: 150, canon: "standard", section: "Old Testament" },
  { id: 40, name: "Matthew", hindi: "Matti", chapters: 28, canon: "standard", section: "New Testament" },
  { id: 43, name: "John", hindi: "Yuhanna", chapters: 21, canon: "standard", section: "New Testament" },
  { id: 66, name: "Revelation", hindi: "Prakashitvakya", chapters: 22, canon: "standard", section: "New Testament" },
  { id: 67, name: "Tobit", hindi: "Tobit", chapters: 14, canon: "full", section: "Deuterocanonical" },
  { id: 68, name: "Judith", hindi: "Judith", chapters: 16, canon: "full", section: "Deuterocanonical" },
  { id: 71, name: "Sirach", hindi: "Sirach", chapters: 51, canon: "full", section: "Deuterocanonical" },
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
  
  const [state, setState] = useState({
    translation: 'IRV_HIN',
    bookId: 43,
    chapter: 1,
    selectedVerse: null as any,
    canon: 'standard' as 'standard' | 'full',
    globalSearch: '',
    isSearchOpen: false
  });

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'search_history'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore, user]);
  const { data: searchHistory } = useCollection(historyQuery);

  const currentBook = useMemo(() => BIBLE_BOOKS.find(b => b.id === state.bookId) || BIBLE_BOOKS[0], [state.bookId]);

  const filteredBooksByCanon = useMemo(() => {
    return state.canon === 'standard' ? BIBLE_BOOKS.filter(b => b.canon === 'standard') : BIBLE_BOOKS;
  }, [state.canon]);

  useEffect(() => {
    const savedVer = localStorage.getItem('bible_version') || 'IRV_HIN';
    const savedSize = localStorage.getItem('bible_font_size');
    const savedBook = localStorage.getItem('bible_book_id');
    const savedChapter = localStorage.getItem('bible_chapter');
    
    setState(prev => ({
      ...prev,
      translation: savedVer,
      bookId: savedBook ? parseInt(savedBook) : 43,
      chapter: savedChapter ? parseInt(savedChapter) : 1
    }));
    if (savedSize) setFontSize(parseInt(savedSize));
  }, []);

  const fetchBibleContent = useCallback(async (bId: number, chap: number, trans: string) => {
    setLoading(true);
    setVerses([]);
    try {
      const b = parseInt(bId.toString()) || 1;
      const c = parseInt(chap.toString()) || 1;
      const t = trans || 'IRV_HIN';

      const url = `https://bolls.life/get-chapter/${t}/${b}/${c}/`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("API Connection Error");
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        toast({ title: "Content Unavailable", description: "Ye chapter abhi available nahi hai." });
        setVerses([]);
      } else {
        setVerses(data);
        localStorage.setItem('bible_book_id', b.toString());
        localStorage.setItem('bible_chapter', c.toString());
        localStorage.setItem('bible_version', t);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
      toast({ 
        title: "Error", 
        description: "Vachan load nahi ho paye. Try again button click karein.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBibleContent(state.bookId, state.chapter, state.translation);
  }, [state.bookId, state.chapter, state.translation, fetchBibleContent]);

  const handleGlobalSearch = async () => {
    if (!state.globalSearch.trim()) return;
    setAiSearchLoading(true);
    setSearchResults([]);
    setAiSuggestions([]);
    
    if (user && firestore) {
      addDoc(collection(firestore, 'users', user.uid, 'search_history'), {
        query: state.globalSearch,
        createdAt: serverTimestamp(),
        userId: user.uid
      });
    }

    try {
      const searchUrl = `https://bolls.life/search/${state.translation}/?search=${encodeURIComponent(state.globalSearch)}&match_case=false`;
      const response = await fetch(searchUrl);
      const results = await response.json();
      setSearchResults(results.slice(0, 20));

      const aiResults = await smartBibleSearch({ query: state.globalSearch });
      setAiSuggestions(aiResults.suggestedVerses);
    } catch (e) {
      toast({ title: "Search Error", variant: "destructive" });
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = BIBLE_VERSIONS.find(v => v.id === state.translation)?.lang || 'hi-IN';
    utterance.lang = lang;
    utterance.onend = () => setIsAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsAudioPlaying(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#09090b]">
      {/* Top Header */}
      <header className="flex-none bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input 
                value={state.globalSearch}
                onChange={(e) => setState(prev => ({ ...prev, globalSearch: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                onFocus={() => setState(prev => ({ ...prev, isSearchOpen: true }))}
                placeholder="Dukh mein shanti, Love, or verse..."
                className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-12 text-sm focus-visible:ring-emerald-500/20"
              />
              {state.isSearchOpen && (
                <button onClick={() => setState(prev => ({ ...prev, isSearchOpen: false }))} className="absolute right-4 top-1/2 -translate-y-1/2">
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
              <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-2xl w-[95%] p-0 overflow-hidden shadow-2xl">
                 <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/50">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="font-serif italic text-2xl text-emerald-500">Bible Selector</DialogTitle>
                      <button 
                        onClick={() => setState(prev => ({ ...prev, canon: prev.canon === 'standard' ? 'full' : 'standard' }))}
                        className={cn("px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all", state.canon === 'full' ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400")}
                      >
                        {state.canon === 'standard' ? 'Standard (66)' : 'Full (81)'}
                      </button>
                    </div>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredBooksByCanon.map(book => (
                        <button key={book.id} onClick={() => setState(prev => ({ ...prev, bookId: book.id, chapter: 1, isSearchOpen: false }))} className={cn("p-4 rounded-2xl border text-left transition-all", state.bookId === book.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400")}>
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
      </header>

      {/* Main Content Area (Fixed with pb-32/120px) */}
      <main className="flex-1 overflow-y-auto px-6 py-10 pb-[120px] scroll-smooth hide-scrollbar relative">
        {state.isSearchOpen && (
          <div className="absolute inset-0 bg-[#09090b] z-30 p-6 space-y-8 animate-in slide-in-from-top-4 overflow-y-auto">
            {aiSearchLoading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Smart Search in progress...</p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-8">
                {aiSuggestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Sparkles className="w-3 h-3" /> AI Smart Suggestions</h3>
                    {aiSuggestions.map((s, i) => (
                      <div key={i} className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <span className="text-xs font-bold text-emerald-500 block mb-1">{s.reference}</span>
                        <p className="text-sm text-zinc-300 font-serif italic">"{s.context}"</p>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.map((res, i) => (
                  <div key={i} onClick={() => setState(prev => ({ ...prev, bookId: res.book, chapter: res.chapter, isSearchOpen: false }))} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500/40 cursor-pointer">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">{res.book_name} {res.chapter}:{res.verse}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed font-serif line-clamp-3">"{res.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-32 gap-6 opacity-40">
            <RefreshCw className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-emerald-500 font-serif italic text-xl animate-pulse">Vachan load ho rahe hain...</p>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <p className="text-zinc-500 italic font-serif text-lg">Vachan nahi mile. Check internet or version.</p>
            <Button variant="outline" onClick={() => fetchBibleContent(state.bookId, state.chapter, state.translation)} className="border-emerald-500/30 text-emerald-500">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-serif font-bold italic text-white">{currentBook.name} {state.chapter}</h1>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{currentBook.hindi} • {state.translation}</p>
            </div>

            <div className="space-y-8">
              {verses.map(v => (
                <div 
                  key={v.pk} 
                  onClick={() => setState(prev => ({ ...prev, selectedVerse: v }))}
                  className={cn("verse-row group relative", state.selectedVerse?.pk === v.pk && "highlight-emerald")}
                >
                  <p style={{ fontSize: `${fontSize}px` }} className="leading-[1.9] text-zinc-200 font-serif">
                    <span className="text-emerald-500 font-bold mr-3">{v.verse}</span>
                    <span className="text-slate-200">{v.text}</span>
                  </p>
                  {state.selectedVerse?.pk === v.pk && (
                    <div className="flex items-center gap-2 mt-6 animate-in slide-in-from-top-2">
                      <button className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 transition-all shadow-xl"><Bookmark className="w-4 h-4" /></button>
                      <button onClick={() => handleSpeak(v.text)} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 shadow-xl"><Volume2 className="w-4 h-4" /></button>
                      <button className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 shadow-xl"><Share2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {state.chapter < currentBook.chapters && (
              <button 
                onClick={() => {
                  setState(prev => ({ ...prev, chapter: prev.chapter + 1, selectedVerse: null }));
                  window.scrollTo(0,0);
                }}
                className="w-full py-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] flex items-center justify-center gap-4 text-emerald-500 hover:bg-emerald-500/10 transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Next: Chapter {state.chapter + 1}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Settings FAB */}
      <div className="fixed bottom-24 right-6 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <button className="size-14 rounded-full bg-emerald-500 text-black shadow-2xl flex items-center justify-center active:scale-90 transition-all glow-primary">
              <Settings2 className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 rounded-[2.5rem] p-8">
            <DialogHeader><DialogTitle className="font-serif italic text-emerald-500">Reading Settings</DialogTitle></DialogHeader>
            <div className="space-y-8 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase"><span>Font Size</span><span>{fontSize}px</span></div>
                <Slider value={[fontSize]} onValueChange={(val) => { setFontSize(val[0]); localStorage.setItem('bible_font_size', val[0].toString()); }} min={14} max={32} step={1} />
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase">Translation</span>
                <div className="grid grid-cols-1 gap-2">
                  {BIBLE_VERSIONS.map(v => (
                    <button key={v.id} onClick={() => setState(prev => ({ ...prev, translation: v.id }))} className={cn("p-4 rounded-xl border text-left text-xs font-bold transition-all", state.translation === v.id ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-400")}>{v.name}</button>
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