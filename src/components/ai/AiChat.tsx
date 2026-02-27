"use client";

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, ArrowLeft, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { aiScriptureReflection } from '@/ai/flows/ai-scripture-reflection';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  time: string;
};

type AiMode = 'question' | 'reflection';

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [passage, setPassage] = useState('John 3:16');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AiMode>('question');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: input, time };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        let response;
        if (mode === 'question') {
            response = await aiScriptureQuestion({ passage, question: input });
            if (response.answer) {
                setMessages((prev) => [...prev, { role: 'assistant', content: response.answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }
        } else {
            response = await aiScriptureReflection({ versePassage: passage, userContext: input });
             if (response.reflectionContent) {
                setMessages((prev) => [...prev, { role: 'assistant', content: `**${response.reflectionTitle}**\n\n${response.reflectionContent}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }
        }
    } catch (error) {
        toast({ title: 'AI Error', description: 'Failed to get a response.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header - WhatsApp Style */}
      <div className="glass-nav sticky top-0 z-50 px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <Button variant="ghost" size="icon" className="rounded-full text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10 border border-primary/20 ring-2 ring-primary/10">
            <AvatarFallback className="bg-primary/20 text-primary font-black text-xs">AI</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Divine Guide</span>
            <span className="text-[10px] text-primary animate-pulse uppercase tracking-widest font-black">Active Agent</span>
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-full border border-white/5">
          <Button 
            size="sm" 
            variant={mode === 'question' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full h-7 px-4 text-[10px] uppercase font-black tracking-widest transition-all", mode === 'question' && "bg-primary text-zinc-950")}
            onClick={() => setMode('question')}
          >
            Study
          </Button>
          <Button 
            size="sm" 
            variant={mode === 'reflection' ? 'secondary' : 'ghost'} 
            className={cn("rounded-full h-7 px-4 text-[10px] uppercase font-black tracking-widest transition-all", mode === 'reflection' && "bg-primary text-zinc-950")}
            onClick={() => setMode('reflection')}
          >
            Reflect
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="py-8 space-y-8 max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 opacity-20">
              <Sparkles className="w-16 h-16 text-primary" />
              <p className="text-xl font-serif italic max-w-xs">Ask anything about the scriptures. Your guide is ready.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn(
                'max-w-[85%] rounded-[2rem] px-5 py-4 relative shadow-2xl',
                message.role === 'user' 
                  ? 'bg-primary text-zinc-950 rounded-tr-none font-medium' 
                  : 'bg-zinc-900 text-zinc-100 border border-white/5 rounded-tl-none'
              )}>
                <div 
                  className="text-[15px] leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black">$1</strong>') }}
                />
                <span className={cn('text-[9px] block mt-2 opacity-50 text-right font-black uppercase tracking-widest', message.role === 'user' ? 'text-zinc-900/70' : 'text-zinc-500')}>
                  {message.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-zinc-900 rounded-[2rem] rounded-tl-none px-5 py-4 flex items-center gap-3 border border-white/5">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Thinking</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-[2.5rem] border border-white/5 focus-within:border-primary/40 transition-all shadow-xl">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'question' ? 'Ask about a verse...' : 'Describe your mood...'}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[48px] max-h-32 py-3 px-4 resize-none no-scrollbar text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              onClick={handleSubmit} 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="rounded-full h-11 w-11 bg-primary hover:bg-emerald-400 text-zinc-950 shrink-0 shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-center">
             <div className="px-5 py-2 bg-zinc-900 rounded-full border border-white/5 flex items-center gap-3 shadow-lg">
               <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Context:</span>
               <input 
                  value={passage} 
                  onChange={(e) => setPassage(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black text-primary focus:ring-0 w-28 p-0 tracking-widest uppercase"
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}