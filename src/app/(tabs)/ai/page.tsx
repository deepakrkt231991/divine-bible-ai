'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, User, Mic, Send, Loader2, Info } from 'lucide-react';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isBibleVerse?: boolean;
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
      // Using the integrated Genkit flow with "Wise Bible Scholar" logic
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#09090b]">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="text-zinc-400 w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-zinc-100 text-lg font-bold tracking-tight font-serif italic">AI Magic</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse glow-primary"></span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">AI Chaplain Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 pb-48 hide-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex items-start gap-4", msg.role === 'user' ? "justify-end" : "")}>
            {msg.role === 'assistant' && (
              <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-lg">
                <Sparkles className="text-emerald-500 w-5 h-5" />
              </div>
            )}
            <div className={cn("flex flex-col gap-2 max-w-[82%]", msg.role === 'user' ? "items-end" : "")}>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] px-1">
                {msg.role === 'assistant' ? 'Divine Compass AI' : 'You'}
              </p>
              <div className={cn(
                "rounded-[1.5rem] px-5 py-4 shadow-2xl border leading-relaxed",
                msg.role === 'assistant' 
                  ? "bg-gradient-to-br from-zinc-900 to-[#121214] border-emerald-500/10 text-zinc-200 rounded-tl-none" 
                  : "bg-emerald-500 text-black border-emerald-400/20 rounded-tr-none font-medium"
              )}>
                <p className="text-[15px] whitespace-pre-wrap">{msg.content}</p>
              </div>
              <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest px-1">{msg.time}</p>
            </div>
            {msg.role === 'user' && (
              <div className="size-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-lg">
                <User className="text-zinc-400 w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Loader2 className="text-emerald-500 w-5 h-5 animate-spin" />
            </div>
            <div className="bg-zinc-900/50 rounded-[1.5rem] rounded-tl-none px-5 py-4 border border-zinc-800/50">
              <div className="flex gap-1.5 items-center">
                <span className="size-1.5 rounded-full bg-emerald-500/40 animate-bounce"></span>
                <span className="size-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:0.2s]"></span>
                <span className="size-1.5 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:0.4s]"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-3">Consulting Scriptures</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls Area */}
      <div className="fixed bottom-24 left-0 w-full z-40">
        <div className="flex gap-2.5 overflow-x-auto px-6 pb-5 no-scrollbar">
          {['✨ Daily prayer', '📖 Explain John 3:16', '🕊️ I\'m feeling anxious', '🙏 Morning devotion'].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion.replace(/[^\w\s]/gi, '').trim())}
              className="whitespace-nowrap rounded-full bg-zinc-900/90 border border-zinc-800 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all backdrop-blur-md shadow-2xl"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="bg-[#09090b]/90 backdrop-blur-2xl p-6 border-t border-zinc-800/50">
          <div className="flex items-center gap-4 bg-zinc-900/60 rounded-[1.5rem] border border-zinc-800/80 p-2 pl-6 group focus-within:border-emerald-500/50 transition-all duration-500 shadow-2xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-zinc-100 placeholder-zinc-600 py-3" 
              placeholder="Message your chaplain..." 
              type="text"
            />
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center size-12 rounded-2xl text-zinc-500 hover:text-emerald-500 transition-colors">
                <Mic className="w-6 h-6" />
              </button>
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center size-12 rounded-2xl bg-emerald-500 text-black shadow-xl shadow-emerald-500/30 transition-all active:scale-90 disabled:opacity-50 group-hover:glow-primary"
              >
                <Send className="w-6 h-6 font-bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}