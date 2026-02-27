
'use client';

import React from 'react';
import { Search, Bell, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Smile, Calendar, User } from 'lucide-react';

export default function CommunityPage() {
  const circles = [
    { name: 'Grace', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100' },
    { name: 'Brother Eli', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100' },
    { name: 'Sarah', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100' },
    { name: 'Marcus', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100' },
    { name: 'Elena', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100' },
    { name: 'Worship', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=100&h=100' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-primary">Divine Compass</h1>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-emerald-400 transition-colors px-3 py-1.5 border border-primary/30 rounded-full">
              Register
            </button>
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-100">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {/* Prayer Circles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Prayer Circles</h3>
            <button className="text-xs text-primary font-medium">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {circles.map((circle, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-20">
                <div className={`size-16 rounded-full p-1 border-2 ${i < 2 ? 'border-primary' : 'border-primary'}`}>
                  <div 
                    className="w-full h-full rounded-full bg-cover bg-center" 
                    style={{ backgroundImage: `url('${circle.image}')` }}
                  ></div>
                </div>
                <span className="text-xs text-center truncate w-full text-zinc-300">{circle.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Create Post Area */}
        <section className="bg-zinc-900 border border-white/5 rounded-2xl p-4 shadow-xl">
          <div className="flex gap-4">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <textarea 
                className="w-full bg-transparent border-none focus:ring-0 text-zinc-300 placeholder:text-zinc-600 resize-none h-12 pt-2 text-sm" 
                placeholder="Share a spiritual reflection..."
              ></textarea>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold px-6 py-2 rounded-xl text-sm transition-all transform active:scale-95 shadow-lg shadow-primary/20">
                  Post
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="space-y-6">
          <article className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100')" }}></div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Sister Julian</h4>
                    <p className="text-xs text-zinc-500">2 hours ago • Reflection</p>
                  </div>
                </div>
                <button className="text-zinc-500 hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-zinc-300 leading-relaxed italic font-serif text-lg">
                  "The light we seek is not found in the noise of the world, but in the stillness of our own breathing. Today, I found peace in the morning mist."
                </p>
                <p className="text-primary text-sm font-medium">#QuietReflection #InnerPeace #DivinePath</p>
              </div>
              <div className="rounded-xl overflow-hidden mb-4 border border-white/5">
                <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" alt="Mountain" className="w-full aspect-video object-cover" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs font-medium">124</span>
                  </button>
                  <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs font-medium">32</span>
                  </button>
                </div>
                <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-medium">Share</span>
                </button>
              </div>
            </div>
          </article>

          <article className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100')" }}></div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Brother Eli</h4>
                    <p className="text-xs text-zinc-500">5 hours ago • Daily Scripture</p>
                  </div>
                </div>
                <button className="text-zinc-500 hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-primary/5 border-l-4 border-primary p-4 mb-4 rounded-r-2xl">
                <p className="text-zinc-100 italic font-serif text-xl leading-relaxed">
                  "Thy word is a lamp unto my feet, and a light unto my path."
                </p>
                <p className="text-primary text-xs font-bold mt-2 uppercase tracking-widest">— Psalm 119:105</p>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                As we navigate the complexities of modern life, let us always return to the ancient wisdom that grounds us. This verse has been my anchor this week.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-primary transition-colors">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="text-xs font-medium">89</span>
                  </button>
                  <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs font-medium">12</span>
                  </button>
                </div>
                <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-medium">Share</span>
                </button>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
