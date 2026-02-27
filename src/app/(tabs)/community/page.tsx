
'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Smile, User, Send, Loader2, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function CommunityPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [newPrayer, setNewPrayer] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const prayersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'prayer_requests'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: prayers, isLoading } = useCollection(prayersQuery);

  const handlePostPrayer = async () => {
    if (!newPrayer.trim() || !firestore || !user) {
      toast({ title: "Note", description: "Please sign in to share a prayer." });
      return;
    }
    setIsPosting(true);
    
    const prayerData = {
      userId: user.uid,
      userName: isAnonymous ? 'Faithful Seeker' : (user.displayName || 'Faithful Seeker'),
      content: newPrayer,
      isAnonymous,
      type: 'public',
      amenCount: 0,
      createdAt: serverTimestamp()
    };

    addDoc(collection(firestore, 'prayer_requests'), prayerData)
      .then(() => {
        setNewPrayer('');
        setIsAnonymous(false);
        toast({ title: "Prayer Shared", description: "Your request has been added to the community circle." });
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'prayer_requests',
          operation: 'create',
          requestResourceData: prayerData
        }));
      })
      .finally(() => {
        setIsPosting(false);
      });
  };

  const handleAmen = async (prayerId: string, currentAmenCount: number) => {
    if (!firestore || !user) {
      toast({ title: "Sign In", description: "Please sign in to say Amen." });
      return;
    }
    const ref = doc(firestore, 'prayer_requests', prayerId);
    
    updateDoc(ref, {
      amenCount: increment(1)
    }).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: ref.path,
        operation: 'update',
        requestResourceData: { amenCount: currentAmenCount + 1 }
      }));
    });

    toast({ title: "Amen!", description: "You are praying for this request." });
  };

  const circles = [
    { name: 'Grace', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100' },
    { name: 'Brother Eli', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100' },
    { name: 'Sarah', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100' },
    { name: 'Marcus', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100' },
    { name: 'Elena', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100' },
    { name: 'Worship Team', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&h=100' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/home" className="font-serif text-2xl font-bold text-emerald-500 italic">Divine Compass</Link>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
            <Link href="/profile" className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-10">
        {/* Story Circles Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prayer Circles</h3>
            <button className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest hover:underline">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {circles.map((circle, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-20 group cursor-pointer">
                <div className={cn(
                  "size-16 rounded-full p-1 border-2 transition-all duration-500",
                  i < 2 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/10 group-hover:border-emerald-500/50"
                )}>
                  <div 
                    className="w-full h-full rounded-full bg-cover bg-center" 
                    style={{ backgroundImage: `url('${circle.image}')` }}
                  ></div>
                </div>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest truncate w-full text-center group-hover:text-emerald-500">{circle.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Create Post Area */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-4 shadow-xl">
          <div className="flex gap-4">
            <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <textarea 
                value={newPrayer}
                onChange={(e) => setNewPrayer(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-zinc-300 placeholder:text-zinc-600 resize-none h-14 pt-2 text-sm leading-relaxed" 
                placeholder="Share a spiritual reflection..."
              ></textarea>
              <div className="flex items-center gap-3 mb-3">
                <button 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
                    isAnonymous ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-500"
                  )}
                >
                  {isAnonymous ? <Check className="w-3 h-3" /> : null}
                  Anonymous
                </button>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-emerald-500 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-emerald-500 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-emerald-500 transition-colors">
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={handlePostPrayer}
                  disabled={isPosting || !newPrayer.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] px-8 py-2.5 rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Feed Posts */}
        <section className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-6 opacity-40">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Connecting Circle...</p>
            </div>
          ) : prayers?.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <p className="text-sm font-serif italic text-zinc-400">The circle is quiet. Be the first to share a reflection.</p>
            </div>
          ) : prayers?.map((prayer) => (
            <article key={prayer.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-10 rounded-full bg-zinc-800 border flex items-center justify-center text-zinc-500 transition-all duration-700",
                      prayer.amenCount > 10 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110" : "border-white/5"
                    )}>
                      {prayer.isAnonymous ? <span className="text-xl">?</span> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{prayer.userName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Spiritual Journey</p>
                    </div>
                  </div>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-zinc-200 leading-relaxed font-serif italic text-lg">"{prayer.content}"</p>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">#Faith #DivinePath #Reflection</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={() => handleAmen(prayer.id, prayer.amenCount || 0)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-emerald-500 transition-all group"
                    >
                      <Heart className={cn("w-5 h-5 group-active:scale-150 transition-all duration-300", prayer.amenCount > 0 && "fill-emerald-500 text-emerald-500")} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{prayer.amenCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-zinc-400 hover:text-emerald-500 transition-all group">
                      <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Reply</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-zinc-400 hover:text-emerald-500 transition-all">
                    <Share2 className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Share</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
