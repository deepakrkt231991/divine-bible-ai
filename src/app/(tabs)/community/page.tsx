'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Smile, User, Send, Loader2 } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CommunityPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [newPrayer, setNewPrayer] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const prayersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'community_prayers'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: prayers, isLoading } = useCollection(prayersQuery);

  const handlePostPrayer = async () => {
    if (!newPrayer.trim() || !firestore || !user) {
      toast({ title: "Note", description: "Please sign in to share a prayer." });
      return;
    }
    setIsPosting(true);
    try {
      await addDoc(collection(firestore, 'community_prayers'), {
        userId: user.uid,
        userName: user.displayName || 'Faithful Seeker',
        content: newPrayer,
        type: 'public',
        amenCount: 0,
        createdAt: serverTimestamp()
      });
      setNewPrayer('');
      toast({ title: "Prayer Shared", description: "Your request has been added to the community circle." });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleAmen = async (prayerId: string) => {
    if (!firestore) return;
    const ref = doc(firestore, 'community_prayers', prayerId);
    await updateDoc(ref, {
      amenCount: increment(1)
    });
    toast({ title: "Amen!", description: "You are praying for this request." });
  };

  const circles = [
    { name: 'Grace', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100' },
    { name: 'Brother Eli', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100' },
    { name: 'Sarah', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100' },
    { name: 'Joshua', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-white italic">Divine Compass</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
            <div className="size-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-10">
        {/* Story/Circle Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prayer Circles</h3>
            <button className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest hover:underline">View all</button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
            {circles.map((circle, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3 w-20 group cursor-pointer">
                <div className="size-18 rounded-full p-1 border-2 border-emerald-500/40 group-hover:border-emerald-500 transition-all">
                  <div 
                    className="w-full h-full rounded-full bg-cover bg-center shadow-2xl" 
                    style={{ backgroundImage: `url('${circle.image}')` }}
                  ></div>
                </div>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest truncate w-full text-center group-hover:text-emerald-500">{circle.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Post Prayer Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex gap-5">
            <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="flex-1 space-y-6">
              <textarea 
                value={newPrayer}
                onChange={(e) => setNewPrayer(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-zinc-200 placeholder:text-zinc-600 resize-none h-24 pt-2 text-lg font-serif italic leading-relaxed" 
                placeholder="Share a prayer request or reflection..."
              ></textarea>
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                <div className="flex gap-2">
                  <button className="p-3 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all hover:text-emerald-500"><ImageIcon className="w-5 h-5" /></button>
                  <button className="p-3 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all hover:text-emerald-500"><Smile className="w-5 h-5" /></button>
                </div>
                <button 
                  onClick={handlePostPrayer}
                  disabled={isPosting || !newPrayer.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] px-10 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Prayer'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Prayers Feed */}
        <section className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center py-24 gap-6 opacity-40">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Connecting Circle...</p>
            </div>
          ) : prayers?.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <p className="text-sm font-serif italic">The circle is quiet. Be the first to share a prayer.</p>
            </div>
          ) : prayers?.map((prayer) => (
            <article key={prayer.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="size-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg">
                      <User className="w-7 h-7 text-zinc-500" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-100">{prayer.userName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Spiritual Journey</p>
                    </div>
                  </div>
                  <button className="text-zinc-600 hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 mb-10">
                  <p className="text-zinc-200 leading-relaxed font-serif italic text-xl">"{prayer.content}"</p>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={() => handleAmen(prayer.id)}
                      className="flex items-center gap-3 text-zinc-400 hover:text-emerald-500 transition-all group"
                    >
                      <Heart className={cn("w-6 h-6 group-active:scale-150 transition-all duration-300", prayer.amenCount > 0 && "fill-emerald-500 text-emerald-500")} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{prayer.amenCount || 0} Amen</span>
                    </button>
                    <button className="flex items-center gap-3 text-zinc-400 hover:text-emerald-500 transition-all group">
                      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Reply</span>
                    </button>
                  </div>
                  <button className="text-zinc-500 hover:text-emerald-500 transition-colors"><Share2 className="w-6 h-6" /></button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
