'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getBibles, getBooks, getChapters, getPassage } from "@/lib/youversion";
import type { Bible, Book, Chapter, Passage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Terminal } from "lucide-react";

export default function BibleReader() {
    const [bibles, setBibles] = useState<Bible[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [passage, setPassage] = useState<Passage | null>(null);

    const [selectedBible, setSelectedBible] = useState<string>('59'); // Default to ESV
    const [selectedBook, setSelectedBook] = useState<string>('GEN');
    const [selectedChapter, setSelectedChapter] = useState<string>('GEN.1');
    
    const [loading, setLoading] = useState({
        bibles: true,
        books: true,
        chapters: true,
        passage: true
    });
    const [apiKeyMissing, setApiKeyMissing] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_YOUVERSION_KEY) {
            setApiKeyMissing(true);
            setLoading({ bibles: false, books: false, chapters: false, passage: false });
            return;
        }

        async function fetchBibles() {
            setLoading(l => ({...l, bibles: true}));
            try {
                const data = await getBibles();
                setBibles(data);
                const defaultBible = data.find(b => b.id.toString() === '59') || data.find(b => b.id.toString() === '1') || data[0];
                if (defaultBible) {
                    setSelectedBible(defaultBible.id.toString());
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Could not fetch Bible versions.", variant: "destructive"});
            } finally {
                setLoading(l => ({...l, bibles: false}));
            }
        }
        fetchBibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedBible || apiKeyMissing) return;
        async function fetchBooks() {
            setLoading(l => ({...l, books: true, chapters: true, passage: true}));
            try {
                const data = await getBooks(selectedBible);
                setBooks(data);
                if(data.length > 0 && !data.some(b => b.id === selectedBook)) {
                    setSelectedBook(data[0].id);
                    setSelectedChapter(`${data[0].id}.1`);
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Could not fetch books for this Bible.", variant: "destructive"});
            } finally {
                setLoading(l => ({...l, books: false}));
            }
        }
        fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBible, apiKeyMissing]);

    useEffect(() => {
        if (!selectedBible || !selectedBook || apiKeyMissing) return;
        async function fetchChapters() {
            setLoading(l => ({...l, chapters: true, passage: true}));
            try {
                const data = await getChapters(selectedBible, selectedBook);
                setChapters(data);
                 if(data.length > 0 && !data.some(c => c.id === selectedChapter)) {
                   setSelectedChapter(data[0].id);
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Could not fetch chapters for this book.", variant: "destructive"});
            } finally {
                setLoading(l => ({...l, chapters: false}));
            }
        }
        fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBible, selectedBook, apiKeyMissing]);

    useEffect(() => {
        if (!selectedBible || !selectedChapter || apiKeyMissing) return;
        async function fetchPassage() {
            setLoading(l => ({...l, passage: true}));
            setPassage(null);
            try {
                const data = await getPassage(selectedBible, selectedChapter);
                setPassage(data);
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Could not fetch the passage.", variant: "destructive"});
            } finally {
                setLoading(l => ({...l, passage: false}));
            }
        }
        fetchPassage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBible, selectedChapter, apiKeyMissing]);
    
    if (apiKeyMissing) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>YouVersion API Key Missing</AlertTitle>
                    <AlertDescription>
                        The Bible reader is disabled because the <code>NEXT_PUBLIC_YOUVERSION_KEY</code> is not set in your environment variables. Please add it to your <code>.env</code> file to enable this feature.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-0 shadow-none bg-transparent">
            <CardHeader className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 -mx-6 px-6 pt-6 pb-4 md:top-0">
                <CardTitle className="text-3xl font-serif text-center">Read the Bible</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <Select value={selectedBible} onValueChange={setSelectedBible} disabled={loading.bibles}>
                        <SelectTrigger className="w-full">{loading.bibles ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Select Bible" />}</SelectTrigger>
                        <SelectContent>
                            {bibles.map(bible => <SelectItem key={bible.id} value={bible.id.toString()}>{bible.nameLocal} ({bible.abbreviationLocal})</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={selectedBook} onValueChange={setSelectedBook} disabled={loading.books}>
                        <SelectTrigger className="w-full">{loading.books ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Select Book" />}</SelectTrigger>
                        <SelectContent className="max-h-72">
                           {books.map(book => <SelectItem key={book.id} value={book.id}>{book.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={loading.chapters}>
                        <SelectTrigger className="w-full">{loading.chapters ? <Skeleton className="h-5 w-full" /> : <SelectValue placeholder="Select Chapter" />}</SelectTrigger>
                        <SelectContent className="max-h-72">
                            {Array.isArray(chapters) && chapters.length > 0 ? (
                                chapters.map(chapter => (
                                <SelectItem key={chapter.id} value={chapter.id}>
                                    {chapter.number}
                                </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="loading" disabled>
                                No chapters available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <ScrollArea className="h-[calc(100vh-22rem)] md:h-[calc(100vh-18rem)] pr-4 -mr-4">
                {loading.passage ? (
                    <div className="space-y-4 mt-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-full mt-4" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                ) : (
                    passage && (
                        <div>
                            <h2 className="text-2xl font-serif mb-4">{typeof passage.reference === 'string' ? passage.reference : passage.reference.human}</h2>
                            <div 
                                className="prose-xl dark:prose-invert font-serif max-w-none 
                                           [&_h3]:font-serif [&_h3]:text-accent [&_h3]:mb-2
                                           [&_p]:mb-4
                                           [&_.v]:font-bold [&_.v]:pr-2 [&_.v]:text-primary
                                           "
                                dangerouslySetInnerHTML={{ __html: passage.content }} 
                            />
                            <p className='text-xs text-muted-foreground mt-8'>{passage.copyright}</p>
                        </div>
                    )
                )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
