
'use client';

import React, { useState } from 'react';
import { Search, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Smile, Calendar, User, Bell, Send, Loader2 } from 'lucide-react';
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
    if (!newPrayer.trim() || !firestore || !user) return;
    setIsPosting(true);
    try {
      await addDoc(collection(firestore, 'community_prayers'), {
        userId: user.uid,
        userName: user.displayName || 'Spiritual Seeker',
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
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-emerald-500 italic">Divine Compass</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">Register</button>
            <User className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prayer Circles</h3>
            <button className="text-xs text-emerald-500 font-medium">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {circles.map((circle, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-20">
                <div className="size-16 rounded-full p-1 border-2 border-emerald-500/30">
                  <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${circle.image}')` }}></div>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate w-full text-center">{circle.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-2xl">
          <div className="flex gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1 space-y-4">
              <textarea 
                value={newPrayer}
                onChange={(e) => setNewPrayer(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-zinc-200 placeholder:text-zinc-600 resize-none h-16 pt-2 text-sm leading-relaxed" 
                placeholder="Share a prayer request or reflection..."
              ></textarea>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><ImageIcon className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><Smile className="w-5 h-5" /></button>
                </div>
                <button 
                  onClick={handlePostPrayer}
                  disabled={isPosting || !newPrayer.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Prayer'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4 opacity-50">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Connecting Feed...</p>
            </div>
          ) : prayers?.map((prayer) => (
            <article key={prayer.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-zinc-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{prayer.userName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Spiritual Reflection</p>
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 mb-8">
                  <p className="text-zinc-300 leading-relaxed font-serif italic text-lg">"{prayer.content}"</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={() => handleAmen(prayer.id)}
                      className="flex items-center gap-3 text-zinc-400 hover:text-emerald-500 transition-colors group"
                    >
                      <Heart className={cn("w-6 h-6 group-active:scale-125 transition-transform", prayer.amenCount > 0 && "fill-emerald-500 text-emerald-500")} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{prayer.amenCount || 0} Amen</span>
                    </button>
                    <button className="flex items-center gap-3 text-zinc-400 hover:text-emerald-500 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Reply</span>
                    </button>
                  </div>
                  <button className="text-zinc-400 hover:text-emerald-500"><Share2 className="w-6 h-6" /></button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
