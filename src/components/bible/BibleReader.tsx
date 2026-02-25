'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBibles, getBooks, getChapters, getPassage } from "@/lib/youversion";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, BookOpen } from "lucide-react";

export default function BibleReader() {
  const [bibles, setBibles] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [passage, setPassage] = useState<any>(null);

  // Default to 3034 (Berean Standard Bible) as it's known to work
  const [selectedBible, setSelectedBible] = useState<string>("3034");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const [loading, setLoading] = useState({
    bibles: true,
    books: false,
    chapters: false,
    passage: false,
  });

  const { toast } = useToast();

  // 1. Initial Load: Bibles
  useEffect(() => {
    async function loadBibles() {
      setLoading(prev => ({ ...prev, bibles: true }));
      try {
        const data = await getBibles();
        setBibles(data);
        // Ensure default is selected if available
        if (!selectedBible && data.length > 0) {
            setSelectedBible(data[0].id.toString());
        }
      } catch (err) {
        toast({ title: "Error", description: "Bible versions load nahi ho paaye. Please refresh.", variant: "destructive" });
      } finally {
        setLoading(prev => ({ ...prev, bibles: false }));
      }
    }
    loadBibles();
  }, [toast]);

  // 2. Load Books when Bible changes
  useEffect(() => {
    if (!selectedBible) return;
    async function loadBooks() {
      setLoading(prev => ({ ...prev, books: true }));
      try {
        const data = await getBooks(selectedBible);
        setBooks(data);
        if (data && data.length > 0 && !selectedBook) {
          setSelectedBook(data[0].id);
        }
      } catch (err) {
        console.error("Books load error:", err);
      } finally {
        setLoading(prev => ({ ...prev, books: false }));
      }
    }
    loadBooks();
  }, [selectedBible]);

  // 3. Load Chapters when Book changes
  useEffect(() => {
    if (!selectedBible || !selectedBook) return;
    async function loadChapters() {
      setLoading(prev => ({ ...prev, chapters: true }));
      try {
        const data = await getChapters(selectedBible, selectedBook);
        setChapters(data);
        if (data && data.length > 0) {
          setSelectedChapter(data[0].id);
        } else {
          setSelectedChapter("");
        }
      } catch (err) {
        toast({ title: "Error", description: "Is book ke chapters nahi mil paye.", variant: "destructive" });
        setChapters([]);
        setSelectedChapter("");
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    }
    loadChapters();
  }, [selectedBible, selectedBook, toast]);

  // 4. Load Content when Chapter changes
  useEffect(() => {
    if (!selectedBible || !selectedChapter) return;
    async function loadPassage() {
      console.log("🔍 Fetching passage for Bible:", selectedBible, "Passage:", selectedChapter);
      setLoading(prev => ({ ...prev, passage: true }));
      try {
        const data = await getPassage(selectedBible, selectedChapter);
        setPassage(data);
      } catch (err) {
        console.error("Passage load error:", err);
      } finally {
        setLoading(prev => ({ ...prev, passage: false }));
      }
    }
    loadPassage();
  }, [selectedBible, selectedChapter]);

  const handleBibleChange = (val: string) => {
    setSelectedBible(val);
    setSelectedBook("");
    setSelectedChapter("");
    setBooks([]);
    setChapters([]);
  };

  const handleBookChange = (val: string) => {
    setSelectedBook(val);
    setSelectedChapter("");
    setChapters([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none bg-transparent">
      <CardHeader className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20 -mx-6 px-6 pt-6 pb-4 border-b border-zinc-800">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-3xl font-serif flex items-center gap-3">
            <BookOpen className="text-emerald-500" /> Bible Reader
          </CardTitle>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bible Version */}
          <Select value={selectedBible} onValueChange={handleBibleChange} disabled={loading.bibles}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              {loading.bibles ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Version" />}
            </SelectTrigger>
            <SelectContent className="max-h-80 bg-zinc-900 border-zinc-800">
              {bibles.map((b: any) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.nameLocal} ({b.abbreviationLocal})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Book */}
          <Select value={selectedBook} onValueChange={handleBookChange} disabled={loading.books || !selectedBible}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              {loading.books ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Book" />}
            </SelectTrigger>
            <SelectContent className="max-h-80 bg-zinc-900 border-zinc-800">
              {books.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Chapter */}
          <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={loading.chapters || !selectedBook}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              {loading.chapters ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Chapter" />}
            </SelectTrigger>
            <SelectContent className="max-h-80 bg-zinc-900 border-zinc-800">
              {Array.isArray(chapters) && chapters.length > 0 ? (
                chapters.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>Chapter {c.number}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No chapters</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
          {loading.passage ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mb-6" />
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : passage ? (
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <h2 className="text-3xl font-serif text-emerald-400 mb-8 pb-4 border-b border-emerald-500/20">
                {passage.reference || passage.id}
              </h2>
              <div 
                className="text-lg font-serif leading-relaxed text-zinc-200 selection:bg-emerald-500/30
                  [&_.v]:font-bold [&_.v]:text-emerald-400 [&_.v]:mr-1
                  [&_p]:mb-4 [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-4"
                dangerouslySetInnerHTML={{ __html: passage.content }}
              />
              {passage.copyright && (
                <div className="mt-12 pt-6 border-t border-zinc-800 text-xs text-zinc-500 italic">
                  {passage.copyright}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p>Please select a Book and Chapter to begin reading.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
