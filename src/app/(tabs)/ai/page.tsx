'use client';

import React from 'react';
import { ArrowLeft, Info, Sparkles, User, Mic, Send } from 'lucide-react';

export default function AiPage() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-zinc-950">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="text-slate-100 w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-slate-100 text-lg font-semibold tracking-tight font-serif italic">AI Chaplain</h2>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Online</span>
          </div>
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

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-40 hide-scrollbar">
        {/* AI Welcome Message */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="text-primary w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1.5 max-w-[85%]">
            <p className="text-zinc-500 text-[11px] font-medium ml-1">Divine Compass AI</p>
            <div className="bg-gradient-to-br from-zinc-900 to-emerald-950/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-emerald-500/20">
              <p className="text-sm leading-relaxed text-slate-200">
                "Peace I leave with you; my peace I give you." 
                <span className="font-serif italic block mt-2 text-primary/90 text-base">John 14:27</span>
              </p>
              <p className="text-sm leading-relaxed text-slate-300 mt-2">
                Welcome back. How can I support your spiritual journey or offer guidance today?
              </p>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex items-start gap-3 justify-end">
          <div className="flex flex-col gap-1.5 max-w-[85%] items-end">
            <p className="text-zinc-500 text-[11px] font-medium mr-1">You</p>
            <div className="bg-zinc-800 rounded-2xl rounded-tr-none px-4 py-3 border border-zinc-700/50 shadow-sm">
              <p className="text-sm leading-relaxed text-slate-100">
                I'm feeling a bit anxious about my new job starting tomorrow. I need some strength.
              </p>
            </div>
          </div>
          <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
            <User className="text-zinc-300 w-4 h-4" />
          </div>
        </div>

        {/* AI Response */}
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Sparkles className="text-primary w-4 h-4" />
          </div>
          <div className="flex flex-col gap-1.5 max-w-[85%]">
            <p className="text-zinc-500 text-[11px] font-medium ml-1">Divine Compass AI</p>
            <div className="bg-gradient-to-br from-zinc-900 to-emerald-950/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-emerald-500/20">
              <p className="text-sm leading-relaxed text-slate-300">
                Transitioning into a new role is a significant step. Scripture reminds us:
              </p>
              <p className="font-serif italic py-3 text-slate-100 text-lg border-l-2 border-primary/40 pl-4 my-2">
                "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." 
                <span className="block text-xs font-sans not-italic text-primary mt-1 font-bold tracking-widest uppercase">Joshua 1:9</span>
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Would you like to pray together for peace and confidence in this new chapter?
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Controls Area */}
      <div className="fixed bottom-24 left-0 w-full z-40">
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
          <button className="whitespace-nowrap rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-primary/50 transition-colors backdrop-blur-sm">
            ✨ Daily prayer
          </button>
          <button className="whitespace-nowrap rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-primary/50 transition-colors backdrop-blur-sm">
            📖 Explain John 3:16
          </button>
          <button className="whitespace-nowrap rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-primary/50 transition-colors backdrop-blur-sm">
            🕊️ I'm feeling anxious
          </button>
          <button className="whitespace-nowrap rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-primary/50 transition-colors backdrop-blur-sm">
            🙏 Morning devotion
          </button>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl p-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-1.5 pl-4 group focus-within:border-primary/50 transition-all duration-300">
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-100 placeholder-zinc-500 py-2" 
              placeholder="Message your chaplain..." 
              type="text"
            />
            <div className="flex items-center gap-1">
              <button className="flex items-center justify-center size-10 rounded-lg text-zinc-400 hover:text-primary transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center size-10 rounded-lg bg-primary text-zinc-950 shadow-lg shadow-primary/40 transition-transform active:scale-95">
                <Send className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
