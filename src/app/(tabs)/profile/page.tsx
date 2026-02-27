
'use client';

import React, { useState, useEffect } from 'react';
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
  Camera
} from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, firestore, auth } = useFirebase();
  const { toast } = useToast();
  const [lang, setLang] = useState('IRV_HIN');

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

  // Fetch personal prayer requests
  const myPrayersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'prayer_requests'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: myPrayers } = useCollection(myPrayersQuery);

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
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-3 relative overflow-hidden group">
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

          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-3 relative overflow-hidden group">
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

        {/* Actions List */}
        <section className="space-y-4">
          <Link href="/profile" className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-base text-zinc-100">My Bookmarks</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{bookmarks?.length || 0} Saved Verses</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
          </Link>

          <Link href="/community" className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-base text-zinc-100">My Prayer Requests</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{myPrayers?.length || 0} Active Requests</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
          </Link>

          <button onClick={handleLangToggle} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                <Languages className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-base text-zinc-100">Settings</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{lang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
          </button>

          <button onClick={() => auth.signOut()} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-red-500/40 mt-10">
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
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">Divine Compass v2.5.0</p>
          <p className="text-zinc-700 text-xs mt-2 italic font-serif">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
