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

  const [selectedBible, setSelectedBible] = useState("3034"); // BSB - Default safe ID
  const [selectedBook, setSelectedBook] = useState("GEN");
  const [selectedChapter, setSelectedChapter] = useState("GEN.1");

  const [loading, setLoading] = useState({
    bibles: true,
    books: false,
    chapters: false,
    passage: false
  });
  const { toast } = useToast();

  // Load Bibles on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, bibles: true }));
    getBibles().then(list => {
      setBibles(Array.isArray(list) ? list : []);
      setLoading(prev => ({ ...prev, bibles: false }));
    }).catch(() => {
      toast({ variant: "destructive", title: "Error", description: "Bible versions load nahi hue" });
      setLoading(prev => ({ ...prev, bibles: false }));
    });
  }, [toast]);

  // Load Books when Bible changes
  useEffect(() => {
    if (!selectedBible) return;
    setLoading(prev => ({ ...prev, books: true }));
    getBooks(selectedBible).then(list => {
      const bookList = Array.isArray(list) ? list : [];
      setBooks(bookList);
      if (bookList.length > 0 && !bookList.find((b: any) => b.id === selectedBook)) {
        setSelectedBook(bookList[0].id);
      }
    }).catch(() => toast({ variant: "destructive", description: "Books load nahi hue" }))
    .finally(() => setLoading(prev => ({ ...prev, books: false })));
  }, [selectedBible, selectedBook, toast]);

  // Load Chapters when Book changes
  useEffect(() => {
    if (!selectedBible || !selectedBook) return;
    setLoading(prev => ({ ...prev, chapters: true }));
    getChapters(selectedBible, selectedBook).then(list => {
      const chapterList = Array.isArray(list) ? list : [];
      setChapters(chapterList);
      if (chapterList.length > 0) {
        setSelectedChapter(chapterList[0].id);
      }
    }).catch(() => toast({ variant: "destructive", description: "Chapters load nahi hue" }))
    .finally(() => setLoading(prev => ({ ...prev, chapters: false })));
  }, [selectedBible, selectedBook, toast]);

  // Load Passage when Chapter changes
  useEffect(() => {
    if (!selectedBible || !selectedChapter) return;
    
    const loadPassage = async () => {
      setLoading(prev => ({ ...prev, passage: true }));
      try {
        const data = await getPassage(selectedBible, selectedChapter);
        setPassage(data);
      } catch (error) {
        toast({ variant: "destructive", description: "Passage load nahi ho saka" });
      } finally {
        setLoading(prev => ({ ...prev, passage: false }));
      }
    };
    
    loadPassage();
  }, [selectedBible, selectedChapter, toast]);

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <CardTitle className="text-3xl font-serif text-center">📖 Read the Bible</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select value={selectedBible} onValueChange={setSelectedBible} disabled={loading.bibles}>
            <SelectTrigger><SelectValue placeholder="Bible Version" /></SelectTrigger>
            <SelectContent>
              {Array.isArray(bibles) && bibles.length > 0 ? (
                bibles.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.nameLocal || b.name} ({b.abbreviationLocal || b.abbreviation})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No versions found</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={selectedBook} onValueChange={setSelectedBook} disabled={loading.books || bibles.length === 0}>
            <SelectTrigger><SelectValue placeholder="Book" /></SelectTrigger>
            <SelectContent>
              {Array.isArray(books) && books.length > 0 ? (
                books.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No books found</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={loading.chapters || books.length === 0}>
            <SelectTrigger><SelectValue placeholder="Chapter" /></SelectTrigger>
            <SelectContent>
              {Array.isArray(chapters) && chapters.length > 0 ? (
                chapters.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.number}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No chapters available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <ScrollArea className="h-[60vh]">
          {passage ? (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl mb-4">{passage.reference || selectedChapter}</h2>
              <div dangerouslySetInnerHTML={{ __html: passage.content || "No content available" }} />
              <p className="text-xs text-muted-foreground mt-4">{passage.copyright || ""}</p>
            </div>
          ) : (
            <div className="text-center text-zinc-400 py-10">
              {loading.passage ? <Skeleton className="h-40 w-full" /> : "Select Bible, Book & Chapter to read"}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
