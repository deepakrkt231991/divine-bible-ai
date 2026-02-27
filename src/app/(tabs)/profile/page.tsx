
'use client';

import React, { useState, useEffect } from 'react';
import { User, Languages, Moon, ChevronRight, LogOut, ShieldCheck, HelpCircle, Check, Bookmark, FileText, Loader2, Trash2 } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, firestore, auth } = useFirebase();
  const { toast } = useToast();
  const [lang, setLang] = useState('IRV_HIN');

  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') || 'IRV_HIN';
    setLang(savedLang);
  }, []);

  // Fetch bookmarks
  const bookmarksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'bookmarks'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: bookmarks, isLoading: isBookmarksLoading } = useCollection(bookmarksQuery);

  // Fetch notes
  const notesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'notes'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: notes, isLoading: isNotesLoading } = useCollection(notesQuery);

  const handleLangToggle = () => {
    const newLang = lang === 'KJV' ? 'IRV_HIN' : 'KJV';
    setLang(newLang);
    localStorage.setItem('bible_language', newLang);
    toast({ title: "Language Updated", description: `Primary translation set to ${newLang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}.` });
  };

  const handleDeleteBookmark = async (id: string) => {
    if (!firestore || !user) return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'bookmarks', id));
    toast({ title: "Bookmark Removed" });
  };

  const handleDeleteNote = async (id: string) => {
    if (!firestore || !user) return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'notes', id));
    toast({ title: "Note Deleted" });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-white italic">My Journey</h1>
          <button className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* User Profile Header */}
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="size-28 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10 relative group">
            <User className="w-14 h-14 text-emerald-500" />
            <div className="absolute -bottom-1 -right-1 size-8 bg-emerald-500 rounded-xl border-4 border-[#09090b] flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif italic text-white">{user?.displayName || 'Faithful Seeker'}</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">{user?.email || 'Guest Explorer'}</p>
          </div>
        </section>

        {/* Saved Bookmarks Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Saved Bookmarks</h3>
            <span className="text-[10px] text-zinc-500 font-bold">{bookmarks?.length || 0} Saved</span>
          </div>
          <div className="space-y-4">
            {isBookmarksLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : bookmarks?.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
                No bookmarks yet. Save verses while reading!
              </div>
            ) : (
              bookmarks?.map((bookmark) => (
                <div key={bookmark.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{bookmark.bookName} {bookmark.chapter}:{bookmark.verseNumber}</span>
                    <button onClick={() => handleDeleteBookmark(bookmark.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm italic font-serif leading-relaxed">"{bookmark.verseText}"</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Personal Notes Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Study Notes</h3>
            <span className="text-[10px] text-zinc-500 font-bold">{notes?.length || 0} Notes</span>
          </div>
          <div className="space-y-4">
            {isNotesLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : notes?.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
                Write reflections on verses to see them here.
              </div>
            ) : (
              notes?.map((note) => (
                <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{note.bookName} Reflection</span>
                    </div>
                    <button onClick={() => handleDeleteNote(note.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{note.content}</p>
                  <p className="text-[9px] text-zinc-600 italic">Reference: "{note.verseText?.substring(0, 50)}..."</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Settings & Account */}
        <section className="space-y-6 pt-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 px-2">Account Settings</h3>
          <div className="space-y-4">
            <button onClick={handleLangToggle} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                  <Languages className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base">App Language</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{lang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
            </button>

            <button onClick={() => auth.signOut()} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-red-500/40">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                  <LogOut className="w-6 h-6" />
                </div>
                <span className="font-bold text-base text-red-500">Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-all" />
            </button>
          </div>
        </section>

        <div className="text-center pt-10 border-t border-zinc-800/50">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
