
'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, User, PlayCircle, Languages, Loader2, Bookmark, FileText, Send, Settings2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

type Translation = 'KJV' | 'IRV_HIN';

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [translation, setTranslation] = useState<Translation>('IRV_HIN');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'index' | 'reader'>('index');
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') as Translation;
    if (savedLang) setTranslation(savedLang);
  }, []);

  const handleLangChange = (lang: Translation) => {
    setTranslation(lang);
    localStorage.setItem('bible_language', lang);
    if (selectedBook) {
      fetchBibleContent(selectedBook.id, 1);
    }
  };

  const fetchBibleContent = async (bookId: number, chapter: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://bolls.life/get-text/${translation}/${bookId}/${chapter}/`);
      const data = await res.json();
      setCurrentContent(data);
      setView('reader');
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load scripture.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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

  const handleBookmark = async (verse: any) => {
    if (!user || !firestore) {
      toast({ title: "Register required", description: "Please register to save bookmarks." });
      return;
    }
    const bookmarkId = `${translation}_${selectedBook?.id}_${verse.verse}`;
    const ref = doc(firestore, 'users', user.uid, 'bookmarks', bookmarkId);
    
    setDoc(ref, {
      userId: user.uid,
      verseId: bookmarkId,
      verseText: verse.text,
      bookName: selectedBook?.name,
      chapter: 1,
      verseNumber: verse.verse,
      translation,
      createdAt: serverTimestamp()
    }, { merge: true });

    toast({ title: "Vachan Saved", description: "Added to your bookmarks." });
  };

  const [noteText, setNoteText] = useState('');
  const handleSaveNote = async (verse: any) => {
    if (!user || !firestore) return;
    const noteId = `${translation}_${selectedBook?.id}_${verse.verse}_note`;
    const ref = doc(firestore, 'users', user.uid, 'notes', noteId);
    
    setDoc(ref, {
      userId: user.uid,
      verseId: noteId,
      content: noteText,
      verseText: verse.text,
      bookName: selectedBook?.name,
      createdAt: serverTimestamp()
    }, { merge: true });

    setNoteText('');
    toast({ title: "Note Added", description: "Your reflection has been saved." });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center p-5 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight italic text-white">Bible Reader</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">Register</button>
            <div className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Translation Switcher */}
        <div className="px-5 pb-5 max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 flex gap-1 p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            <button 
              onClick={() => handleLangChange('IRV_HIN')}
              className={cn("flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all", translation === 'IRV_HIN' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-zinc-300")}
            >Hindi (IRV)</button>
            <button 
              onClick={() => handleLangChange('KJV')}
              className={cn("flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all", translation === 'KJV' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-zinc-300")}
            >English (KJV)</button>
          </div>
          {view === 'reader' && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn("p-2.5 rounded-xl border transition-all", showSettings ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-zinc-900/50 border-zinc-800 text-zinc-500")}
            >
              <Settings2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Font Settings Overlay */}
        {showSettings && view === 'reader' && (
          <div className="px-5 pb-5 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[1.5rem] space-y-4 shadow-2xl">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Text Size</span>
                <span className="text-emerald-500">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Minus className="w-4 h-4 text-zinc-600" />
                <Slider value={[fontSize]} onValueChange={(val) => setFontSize(val[0])} min={14} max={32} step={1} className="flex-1" />
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
                className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] hover:border-emerald-500/40 cursor-pointer transition-all shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-serif text-2xl font-bold border border-emerald-500/20">{book.short}</div>
                  <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white font-serif italic">{book.name}</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-2">{book.chapters} Chapters</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            <button 
              onClick={() => setView('index')} 
              className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Books
            </button>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold italic text-white">{selectedBook?.name} <span className="text-emerald-500">Chapter 1</span></h1>
              <div className="h-1 w-16 bg-emerald-500 rounded-full opacity-50"></div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center py-24 gap-6">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 font-serif italic text-lg animate-pulse">Consulting the Word...</p>
              </div>
            ) : (
              <div className="space-y-10">
                {currentContent?.map((v: any) => (
                  <div key={v.pk} className="group relative">
                    <p style={{ fontSize: `${fontSize}px` }} className="leading-[1.8] text-zinc-200 font-serif">
                      <span className="text-emerald-500 font-black text-[0.6em] align-top mr-3 opacity-60">#{v.verse}</span>
                      {v.text}
                    </p>
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleBookmark(v)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-emerald-500 hover:border-emerald-500/40 transition-all">
                            <FileText className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 rounded-[2rem]">
                          <DialogHeader>
                            <DialogTitle className="font-serif italic text-emerald-500">Add Study Reflection</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <p className="text-sm text-zinc-400 italic">"{v.text}"</p>
                            <Textarea 
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="What is the Spirit speaking to you through this vachan?"
                              className="bg-zinc-900 border-zinc-800 rounded-2xl min-h-[140px] focus:ring-emerald-500/20"
                            />
                            <Button onClick={() => handleSaveNote(v)} className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-7 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                              <Send className="w-4 h-4 mr-2" /> Save Note
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
