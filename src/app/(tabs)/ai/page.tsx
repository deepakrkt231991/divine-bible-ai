
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Info, Sparkles, User, Mic, Send, Loader2 } from 'lucide-react';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  time: string;
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '"Peace I leave with you; my peace I give you." John 14:27\n\nWelcome back. How can I support your spiritual journey or offer guidance today?',
      time: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiScriptureQuestion({ 
        passage: "General Scripture Context", 
        question: input 
      });
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-40 hide-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "")}>
            {msg.role === 'assistant' && (
              <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="text-primary w-4 h-4" />
              </div>
            )}
            <div className={cn("flex flex-col gap-1.5 max-w-[85%]", msg.role === 'user' ? "items-end" : "")}>
              <p className="text-zinc-500 text-[11px] font-medium px-1">
                {msg.role === 'assistant' ? 'Divine Compass AI' : 'You'}
              </p>
              <div className={cn(
                "rounded-2xl px-4 py-3 shadow-sm border whitespace-pre-wrap",
                msg.role === 'assistant' 
                  ? "bg-gradient-to-br from-zinc-900 to-emerald-950/10 border-emerald-500/20 text-slate-200 rounded-tl-none" 
                  : "bg-zinc-800 border-zinc-700/50 text-slate-100 rounded-tr-none"
              )}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest px-1">{msg.time}</p>
            </div>
            {msg.role === 'user' && (
              <div className="size-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                <User className="text-zinc-300 w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Loader2 className="text-primary w-4 h-4 animate-spin" />
            </div>
            <div className="bg-zinc-900/50 rounded-2xl rounded-tl-none px-4 py-3 border border-zinc-800/50">
              <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Searching scriptures...</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls Area */}
      <div className="fixed bottom-24 left-0 w-full z-40">
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
          {['✨ Daily prayer', '📖 Explain John 3:16', '🕊️ I\'m feeling anxious', '🙏 Morning devotion'].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion.replace(/[^\w\s]/gi, '').trim())}
              className="whitespace-nowrap rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-primary/50 transition-colors backdrop-blur-sm shadow-xl"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl p-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-1.5 pl-4 group focus-within:border-primary/50 transition-all duration-300">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-100 placeholder-zinc-500 py-2" 
              placeholder="Message your chaplain..." 
              type="text"
            />
            <div className="flex items-center gap-1">
              <button className="flex items-center justify-center size-10 rounded-lg text-zinc-400 hover:text-primary transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center size-10 rounded-lg bg-primary text-zinc-950 shadow-lg shadow-primary/40 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
