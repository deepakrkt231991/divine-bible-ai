'use client';

import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Mic, 
  Video, 
  HelpCircle, 
  Calendar, 
  Bookmark, 
  Users, 
  FileText, 
  Settings, 
  ChevronRight, 
  ArrowRight,
  User,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MorePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-32">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic">More Resources</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-emerald-400 transition-colors px-3 py-1.5 border border-primary/30 rounded-full">
            Register
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-100">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 max-w-2xl mx-auto w-full space-y-10 py-8">
        {/* AI Creation Tools Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold italic text-primary">AI Creation Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* AI Image Generator */}
            <div className="relative group overflow-hidden rounded-2xl aspect-[21/9] border border-zinc-800 cursor-pointer shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1755150427184-5707e795f22e?q=80&w=1080")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute inset-0 p-6 flex items-end">
                <div className="z-10 w-full flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-lg">AI Image Generator</h3>
                    <p className="text-zinc-300 text-xs">Create sacred visual meditations</p>
                  </div>
                  <div className="bg-primary/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-primary transition-colors">
                    <ArrowRight className="w-5 h-5 text-primary group-hover:text-zinc-950" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-all cursor-pointer group">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Voice</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Sermon & Scripture</p>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-all cursor-pointer group">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Video</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Spiritual reflections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bible Study & Engagement */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold italic text-primary">Bible Study</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: HelpCircle, title: 'Bible Quiz' },
              { icon: Calendar, title: 'Bible Reading Plans' },
              { icon: Bookmark, title: 'Saved Bookmarks & Verses' }
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* Community & Personal */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold italic text-primary">Community & Personal</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-sm">Prayer Requests</span>
              </div>
              <div className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Active</div>
            </div>
            {[
              { icon: FileText, title: 'Personal Notes' },
              { icon: Settings, title: 'Profile Settings' }
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 text-center pb-8 border-t border-zinc-800/50 pt-8">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Divine Compass v2.4.0</p>
          <p className="text-zinc-600 text-xs mt-2 italic font-serif">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
