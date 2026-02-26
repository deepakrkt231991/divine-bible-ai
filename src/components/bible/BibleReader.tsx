"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBibles, getPassage, getBooks, getChapters } from "@/lib/youversion";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BibleReader() {
  const [bibles, setBibles] = useState<any[]>([]);
  const [selectedBible, setSelectedBible] = useState<string>("3034"); // BSB - Always working default
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("GEN");
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>("GEN.1");
  const [verseData, setVerseData] = useState<any>(null);
  const [loading, setLoading] = useState({ bibles: true, books: false, chapters: false, verse: false });
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

  // Load Books
  useEffect(() => {
    if (!selectedBible) return;
    const loadBooks = async () => {
      setLoading(prev => ({ ...prev, books: true }));
      try {
        const list = await getBooks(selectedBible);
        const safeList = Array.isArray(list) ? list : [];
        setBooks(safeList);
        // Don't auto-reset if we already have a selection
        if (safeList.length > 0 && !selectedBook) {
          setSelectedBook(safeList[0].id);
        }
      } catch (e) {
        setBooks([]);
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    };
    loadBooks();
  }, [selectedBible]);

  // Load Chapters
  useEffect(() => {
    if (!selectedBible || !selectedBook) return;
    const loadChapters = async () => {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const list = await getChapters(selectedBible, selectedBook);
        const safeList = Array.isArray(list) ? list : [];
        setChapters(safeList);
        if (safeList.length > 0 && (!selectedChapter || !selectedChapter.startsWith(selectedBook))) {
          setSelectedChapter(safeList[0].id);
        }
      } catch (e) {
        setChapters([]);
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    };
    loadChapters();
  }, [selectedBible, selectedBook]);

  // Load Verse Content
  const loadPassageContent = useCallback(async (usfm: string) => {
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
  }, [selectedBible]);

  // Trigger content load when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      loadPassageContent(selectedChapter);
    }
  }, [selectedChapter, loadPassageContent]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-4 bg-zinc-900 border-zinc-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bible Selector */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Version</label>
            <Select value={selectedBible} onValueChange={(val) => { setSelectedBible(val); setSelectedBook(""); setSelectedChapter(""); }}>
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

          {/* Book Selector */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Book</label>
            <Select value={selectedBook} onValueChange={(val) => { setSelectedBook(val); setSelectedChapter(""); }} disabled={loading.books || books.length === 0}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                {loading.books ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder={books.length === 0 ? "No Books" : "Select Book"} />}
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-zinc-900 border-zinc-700">
                {Array.isArray(books) && books.map((bk) => (
                  <SelectItem key={bk.id} value={bk.id}>
                    {bk.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chapter Selector */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Chapter</label>
            <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={loading.chapters || chapters.length === 0}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                {loading.chapters ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder={chapters.length === 0 ? "No Chapters" : "Select Chapter"} />}
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-zinc-900 border-zinc-700">
                {Array.isArray(chapters) && chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    Chapter {ch.number || ch.id.split('.').pop()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Content Section */}
      <Card className="min-h-[50vh] bg-zinc-900 border-zinc-800 overflow-hidden relative">
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
                  <div className="bg-zinc-800 px-3 py-1 rounded text-[10px] text-zinc-400 font-mono uppercase">
                    {selectedChapter}
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
                <p className="text-lg font-serif italic">Select a chapter to read.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
