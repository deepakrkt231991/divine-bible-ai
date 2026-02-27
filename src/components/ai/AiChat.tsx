"use client";

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { aiScriptureReflection } from '@/ai/flows/ai-scripture-reflection';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      <div className="glass sticky top-0 z-50 px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <Button variant="ghost" size="icon" className="rounded-full text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10 border border-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-bold">AI</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Divine Guide</span>
            <span className="text-[10px] text-primary animate-pulse uppercase tracking-widest font-bold">Online</span>
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-full">
          <Button 
            size="sm" 
            variant={mode === 'question' ? 'secondary' : 'ghost'} 
            className="rounded-full h-7 px-3 text-[10px] uppercase font-bold"
            onClick={() => setMode('question')}
          >
            Study
          </Button>
          <Button 
            size="sm" 
            variant={mode === 'reflection' ? 'secondary' : 'ghost'} 
            className="rounded-full h-7 px-3 text-[10px] uppercase font-bold"
            onClick={() => setMode('reflection')}
          >
            Reflect
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="py-6 space-y-6 max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
              <Sparkles className="w-12 h-12 text-primary" />
              <p className="text-sm font-serif italic max-w-xs">Ask anything about the scriptures. Your guide is ready.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn(
                'max-w-[85%] rounded-[1.5rem] px-4 py-3 relative shadow-lg',
                message.role === 'user' 
                  ? 'bg-primary text-black rounded-tr-none' 
                  : 'glass text-zinc-100 rounded-tl-none'
              )}>
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
                <span className={cn('text-[9px] block mt-1 opacity-50 text-right', message.role === 'user' ? 'text-black/70' : 'text-zinc-500')}>
                  {message.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="glass rounded-[1.5rem] rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Thinking</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background pb-28">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-[2rem] border border-white/5 focus-within:border-primary/50 transition-colors">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'question' ? 'Ask about a verse...' : 'Describe your mood...'}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[44px] max-h-32 py-3 resize-none no-scrollbar"
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
              className="rounded-full h-10 w-10 bg-primary hover:bg-primary/80 text-black shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-center">
             <div className="px-4 py-1.5 bg-zinc-900 rounded-full border border-white/5 flex items-center gap-2">
               <span className="text-[10px] text-zinc-500 uppercase font-bold">Context:</span>
               <input 
                  value={passage} 
                  onChange={(e) => setPassage(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-primary focus:ring-0 w-24 p-0"
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}