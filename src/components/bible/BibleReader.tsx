'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBibles, getBooks, getChapters, getPassage } from "@/lib/youversion";
import { useToast } from "@/hooks/use-toast";

export default function BibleReader() {
  const [bibles, setBibles] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [passage, setPassage] = useState<any>(null);

  const [selectedBible, setSelectedBible] = useState("3034"); // Default: BSB
  const [selectedBook, setSelectedBook] = useState("GEN");
  const [selectedChapter, setSelectedChapter] = useState("GEN.1");

  const [loading, setLoading] = useState({
    bibles: true,
    books: false,
    chapters: false,
    passage: false
  });
  const { toast } = useToast();

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(prev => ({ ...prev, bibles: true }));
      try {
        const list = await getBibles();
        setBibles(Array.isArray(list) ? list : []);
        
        // Debug test JHN.3.16
        const test = await getPassage("3034", "JHN.3.16");
        console.log("Debug Test JHN.3.16:", test);
      } catch (e) {
        toast({ variant: "destructive", title: "API Error", description: "Bibles load nahi hui" });
      } finally {
        setLoading(prev => ({ ...prev, bibles: false }));
      }
    };
    init();
  }, [toast]);

  // Load Books
  useEffect(() => {
    if (!selectedBible) return;
    setLoading(prev => ({ ...prev, books: true }));
    getBooks(selectedBible).then(list => {
      setBooks(Array.isArray(list) ? list : []);
    }).finally(() => setLoading(prev => ({ ...prev, books: false })));
  }, [selectedBible]);

  // Load Chapters
  useEffect(() => {
    if (!selectedBible || !selectedBook) return;
    setLoading(prev => ({ ...prev, chapters: true }));
    getChapters(selectedBible, selectedBook).then(list => {
      setChapters(Array.isArray(list) ? list : []);
      if (Array.isArray(list) && list.length > 0) {
        setSelectedChapter(list[0].id);
      }
    }).finally(() => setLoading(prev => ({ ...prev, chapters: false })));
  }, [selectedBible, selectedBook]);

  // Load Passage
  useEffect(() => {
    if (!selectedBible || !selectedChapter) return;
    setLoading(prev => ({ ...prev, passage: true }));
    getPassage(selectedBible, selectedChapter).then(data => {
      setPassage(data);
    }).finally(() => setLoading(prev => ({ ...prev, passage: false })));
  }, [selectedBible, selectedChapter]);

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-20">
        <CardTitle className="text-2xl font-serif text-emerald-500 text-center mb-4">📖 Holy Scriptures</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={selectedBible} onValueChange={setSelectedBible} disabled={loading.bibles}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue placeholder="Version" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {Array.isArray(bibles) && bibles.length > 0 ? (
                bibles.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.nameLocal || b.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={selectedBook} onValueChange={setSelectedBook} disabled={loading.books}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue placeholder="Book" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {Array.isArray(books) && books.length > 0 ? (
                books.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={loading.chapters}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue placeholder="Chapter" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {Array.isArray(chapters) && chapters.length > 0 ? (
                chapters.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.number}</SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>No chapters</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[65vh] p-6">
          {loading.passage ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
              <Skeleton className="h-4 w-5/6 bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
            </div>
          ) : passage ? (
            <div className="prose prose-invert max-w-none prose-emerald prose-p:leading-relaxed prose-p:text-zinc-300">
              <h2 className="text-3xl font-serif text-white mb-6 border-b border-zinc-800 pb-2">
                {typeof passage.reference === 'string' ? passage.reference : (passage.reference?.human || selectedChapter)}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: passage.content || "<p>No content available.</p>" }} />
              {passage.copyright && <p className="text-[10px] text-zinc-500 mt-12 italic">{passage.copyright}</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
              <p>Selection kijiye scripture padhne ke liye.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
