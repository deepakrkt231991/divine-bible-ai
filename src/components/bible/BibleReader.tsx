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

  const [selectedBible, setSelectedBible] = useState("3034"); // BSB - Reliable default
  const [selectedBook, setSelectedBook] = useState("GEN");
  const [selectedChapter, setSelectedChapter] = useState("GEN.1");

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load Bibles
  useEffect(() => {
    setLoading(true);
    getBibles().then(list => {
      setBibles(list);
      setLoading(false);
    }).catch(() => {
      toast({ variant: "destructive", title: "Error", description: "Bible versions load nahi hue" });
      setLoading(false);
    });
  }, []);

  // Load Books
  useEffect(() => {
    if (!selectedBible) return;
    setLoading(true);
    getBooks(selectedBible).then(list => {
      setBooks(list);
    }).catch(() => toast({ variant: "destructive", description: "Books nahi load hue" })).finally(() => setLoading(false));
  }, [selectedBible]);

  // Load Chapters
  useEffect(() => {
    if (!selectedBible || !selectedBook) return;
    setLoading(true);
    getChapters(selectedBible, selectedBook).then(list => {
      setChapters(Array.isArray(list) ? list : []);
    }).catch(() => toast({ variant: "destructive", description: "Chapters nahi load hue" })).finally(() => setLoading(false));
  }, [selectedBible, selectedBook]);

  // Load Passage
  useEffect(() => {
    if (!selectedBible || !selectedChapter) return;
    
    const loadPassage = async () => {
      setLoading(true);
      try {
        // Temporary debug test
        if (selectedChapter === "JHN.3.16") {
            const test = await getPassage("3034", "JHN.3.16");
            console.log("Test JHN.3.16:", test);
        }
        
        console.log("Fetching passage for Bible:", selectedBible, "Passage:", selectedChapter);
        const data = await getPassage(selectedBible, selectedChapter);
        setPassage(data);
      } catch (error) {
        toast({ variant: "destructive", description: "Passage nahi mila" });
      } finally {
        setLoading(false);
      }
    };
    
    loadPassage();
  }, [selectedBible, selectedChapter]);

  if (loading && bibles.length === 0) {
    return <div className="text-center p-10">Loading Bible data... 🙏</div>;
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <CardTitle className="text-3xl font-serif text-center">📖 Read the Bible</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select value={selectedBible} onValueChange={setSelectedBible}>
            <SelectTrigger><SelectValue placeholder="Bible Version" /></SelectTrigger>
            <SelectContent>
              {bibles.map(b => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.nameLocal || b.name} ({b.abbreviationLocal || b.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger><SelectValue placeholder="Book" /></SelectTrigger>
            <SelectContent>
              {books.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
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
              {loading ? <Skeleton className="h-40 w-full" /> : "Select Bible, Book & Chapter to read"}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
