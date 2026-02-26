"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBibles, getPassage } from "@/lib/youversion";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Loader2, Search, PlayCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BibleReader() {
  const [bibles, setBibles] = useState<any[]>([]);
  const [selectedBible, setSelectedBible] = useState<string>("3034"); // BSB - Always working default
  const [verseInput, setVerseInput] = useState<string>("JHN.3.16");
  const [verseData, setVerseData] = useState<any>(null);
  const [loading, setLoading] = useState({ bibles: true, verse: false });
  const [error, setError] = useState<string | null>(null);

  // Load Bibles
  useEffect(() => {
    const loadBibles = async () => {
      try {
        const list = await getBibles();
        const safeList = Array.isArray(list) ? list : [];
        setBibles(safeList);
      } catch (e) {
        setError("Bible versions load nahi ho paaye.");
      } finally {
        setLoading((prev) => ({ ...prev, bibles: false }));
      }
    };
    loadBibles();
  }, []);

  // Load Verse Content
  const loadPassageContent = useCallback(async (usfmOverride?: string) => {
    const usfm = usfmOverride || verseInput;
    if (!selectedBible || !usfm) return;
    setLoading((prev) => ({ ...prev, verse: true }));
    setError(null);
    try {
      const data = await getPassage(selectedBible, usfm);
      setVerseData(data);
    } catch (e: any) {
      setError("Scripture load karne mein dikkat aa rahi hai.");
    } finally {
      setLoading((prev) => ({ ...prev, verse: false }));
    }
  }, [selectedBible, verseInput]);

  // Initial load
  useEffect(() => {
    loadPassageContent("JHN.3.16");
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-4 bg-zinc-900 border-zinc-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bible Selector */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Version</label>
            <Select value={selectedBible} onValueChange={setSelectedBible}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                {loading.bibles ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Select Bible" />}
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-zinc-900 border-zinc-700">
                {Array.isArray(bibles) && bibles.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Verse Input */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Verse (USFM Format)</label>
            <div className="flex gap-2">
              <Input 
                value={verseInput}
                onChange={(e) => setVerseInput(e.target.value)}
                placeholder="e.g., JHN.3.16 or GEN.1"
                className="bg-zinc-800 border-zinc-700"
                onKeyDown={(e) => e.key === 'Enter' && loadPassageContent()}
              />
              <Button onClick={() => loadPassageContent()} disabled={loading.verse} className="bg-emerald-600 hover:bg-emerald-500">
                {loading.verse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Tests */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => { setVerseInput("PSA.23.1"); loadPassageContent("PSA.23.1"); }} className="text-xs border-zinc-700 hover:bg-zinc-800">
            Psalm 23:1
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setVerseInput("GEN.1"); loadPassageContent("GEN.1"); }} className="text-xs border-zinc-700 hover:bg-zinc-800">
            Genesis 1
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setVerseInput("ROM.8.28"); loadPassageContent("ROM.8.28"); }} className="text-xs border-zinc-700 hover:bg-zinc-800">
            Romans 8:28
          </Button>
        </div>
      </Card>

      {/* Content Section */}
      <Card className="min-h-[50vh] bg-zinc-900 border-zinc-800 overflow-hidden relative shadow-2xl">
        <ScrollArea className="h-full max-h-[70vh]">
          <div className="p-8">
            {loading.verse ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 animate-pulse font-serif">Vachan load ho raha hai...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <BookOpen className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-red-400 font-medium">⚠️ {error}</p>
              </div>
            ) : verseData ? (
              <div className="prose prose-invert max-w-none">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                  <h3 className="text-3xl font-serif text-emerald-500 m-0">
                    {verseData.reference || "Holy Scripture"}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-emerald-500">
                      <PlayCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div 
                  className="text-xl leading-relaxed font-serif text-zinc-200"
                  dangerouslySetInnerHTML={{ __html: verseData.content }}
                />
                {verseData.copyright && (
                  <p className="mt-12 text-[10px] text-zinc-500 italic border-t border-zinc-800 pt-4">
                    {verseData.copyright}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <BookOpen className="w-16 h-16 mb-4" />
                <p className="text-lg font-serif italic">USFM format mein verse search kijiye.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
