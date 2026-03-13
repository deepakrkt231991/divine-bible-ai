"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Search, Languages, Loader2, Volume2, Pause, ArrowRight, BookOpen, AlertCircle, Globe 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- LANGUAGE CONFIGURATION ---
const LANGUAGES = [
  { code: 'hin', name: 'Hindi', file: 'hin-hindi-osis.xml', flag: '🇮🇳' },
  { code: 'eng', name: 'English', file: 'eng-web-osis.xml', flag: '🇬🇧' },
  { code: 'spa', name: 'Spanish', file: 'spa-rvr1909.xml', flag: '🇪🇸' },
  { code: 'tam', name: 'Tamil', file: 'tam-irv.xml', flag: '🇮🇳' },
  { code: 'tel', name: 'Telugu', file: 'tel-irv.xml', flag: '🇮🇳' },
  { code: 'fre', name: 'French', file: 'fre-lsg.xml', flag: '🇫🇷' },
  { code: 'ger', name: 'German', file: 'ger-schl2000.xml', flag: '🇩🇪' },
  { code: 'por', name: 'Portuguese', file: 'por-almeida.xml', flag: '🇵🇹' },
];

// --- XML PARSER (Clean Text Extraction) ---
function parseXMLToVerses(xmlText: string, bookName: string, chapterNum: number) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  let verses: { verse: number; text: string }[] = [];
  
  // OSIS format usually uses <div> or <book>
  const books = xmlDoc.getElementsByTagName("div");
  let targetBook: Element | null = null;
  
  const bookSearchNames = [
    bookName.toLowerCase(),
    BIBLE_BOOKS.find(b => b.en.toLowerCase() === bookName.toLowerCase())?.usfm?.toLowerCase() || ""
  ];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const type = book.getAttribute("type");
    if (type !== "book") continue;

    const osisID = book.getAttribute("osisID")?.toLowerCase() || "";
    const nameAttr = book.getAttribute("name")?.toLowerCase() || "";
    
    if (bookSearchNames.some(n => osisID.includes(n) || nameAttr.includes(n))) {
      targetBook = book;
      break;
    }
  }
  
  if (!targetBook) {
    const backupBooks = xmlDoc.getElementsByTagName("book");
    for (let i = 0; i < backupBooks.length; i++) {
      const b = backupBooks[i];
      const id = b.getAttribute("id")?.toLowerCase() || b.getAttribute("name")?.toLowerCase() || "";
      if (bookSearchNames.some(n => id.includes(n))) {
        targetBook = b;
        break;
      }
    }
  }
  
  if (targetBook) {
    const chapters = targetBook.getElementsByTagName("chapter");
    const chapter = Array.from(chapters).find(ch => {
      const osisID = ch.getAttribute("osisID") || "";
      return osisID.endsWith(`.${chapterNum}`) || ch.getAttribute("number") === chapterNum.toString();
    }) || chapters[chapterNum - 1];

    if (chapter) {
      const verseElements = chapter.getElementsByTagName("verse");
      
      for (let i = 0; i < verseElements.length; i++) {
        const verseEl = verseElements[i];
        const verseNumStr = verseEl.getAttribute("osisID")?.split('.').pop() || verseEl.getAttribute("verse") || verseEl.getAttribute("number") || (i + 1).toString();
        const verseNum = parseInt(verseNumStr);
        
        // Clean text logic: Remove Strong's numbers (G1234, H5678)
        let text = verseEl.textContent || "";
        text = text.replace(/\b[G|H]\d+\b/g, ''); // Remove Strong's
        text = text.replace(/\s+/g, ' ').trim(); // Clean spaces
        
        if (text) {
          verses.push({ verse: verseNum, text: text });
        }
      }
    }
  }
  
  return verses;
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const bookParam = searchParams.get('book') || 'GEN';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const langCode = searchParams.get('lang') || 'hin';

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const isHindi = langCode === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toString().toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() || 
    b.hi === bookParam ||
    b.usfm?.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'GEN')!;

  const loadBibleContent = useCallback(async (book: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    
    const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    const bookName = currentBookData.en.toLowerCase();
    
    try {
      const response = await fetch(`/bible/${language.file}`);
      if (!response.ok) throw new Error(`File ${language.file} not found.`);
      
      const xmlText = await response.text();
      const verses = parseXMLToVerses(xmlText, bookName, chapter);
      
      if (verses.length > 0) {
        const html = verses.map(v => 
          `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${v.text}</span></p>`
        ).join("");
        
        setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</div>${html}`);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        throw new Error(`Verses not found for ${bookName} ${chapter}`);
      }
    } catch (e: any) {
      console.error("❌ Reader Error:", e);
      setError(`${currentBookData.hi} ${chapter} load nahi ho paya. Local file check karein.`);
    } finally {
      setLoading(false);
    }
  }, [currentBookData, isHindi]);

  useEffect(() => {
    loadBibleContent(bookParam, chapterNum, langCode);
  }, [bookParam, chapterNum, langCode, loadBibleContent]);

  const handleUpdateNavigation = (newBook: string, newChapter: number, newLang?: string) => {
    setSelectorOpen(false);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', newBook);
      params.set('chapter', newChapter.toString());
      params.set('lang', newLang || langCode);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const toggleAudio = () => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    const text = document.querySelector('.bible-content')?.textContent || "";
    if (!text) return;
    
    const langMap: Record<string, string> = { 'hin': 'hi-IN', 'eng': 'en-US', 'spa': 'es-ES', 'tam': 'ta-IN', 'tel': 'te-IN' };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[langCode] || 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => 
    BIBLE_BOOKS.filter(b => b.testament === testament && 
      (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || b.hi.includes(searchQuery))
    );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 active:scale-95 transition-all">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 italic">
                  {isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-widest font-black mt-1">
                {currentLang.flag} {currentLang.name}
              </span>
            </button>
          </DialogTrigger>

          <DialogContent className="bg-[#09090b] border-white/5 max-h-[85vh] w-[95%] rounded-[2rem]">
            <DialogHeader className="p-6 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" /> Select Book
              </DialogTitle>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 mt-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
            </DialogHeader>
            <Tabs defaultValue="old" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-xl h-12">
                <TabsTrigger value="old" className="flex-1 rounded-lg text-[10px] font-bold">OT</TabsTrigger>
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-lg text-[10px] font-bold">81 BK</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-lg text-[10px] font-bold">NT</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 px-6 py-4">
                {['old', 'deuterocanon', 'new'].map(t => (
                  <TabsContent key={t} value={t} className="grid grid-cols-1 gap-1.5">
                    {filteredBooks(t as any).map(b => (
                      <button key={b.id} onClick={() => handleUpdateNavigation(b.id, 1)} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-left hover:border-emerald-500/30 transition-all flex justify-between items-center">
                        <span className="font-bold text-sm">{isHindi ? b.hi : b.en}</span>
                        <span className="text-[10px] text-zinc-600 font-bold">{b.chapters} Ch</span>
                      </button>
                    ))}
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={langSelectorOpen} onOpenChange={setLangSelectorOpen}>
          <DialogTrigger asChild>
            <button className="size-11 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10">
              <Globe className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 w-[90%] max-w-sm rounded-2xl">
            <DialogHeader><DialogTitle className="text-emerald-500 font-serif text-xl flex items-center gap-3"><Languages className="w-6 h-6" /> Language</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLangSelectorOpen(false); handleUpdateNavigation(bookParam, chapterNum, l.code); }} className={cn("p-4 rounded-xl flex items-center gap-4 border transition-all", langCode === l.code ? "bg-emerald-500/20 border-emerald-500/50" : "bg-zinc-900/40 border-white/5")}>
                  <span className="text-xl">{l.flag}</span><span className="font-bold">{l.name}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-40 hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Loading {currentLang.name} XML...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/30 mb-4" />
            <h3 className="text-xl font-bold text-red-500 mb-2">Error</h3>
            <p className="text-zinc-400 text-sm max-w-md">{error}</p>
            <button onClick={() => loadBibleContent(bookParam, chapterNum, langCode)} className="mt-6 px-6 py-3 bg-emerald-500/20 text-emerald-500 rounded-xl font-bold">Retry</button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bible-content prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="w-full py-12 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center gap-4 hover:border-emerald-500/30 mt-12 transition-all">
              <ArrowRight className="w-8 h-8 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Next Chapter</span>
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-50">
        <div className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-2xl">
          <button onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} className="size-9 rounded-full flex items-center justify-center text-zinc-600 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={toggleAudio} className="flex-1 mx-2 bg-emerald-500 text-black py-2.5 rounded-full flex items-center justify-center gap-2 shadow-lg">
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isPlaying ? 'Stop' : 'Suniye'}</span>
          </button>
          <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="size-9 rounded-full flex items-center justify-center text-zinc-600 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .verse-num { font-weight: 900; color: #10b981 !important; margin-right: 10px; font-size: 0.7em; opacity: 0.8; }
        .bible-content .verse-text, .bible-content p { margin-bottom: 1.2rem; line-height: 1.8; font-family: 'Playfair Display', serif; color: #e4e4e7 !important; font-size: 1.1rem; }
        .bible-content .chapter-title { font-size: 1.5rem; color: #10b981; font-weight: bold; margin-bottom: 1.5rem; border-left: 4px solid #10b981; padding-left: 1rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#09090b]"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>}>
      <ReaderContent />
    </Suspense>
  );
}