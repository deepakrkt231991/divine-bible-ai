"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getPassage } from "@/lib/youversion";
import { BookOpen, Loader2, Search, Settings2, Minus, Plus, ArrowLeft } from "lucide-react";
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
    <div className="max-w-3xl mx-auto pb-32 px-4 space-y-8">
      {/* Header Controls */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-serif italic text-primary">Read Bible</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("rounded-full", showSettings && "bg-primary/10 text-primary")}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              value={verseInput}
              onChange={(e) => setVerseInput(e.target.value)}
              placeholder="e.g., JHN.3.16"
              className="bg-zinc-900 border-none rounded-2xl pl-12 h-12 focus-visible:ring-primary/30"
              onKeyDown={(e) => e.key === 'Enter' && loadPassageContent()}
            />
          </div>
          <Button 
            onClick={() => loadPassageContent()}
            className="rounded-2xl h-12 px-6 bg-primary hover:bg-emerald-400 text-zinc-950 font-bold"
          >
            Search
          </Button>
        </div>

        {/* Font Settings Overlay */}
        {showSettings && (
          <Card className="bg-zinc-900 mt-4 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Reading Settings</span>
                <span className="text-xs font-bold text-zinc-500">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-6">
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
      <div className="space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-zinc-500 font-serif italic text-xl animate-pulse">Vachan load ho raha hai...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 space-y-6">
            <div className="p-8 bg-red-500/10 rounded-full inline-block">
              <BookOpen className="w-16 h-16 text-red-500/50" />
            </div>
            <p className="text-red-400 font-medium text-lg">⚠️ {error}</p>
            <Button variant="link" onClick={() => loadPassageContent()} className="text-primary font-bold">Try Again</Button>
          </div>
        ) : verseData ? (
          <article className="prose prose-invert max-w-none">
            <div className="mb-12">
              <h1 className="text-5xl font-bold font-serif italic text-primary m-0 leading-tight">
                {verseData.reference}
              </h1>
              <div className="h-1.5 w-16 bg-primary mt-6 rounded-full opacity-50" />
            </div>
            
            <div 
              style={{ fontSize: `${fontSize}px` }}
              className="font-serif leading-[1.8] text-zinc-200 selection:bg-primary/20 transition-all duration-300"
              dangerouslySetInnerHTML={{ __html: verseData.content }}
            />
            
            {verseData.copyright && (
              <p className="mt-20 text-[10px] text-zinc-600 uppercase font-black tracking-[0.2em] border-t border-white/5 pt-10 text-center">
                {verseData.copyright}
              </p>
            )}
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center opacity-20">
            <BookOpen className="w-24 h-24 mb-8" />
            <p className="text-2xl font-serif italic">Search a verse to start reading</p>
          </div>
        )}
      </div>
    </div>
  );
}