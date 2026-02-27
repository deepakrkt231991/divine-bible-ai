"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getBibles, getPassage } from "@/lib/youversion";
import { BookOpen, Loader2, Search, Settings2, Minus, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function BibleReader() {
  const [selectedBible, setSelectedBible] = useState<string>("3034");
  const [verseInput, setVerseInput] = useState<string>("JHN.3.16");
  const [verseData, setVerseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const [showSettings, setShowSettings] = useState(false);

  const loadPassageContent = useCallback(async (usfmOverride?: string) => {
    const usfm = usfmOverride || verseInput;
    if (!selectedBible || !usfm) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPassage(selectedBible, usfm);
      setVerseData(data);
    } catch (e: any) {
      setError("Scripture load karne mein dikkat aa rahi hai.");
    } finally {
      setLoading(false);
    }
  }, [selectedBible, verseInput]);

  useEffect(() => {
    loadPassageContent("JHN.3.16");
  }, [loadPassageContent]);

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 space-y-6">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              value={verseInput}
              onChange={(e) => setVerseInput(e.target.value)}
              placeholder="e.g., JHN.3.16"
              className="bg-zinc-900/50 border-none rounded-2xl pl-10 focus-visible:ring-primary/50"
              onKeyDown={(e) => e.key === 'Enter' && loadPassageContent()}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-2xl border-white/5 bg-zinc-900/50"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className={cn("w-4 h-4", showSettings && "text-primary")} />
          </Button>
        </div>

        {/* Font Settings Overlay */}
        {showSettings && (
          <Card className="glass mt-4 p-6 rounded-[2rem] border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-primary uppercase tracking-widest">Reading Options</span>
                <span className="text-xs text-zinc-500">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Minus className="w-4 h-4 text-zinc-500" />
                <Slider 
                  value={[fontSize]} 
                  onValueChange={(val) => setFontSize(val[0])} 
                  min={16} 
                  max={42} 
                  step={1} 
                  className="flex-1"
                />
                <Plus className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Reader Content */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-zinc-500 font-serif italic text-lg animate-pulse">Vachan load ho raha hai...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="p-6 bg-red-500/10 rounded-full inline-block">
              <BookOpen className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-red-400 font-medium text-lg">⚠️ {error}</p>
            <Button variant="link" onClick={() => loadPassageContent()} className="text-primary">Try Again</Button>
          </div>
        ) : verseData ? (
          <article className="prose prose-invert max-w-none">
            <div className="mb-12">
              <h1 className="text-4xl font-bold font-serif text-primary m-0 leading-tight">
                {verseData.reference}
              </h1>
              <div className="h-1 w-12 bg-primary mt-4 rounded-full" />
            </div>
            
            <div 
              style={{ fontSize: `${fontSize}px` }}
              className="font-serif leading-relaxed text-zinc-200 selection:bg-primary/20 transition-[font-size]"
              dangerouslySetInnerHTML={{ __html: verseData.content }}
            />
            
            {verseData.copyright && (
              <p className="mt-16 text-[10px] text-zinc-600 uppercase tracking-widest border-t border-white/5 pt-8">
                {verseData.copyright}
              </p>
            )}
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
            <BookOpen className="w-20 h-20 mb-6" />
            <p className="text-xl font-serif italic">Enter USFM format (e.g., GEN.1) to start reading.</p>
          </div>
        )}
      </div>
    </div>
  );
}