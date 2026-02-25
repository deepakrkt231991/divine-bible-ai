'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, User, Bot, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiScriptureQuestion } from '@/ai/flows/ai-scripture-question';
import { aiScriptureReflection } from '@/ai/flows/ai-scripture-reflection';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '../ui/input';

type Message = {
  role: 'user' | 'assistant';
  content: string;
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
    if (!input.trim() || !passage.trim()) {
        toast({ title: 'Input required', description: 'Please provide a passage and a question/prompt.', variant: 'destructive'});
        return;
    };

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        let response;
        if (mode === 'question') {
            response = await aiScriptureQuestion({ passage, question: input });
            if (response.answer) {
                const assistantMessage: Message = { role: 'assistant', content: response.answer };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } else {
            response = await aiScriptureReflection({ versePassage: passage, userContext: input });
             if (response.reflectionContent) {
                const assistantMessage: Message = { role: 'assistant', content: `**${response.reflectionTitle}**\n\n${response.reflectionContent}` };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        }
    } catch (error) {
        console.error('AI Error:', error);
        toast({ title: 'AI Error', description: 'Failed to get a response from the AI.', variant: 'destructive'});
        setMessages(prev => prev.slice(0, -1));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col shadow-xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between border-b">
            <div className='flex items-center gap-4'>
                <div className="flex -space-x-2 overflow-hidden">
                    <Avatar className='h-8 w-8 border-2 border-background'>
                        <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                    <Avatar className='h-8 w-8 border-2 border-background'>
                         <AvatarFallback><Sparkles size={16} className="text-accent"/></AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="text-lg font-serif">Scripture AI</CardTitle>
            </div>
            <div className='flex items-center gap-1 rounded-full bg-muted p-1'>
                 <Button size="sm" variant={mode === 'question' ? 'secondary' : 'ghost'} className='rounded-full h-7 px-3 text-xs' onClick={() => setMode('question')}>Question</Button>
                 <Button size="sm" variant={mode === 'reflection' ? 'secondary' : 'ghost'} className='rounded-full h-7 px-3 text-xs' onClick={() => setMode('reflection')}>Reflection</Button>
            </div>
        </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <Sparkles className="mx-auto h-12 w-12 mb-4 text-primary/50" />
                    <p>Ask a question about a Bible verse or ask for a reflection.</p>
                    <p className='text-sm mt-2'>e.g., "What is the meaning of John 3:16?"</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className='bg-primary/10'><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-xl rounded-lg px-4 py-3', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="w-8 h-8">
                    <AvatarFallback className='bg-primary/10'><Bot className="w-5 h-5 text-primary" /></AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg p-3 bg-secondary flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="space-y-2">
            <Input 
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder="Enter Bible Passage (e.g., John 3:16)"
                className="bg-muted border-0 focus-visible:ring-1"
                disabled={isLoading}
            />
            <div className="flex gap-2">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'question' ? 'Ask a question...' : 'What should the reflection be about? (optional)'}
                    className="flex-1 resize-none bg-muted border-0 focus-visible:ring-1"
                    rows={1}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            handleSubmit(e);
                        }
                    }}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !passage.trim()}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
            </div>
        </form>
      </div>
    </Card>
  );
}
