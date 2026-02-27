
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  User, 
  Languages, 
  Loader2, 
  Bookmark, 
  FileText, 
  Send, 
  Settings2, 
  Minus, 
  Plus, 
  Sparkles, 
  Volume2, 
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { ScrollArea } from '@/components/ui/scroll-area';

type Version = {
  id: string;
  name: string;
  lang: string;
};

const BIBLE_VERSIONS: Version[] = [
  { id: 'IRV_HIN', name: 'Hindi (IRV)', lang: 'hi-IN' },
  { id: 'KJV', name: 'English (KJV)', lang: 'en-US' },
  { id: 'YLT', name: 'English (YLT)', lang: 'en-US' },
  { id: 'BBE', name: 'English (BBE)', lang: 'en-US' },
  { id: 'IRV_MAR', name: 'Marathi (IRV)', lang: 'mr-IN' },
];

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [version, setVersion] = useState<string>('IRV_HIN');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'index' | 'reader'>('index');
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Load preferences
  useEffect(() => {
    const savedLang = localStorage.getItem('bible_version') || 'IRV_HIN';
    const savedSize = localStorage.getItem('bible_font_size');
    setVersion(savedLang);
    if (savedSize) setFontSize(parseInt(savedSize));
  }, []);

  const handleVersionChange = (newVer: string) => {
    setVersion(newVer);
    localStorage.setItem('bible_version', newVer);
    if (selectedBook) fetchBibleContent(selectedBook.id, 1, newVer);
  };

  const handleFontSizeChange = (val: number) => {
    setFontSize(val);
    localStorage.setItem('bible_font_size', val.toString());
  };

  const fetchBibleContent = useCallback(async (bookId: number, chapter: number, verOverride?: string) => {
    const targetVer = verOverride || version;
    setLoading(true);
    try {
      const res = await fetch(`https://bolls.life/get-text/${targetVer}/${bookId}/${chapter}/`);
      const data = await res.json();
      setCurrentContent(data);
      setView('reader');
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Vachan load karne mein dikkat hui.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [version, toast]);

  const handleSpeak = (text: string, langCode: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
    toast({ title: "Audio Playing", description: "Vachan suniye..." });
  };

  const handleExplainAI = async (verse: any) => {
    setAiLoading(verse.pk);
    setAiResponse(null);
    try {
      const response = await aiScriptureQuestion({
        passage: `${selectedBook?.name} ${verse.verse}`,
        question: `Please explain this verse simply in ${version.includes('HIN') ? 'Hindi' : 'English'}: "${verse.text}"`
      });
      setAiResponse(response.answer);
    } catch (e) {
      toast({ title: "AI Error", description: "Gemini se connect nahi ho paya.", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const handleBookmark = async (verse: any) => {
    if (!user || !firestore) {
      toast({ title: "Register required", description: "Kripya register karein bookmark save karne ke liye." });
      return;
    }
    const bookmarkId = `${version}_${selectedBook?.id}_${verse.verse}`;
    const ref = doc(firestore, 'users', user.uid, 'bookmarks', bookmarkId);
    
    setDoc(ref, {
      userId: user.uid,
      verseId: bookmarkId,
      verseText: verse.text,
      bookName: selectedBook?.name,
      chapter: 1,
      verseNumber: verse.verse,
      translation: version,
      createdAt: serverTimestamp()
    }, { merge: true });

    toast({ title: "Vachan Saved", description: "Aapke bookmarks mein joda gaya." });
  };

  const bollsBooks = [
    { name: "Genesis", id: 1, short: "Ge", chapters: 50 },
    { name: "Exodus", id: 2, short: "Ex", chapters: 40 },
    { name: "Psalms", id: 19, short: "Ps", chapters: 150 },
    { name: "Proverbs", id: 20, short: "Pr", chapters: 31 },
    { name: "Matthew", id: 40, short: "Mt", chapters: 28 },
    { name: "John", id: 43, short: "Jn", chapters: 21 },
    { name: "Romans", id: 45, short: "Ro", chapters: 16 },
    { name: "Revelation", id: 66, short: "Re", chapters: 22 },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-40">
      {/* World Class Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-emerald-500/10">
        <div className="flex items-center p-5 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-500/20">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold tracking-tight italic text-white leading-none">Divine Reader</h2>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1.5">World Class Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full hover:bg-emerald-500/5 transition-all">Register</button>
            <div className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Version Selector */}
        <div className="px-5 pb-5 max-w-2xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          {BIBLE_VERSIONS.map((ver) => (
            <button
              key={ver.id}
              onClick={() => handleVersionChange(ver.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                version === ver.id 
                  ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {ver.name}
            </button>
          ))}
          {view === 'reader' && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn("p-2.5 rounded-xl border shrink-0 transition-all ml-auto", showSettings ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-zinc-900/50 border-zinc-800 text-zinc-500")}
            >
              <Settings2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Font Settings Overlay */}
        {showSettings && view === 'reader' && (
          <div className="px-5 pb-5 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
            <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-[2.5rem] space-y-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Text Size Control</span>
                <span className="text-emerald-500">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Minus className="w-4 h-4 text-zinc-600" />
                <Slider value={[fontSize]} onValueChange={(val) => handleFontSizeChange(val[0])} min={14} max={36} step={1} className="flex-1" />
                <Plus className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-8">
        {view === 'index' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {bollsBooks.map((book) => (
              <div 
                key={book.id} 
                onClick={() => { setSelectedBook(book); fetchBibleContent(book.id, 1); }}
                className="group bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-emerald-500/40 cursor-pointer transition-all shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98] overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-serif text-3xl font-bold border border-emerald-500/20 shadow-inner">{book.short}</div>
                    <div className="size-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-white font-serif italic tracking-tight">{book.name}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-3">{book.chapters} Chapters Available</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button 
              onClick={() => setView('index')} 
              className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Change Book
            </button>
            
            <div className="space-y-3">
              <h1 className="text-5xl font-serif font-bold italic text-white tracking-tighter">{selectedBook?.name} <span className="text-emerald-500">Ch. 1</span></h1>
              <div className="h-1.5 w-20 bg-emerald-500 rounded-full opacity-40"></div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center py-32 gap-6 opacity-50">
                <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 font-serif italic text-xl animate-pulse">Summoning Scripture...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {currentContent?.map((v: any) => (
                  <div key={v.pk} className="group relative border-b border-white/5 pb-10 last:border-none">
                    <p style={{ fontSize: `${fontSize}px` }} className="leading-[1.9] text-zinc-200 font-serif transition-all duration-300">
                      <span className="text-emerald-500/40 font-black text-[0.6em] align-top mr-4">#{v.verse}</span>
                      {v.text}
                    </p>
                    
                    {/* Verse Toolbelt */}
                    <div className="flex items-center gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                      <button 
                        onClick={() => handleBookmark(v)} 
                        title="Bookmark"
                        className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all shadow-xl"
                      >
                        <Bookmark className="w-4.5 h-4.5" />
                      </button>
                      
                      <button 
                        onClick={() => handleSpeak(v.text, BIBLE_VERSIONS.find(b => b.id === version)?.lang || 'en-US')}
                        title="Speak"
                        className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all shadow-xl"
                      >
                        <Volume2 className="w-4.5 h-4.5" />
                      </button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            onClick={() => handleExplainAI(v)}
                            title="AI Insight"
                            className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 hover:bg-emerald-500/20 transition-all shadow-xl"
                          >
                            <Sparkles className="w-4.5 h-4.5" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] max-w-md w-[92%] p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                          <DialogHeader>
                            <DialogTitle className="font-serif italic text-2xl text-emerald-500 flex items-center gap-3">
                              <Sparkles className="w-6 h-6" /> AI Scholar Insight
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 mt-6">
                            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5">
                              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-3">Scripture Context</p>
                              <p className="text-sm text-zinc-300 italic font-serif leading-relaxed">"{v.text}"</p>
                            </div>
                            
                            <ScrollArea className="max-h-[300px] pr-4">
                              {aiLoading === v.pk ? (
                                <div className="flex flex-col items-center py-10 gap-4 opacity-40">
                                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Consulting Wisdom...</p>
                                </div>
                              ) : (
                                <div className="text-zinc-200 text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                                  {aiResponse || "No insight available."}
                                </div>
                              )}
                            </ScrollArea>
                            
                            <Button 
                              onClick={() => {
                                navigator.clipboard.writeText(aiResponse || "");
                                toast({ title: "Copied", description: "Insight copied to clipboard." });
                              }}
                              className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-7 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <Copy className="w-4 h-4 mr-3" /> Copy Wisdom
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            title="Add Note"
                            className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all shadow-xl"
                          >
                            <FileText className="w-4.5 h-4.5" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#09090b] border-zinc-800 rounded-[2.5rem] p-8 max-w-md w-[92%]">
                          <DialogHeader>
                            <DialogTitle className="font-serif italic text-2xl text-emerald-500">Study Journal</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 mt-6">
                            <Textarea 
                              placeholder="What is the Word speaking to you today?"
                              className="bg-zinc-900 border-zinc-800 rounded-2xl min-h-[160px] focus:ring-emerald-500/20 text-sm p-5 leading-relaxed"
                            />
                            <Button className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-7 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                              <Send className="w-4 h-4 mr-3" /> Save Reflection
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

