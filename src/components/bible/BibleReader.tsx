'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBibles, getBooks, getChapters, getPassage } from "@/lib/youversion";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, RefreshCw } from "lucide-react";

export default function BibleReader() {
  const [bibles, setBibles] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [passage, setPassage] = useState<any>(null);

  const [selectedBible, setSelectedBible] = useState<string>("3034"); // Best default: BSB
  const [selectedBook, setSelectedBook] = useState<string>("GEN");
  const [selectedChapter, setSelectedChapter] = useState<string>("GEN.1");

  const [loading, setLoading] = useState({
    bibles: true,
    books: false,
    chapters: false,
    passage: false,
  });

  const { toast } = useToast();

  // 1. Load all Bibles (with Hindi priority)
  useEffect(() => {
    async function loadBibles() {
      try {
        const data = await getBibles();
        setBibles(data);

        // Auto select good Hindi/English Bible
        const hindiBible = data.find((b: any) => b.language?.tag === "hi" || b.abbreviationLocal?.includes("Hindi"));
        if (hindiBible) setSelectedBible(hindiBible.id.toString());
        else setSelectedBible("3034"); // fallback BSB
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Bible versions load nahi ho paaye", variant: "destructive" });
      } finally {
        setLoading(prev => ({ ...prev, bibles: false }));
      }
    }
    loadBibles();
  }, []);

  // 2. Load Books when Bible changes
  useEffect(() => {
    if (!selectedBible) return;
    async function loadBooks() {
      setLoading(prev => ({ ...prev, books: true, chapters: true, passage: true }));
      try {
        const data = await getBooks(selectedBible);
        setBooks(data);
        if (data && data.length > 0) {
          setSelectedBook(data[0].id);
          setSelectedChapter(`${data[0].id}.1`);
        } else {
          setBooks([]);
          setSelectedBook("");
        }
      } catch (err) {
        toast({ title: "Error", description: "Books nahi load hue", variant: "destructive" });
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
      setLoading(prev => ({ ...prev, chapters: true, passage: true }));
      try {
        const data = await getChapters(selectedBible, selectedBook);
        setChapters(data);
        if (data && data.length > 0) {
          setSelectedChapter(data[0].id);
        } else {
          setChapters([]);
          setSelectedChapter("");
        }
      } catch (err) {
        toast({ title: "Error", description: "Chapters nahi load hue", variant: "destructive" });
        setChapters([]);
      } finally {
        setLoading(prev => ({ ...prev, chapters: false }));
      }
    }
    loadChapters();
  }, [selectedBible, selectedBook]);

  // 4. Load Passage when Chapter changes
  useEffect(() => {
    if (!selectedBible || !selectedChapter) return;
    async function loadPassage() {
      setLoading(prev => ({ ...prev, passage: true }));
      setPassage(null);
      try {
        const data = await getPassage(selectedBible, selectedChapter);
        setPassage(data);
      } catch (err) {
        toast({ title: "Error", description: "Verse load nahi ho paaya", variant: "destructive" });
      } finally {
        setLoading(prev => ({ ...prev, passage: false }));
      }
    }
    loadPassage();
  }, [selectedBible, selectedChapter]);

  // Refresh button
  const refreshAll = () => window.location.reload();

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none bg-transparent">
      <CardHeader className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-20 -mx-6 px-6 pt-6 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-serif">📖 Read the Bible</CardTitle>
          <button onClick={refreshAll} className="text-emerald-400 hover:text-emerald-300">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Bible Select */}
          <Select value={selectedBible} onValueChange={setSelectedBible} disabled={loading.bibles}>
            <SelectTrigger>{loading.bibles ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Bible Version" />}</SelectTrigger>
            <SelectContent className="max-h-80">
              {bibles.map((b: any) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.nameLocal} ({b.abbreviationLocal}) - {b.language?.tag?.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Book Select */}
          <Select value={selectedBook} onValueChange={setSelectedBook} disabled={loading.books}>
            <SelectTrigger>{loading.books ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Book" />}</SelectTrigger>
            <SelectContent className="max-h-80">
              {Array.isArray(books) && books.map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Chapter Select */}
          <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={loading.chapters}>
            <SelectTrigger>{loading.chapters ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Chapter" />}</SelectTrigger>
            <SelectContent className="max-h-80">
              {Array.isArray(chapters) && chapters.length > 0 ? (
                chapters.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    Chapter {c.number}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no" disabled>No chapters</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <ScrollArea className="h-[calc(100vh-22rem)] md:h-[calc(100vh-18rem)] pr-4">
          {loading.passage ? (
            <div className="space-y-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : passage ? (
            <div className="prose-xl dark:prose-invert font-serif leading-relaxed">
              <h2 className="text-3xl font-serif mb-6 text-emerald-400">
                {passage.reference || passage.id}
              </h2>
              <div 
                className="text-zinc-100 text-[1.1rem] leading-relaxed [&_.v]:font-bold [&_.v]:text-emerald-400"
                dangerouslySetInnerHTML={{ __html: passage.content }}
              />
              {passage.copyright && (
                <p className="text-xs text-zinc-500 mt-12 border-t border-zinc-800 pt-4">
                  {passage.copyright}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-400">Select Bible, Book & Chapter</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
