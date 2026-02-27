
'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, User, PlayCircle, Languages, Loader2, Bookmark, FileText, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Translation = 'KJV' | 'IRV_HIN';

export default function BibleReaderPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [translation, setTranslation] = useState<Translation>('IRV_HIN');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'index' | 'reader'>('index');
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') as Translation;
    if (savedLang) setTranslation(savedLang);
  }, []);

  const handleLangChange = (lang: Translation) => {
    setTranslation(lang);
    localStorage.setItem('bible_language', lang);
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
    } finally {
      setLoading(false);
    }
  };

  const bollsBooks = [
    { name: "Genesis", id: 1, short: "Ge", chapters: 50, snippet: "In the beginning God created..." },
    { name: "Exodus", id: 2, short: "Ex", chapters: 40, snippet: "These are the names of the sons..." },
    { name: "Matthew", id: 40, short: "Mt", chapters: 28, snippet: "The book of the generation of Jesus..." },
    { name: "John", id: 43, short: "Jn", chapters: 21, snippet: "In the beginning was the Word..." },
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

    toast({ title: "Vachan Saved", description: "This verse has been added to your bookmarks." });
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
    toast({ title: "Note Added", description: "Your study reflection has been saved." });
  };

  const playVerse = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = translation === 'IRV_HIN' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight italic text-white">Divine Compass</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">Register</button>
            <div className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 max-w-2xl mx-auto space-y-4">
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800/50">
            <button 
              onClick={() => handleLangChange('IRV_HIN')}
              className={cn("flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all", translation === 'IRV_HIN' ? "bg-emerald-500 text-black" : "text-zinc-500")}
            >Hindi</button>
            <button 
              onClick={() => handleLangChange('KJV')}
              className={cn("flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all", translation === 'KJV' ? "bg-emerald-500 text-black" : "text-zinc-500")}
            >English</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {view === 'index' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bollsBooks.map((book) => (
              <div 
                key={book.id} 
                onClick={() => { setSelectedBook(book); fetchBibleContent(book.id, 1); }}
                className="group bg-zinc-900/40 border border-zinc-800 p-5 rounded-[1.5rem] hover:border-emerald-500/40 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-serif text-xl font-bold">{book.short}</div>
                  <PlayCircle className="w-6 h-6 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h4 className="text-lg font-bold">{book.name}</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{book.chapters} Chapters</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setView('index')} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Books
            </button>
            
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 font-serif italic text-sm">Loading Vachan...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {currentContent?.map((v: any) => (
                  <div key={v.pk} className="group relative">
                    <p className="text-lg leading-relaxed text-zinc-200">
                      <span className="text-emerald-500 font-black text-xs mr-3">{v.verse}</span>
                      {v.text}
                    </p>
                    <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleBookmark(v)} className="p-2 bg-zinc-900 rounded-lg hover:text-emerald-500">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-2 bg-zinc-900 rounded-lg hover:text-emerald-500">
                            <FileText className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 rounded-[2rem]">
                          <DialogHeader>
                            <DialogTitle className="font-serif italic text-emerald-500">Add Study Note</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <p className="text-xs text-zinc-500 italic">"{v.text}"</p>
                            <Textarea 
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Write your reflection here..."
                              className="bg-zinc-900 border-zinc-800 rounded-xl min-h-[120px]"
                            />
                            <Button onClick={() => handleSaveNote(v)} className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] py-6 rounded-xl">
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
