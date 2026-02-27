
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Languages, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  Check, 
  Bookmark, 
  FileText, 
  Loader2, 
  Trash2, 
  MapPin, 
  Flame, 
  Heart,
  Phone,
  Camera,
  Search,
  BookOpen,
  Share2
} from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from 'next/link';

export default function ProfilePage() {
  const { user, firestore, auth } = useFirebase();
  const { toast } = useToast();
  const [lang, setLang] = useState('IRV_HIN');
  const [noteSearch, setNoteSearch] = useState('');

  // Fetch Full User Profile from Firestore
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

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

  // Fetch personal notes
  const notesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'notes'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: notes, isLoading: isNotesLoading } = useCollection(notesQuery);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    return notes.filter(n => 
      n.content.toLowerCase().includes(noteSearch.toLowerCase()) || 
      n.bookName?.toLowerCase().includes(noteSearch.toLowerCase())
    );
  }, [notes, noteSearch]);

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

  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Divine Compass Verse',
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Verse copied to clipboard." });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-white italic">Mera Profile</h1>
          <button className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20 relative">
            <ShieldCheck className="w-5 h-5" />
            {profile?.verified && (
              <span className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-[#09090b]" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="size-32 rounded-[3rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10 transition-transform group-hover:scale-105 duration-500">
              {profile?.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="Avatar" className="size-full rounded-[3rem] object-cover" />
              ) : (
                <User className="w-16 h-16 text-emerald-500" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 size-10 bg-emerald-500 text-black rounded-2xl border-4 border-[#09090b] flex items-center justify-center hover:scale-110 transition-all">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold font-serif italic text-white">{profile?.name || user?.displayName || 'Faithful Seeker'}</h2>
              {profile?.verified && <Check className="w-5 h-5 text-emerald-500" />}
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {profile?.location || 'India'}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {profile?.mobileNumber || '+91 9324401526'}</span>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-3 relative overflow-hidden group shadow-xl">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
              <Heart className="w-20 h-20 text-emerald-500" />
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prayer Points</p>
              <h4 className="text-2xl font-bold text-white mt-1">{profile?.amenCount || 0}</h4>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-3 relative overflow-hidden group shadow-xl">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
              <Flame className="w-20 h-20 text-emerald-500" />
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Reading Streak</p>
              <h4 className="text-2xl font-bold text-white mt-1">{profile?.readingStreak || 1} Days</h4>
            </div>
          </div>
        </section>

        {/* Meri Study - Tabs Dashboard */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-serif text-xl font-bold italic text-emerald-500">Meri Study</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Divine Library</span>
          </div>

          <Tabs defaultValue="bookmarks" className="w-full">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-1 h-14">
              <TabsTrigger 
                value="bookmarks" 
                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all"
              >
                <Bookmark className="w-4 h-4 mr-2" /> Bookmarks
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all"
              >
                <FileText className="w-4 h-4 mr-2" /> Mere Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookmarks" className="mt-8 space-y-4">
              {isBookmarksLoading ? (
                <div className="flex flex-col items-center py-10 opacity-40">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : bookmarks?.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/40 rounded-[2rem] border border-dashed border-zinc-800">
                  <p className="text-zinc-500 text-sm font-serif italic">Abhi tak koi vachan bookmark nahi kiya gaya hai.</p>
                  <Link href="/read">
                    <button className="mt-4 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Start Reading</button>
                  </Link>
                </div>
              ) : (
                bookmarks?.map((bm) => (
                  <div key={bm.id} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 space-y-4 group hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{bm.bookName} {bm.chapter}:{bm.verseNumber}</span>
                      <div className="flex gap-3">
                        <button onClick={() => handleShare(bm.verseText)} className="text-zinc-500 hover:text-emerald-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBookmark(bm.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-zinc-100 font-serif leading-relaxed italic text-base">"{bm.verseText}"</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-full text-zinc-500">{bm.translation}</span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-8 space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search in my notes..." 
                  className="bg-zinc-900 border-zinc-800 rounded-2xl pl-12 h-12 text-sm focus:ring-emerald-500/20"
                />
              </div>

              {isNotesLoading ? (
                <div className="flex flex-col items-center py-10 opacity-40">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/40 rounded-[2rem] border border-dashed border-zinc-800">
                  <p className="text-zinc-500 text-sm font-serif italic">Yahan koi notes nahi hain.</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 space-y-4 group hover:border-emerald-500/30 transition-all shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{note.bookName}</span>
                      </div>
                      <button onClick={() => handleDeleteNote(note.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-zinc-500 text-xs italic line-clamp-2">"{note.verseText}"</p>
                      <div className="h-px w-full bg-white/5" />
                      <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <div className="pt-2 flex justify-between items-center text-[8px] text-zinc-600 font-black uppercase tracking-widest">
                      <span>Reflections</span>
                      <span>{note.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Global Settings */}
        <section className="space-y-4">
          <button onClick={handleLangToggle} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                <Languages className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-base text-zinc-100">App Language</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{lang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
          </button>

          <button onClick={() => auth.signOut()} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-red-500/40 mt-10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                <LogOut className="w-6 h-6" />
              </div>
              <span className="font-bold text-base text-red-500">Log Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-all" />
          </button>
        </section>

        <div className="text-center pt-10 border-t border-zinc-800/50">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">Divine Compass v2.6.0</p>
          <p className="text-zinc-700 text-xs mt-2 italic font-serif">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
