"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Languages, 
  Loader2, 
  Volume2, 
  Pause, 
  ArrowRight, 
  BookOpen, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

// YouVersion API Configuration
const YOUVERSION_API_KEY = "IUbCPlFtzubFZp2RXPeUglroSB2EGGfCx52N67Xtw8AknzH6";
const BIBLE_ID_HIN = "27931f79a0224647-01"; // Hindi IRV
const BIBLE_ID_ENG = "de4e12af7f29f59f-01"; // English KJV

function parseBibleXML(xmlText: string, bookName: string, chapterNum: number) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  let verses: { verse: number; text: string }[] = [];
  
  // Format 1: Zefania Bible XML (<BIBLE><BOOK><CHAPTER><VERSE>)
  const bookElements = xmlDoc.getElementsByTagName("BOOK");
  for (let i = 0; i < bookElements.length; i++) {
    const bookAttr = bookElements[i].getAttribute("BIBLEBOOK");
    const bookId = bookAttr || bookElements[i].getAttribute("NAME") || "";
    if (bookId.toLowerCase().includes(bookName.toLowerCase()) || i === 0) {
      const chapters = bookElements[i].getElementsByTagName("CHAPTER");
      if (chapters[chapterNum - 1]) {
        const verseElements = chapters[chapterNum - 1].getElementsByTagName("VERSE");
        for (let j = 0; j < verseElements.length; j++) {
          const vNum = verseElements[j].getAttribute("VERSE") || (j + 1);
          const vText = verseElements[j].textContent || "";
          verses.push({ verse: parseInt(vNum.toString()), text: vText.trim() });
        }
        break;
      }
    }
  }
  
  // Format 2: OpenBible XML
  if (verses.length === 0) {
    const books = xmlDoc.getElementsByTagName("book");
    for (let i = 0; i < books.length; i++) {
      const bookAttr = books[i].getAttribute("name") || books[i].getAttribute("id") || "";
      if (bookAttr.toLowerCase().includes(bookName.toLowerCase())) {
        const chapters = books[i].getElementsByTagName("chapter");
        if (chapters[chapterNum - 1]) {
          const verseElements = chapters[chapterNum - 1].getElementsByTagName("verse");
          for (let j = 0; j < verseElements.length; j++) {
            const vNum = verseElements[j].getAttribute("number") || verseElements[j].getAttribute("verse") || (j + 1);
            const vText = verseElements[j].textContent || "";
            verses.push({ verse: parseInt(vNum.toString()), text: vText.trim() });
          }
          break;
        }
      }
    }
  }
  return verses;
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const bookParam = searchParams.get('book') || 'MAT';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const version = searchParams.get('version') || 'hin_irv';
  
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  
  const isHindi = version === 'hin_irv';
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toString().toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() ||
    b.hi === bookParam ||
    b.usfm?.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  const loadBibleContent = useCallback(async (bid: string, cid: number, ver: string) => {
    setLoading(true);
    setError(null);
    setContent("");
    
    try {
      // 1. Try YouVersion API (Premium HTML)
      const bibleId = ver === 'hin_irv' ? BIBLE_ID_HIN : BIBLE_ID_ENG;
      const usfmCode = currentBookData.usfm || bid.substring(0, 3).toUpperCase();
      const chapterId = `${usfmCode}${cid}`;
      const yvUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true`;
      
      const yvRes = await fetch(yvUrl, { headers: { "api-key": YOUVERSION_API_KEY, "Accept": "application/json" } });
      if (yvRes.ok) {
        const yvData = await yvRes.json();
        if (yvData.data?.content) {
          setContent(yvData.data.content);
          setLoading(false);
          return;
        }
      }

      // 2. Try Bolls.life API (Reliable JSON)
      const bollsTrans = ver === 'hin_irv' ? 'HINIRV' : 'KJV';
      const bollsId = currentBookData.bollsId || currentBookData.id;
      const bollsUrl = `https://bolls.life/get-chapter/${bollsTrans}/${bollsId}/${cid}/`;
      
      const bollsRes = await fetch(bollsUrl);
      if (bollsRes.ok) {
        const bollsData = await bollsRes.json();
        if (Array.isArray(bollsData) && bollsData.length > 0) {
          const html = bollsData.map(v => 
            `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${v.text.replace(/<(?:.|\n)*?>/gm, '')}</span></p>`
          ).join("");
          setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</div>${html}`);
          setLoading(false);
          return;
        }
      }

      // 3. Try Local XML Files
      const xmlFiles = ver === 'hin_irv' ? ['/bible/hin-hindi-osis.xml', '/bible/hin-irv.xml'] : ['/bible/eng-web-osis.xml', '/bible/kjv.xml'];
      for (const file of xmlFiles) {
        try {
          const res = await fetch(file);
          if (res.ok) {
            const xmlText = await res.text();
            const verses = parseBibleXML(xmlText, currentBookData.en, cid);
            if (verses.length > 0) {
              const html = verses.map(v => `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${v.text}</span></p>`).join("");
              setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</div>${html}`);
              setLoading(false);
              return;
            }
          }
        } catch (e) { console.warn("Local XML load failed:", file); }
      }

      throw new Error("Vachan load nahi ho paya. Chapter chunein ya internet check karein.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentBookData, isHindi]);

  useEffect(() => {
    loadBibleContent(bookParam, chapterNum, version);
  }, [bookParam, chapterNum, version, loadBibleContent]);

  const handleUpdateNavigation = (newBook: string, newChapter: number, newVersion?: string) => {
    setSelectorOpen(false);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('book', newBook);
      params.set('chapter', newChapter.toString());
      params.set('version', newVersion || version);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const toggleAudio = () => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    const text = document.querySelector('.bible-content')?.textContent || "";
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;
  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => BIBLE_BOOKS.filter(b => 
    b.testament === testament && 
    (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || b.hi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic leading-none">
                  {localizedBookName} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.3em] font-black mt-1.5">{isHindi ? 'Hindi' : 'English'}</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem]">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" /> {isHindi ? "Pustak Chuniye" : "Select Book"}
              </DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500/30" />
              </div>
            </DialogHeader>
            <Tabs defaultValue={currentBookData.testament} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5 h-12">
                <TabsTrigger value="old" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">OT</TabsTrigger>
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Apo</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">NT</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 px-6 py-4">
                {['old', 'deuterocanon', 'new'].map((testament) => (
                  <TabsContent key={testament} value={testament} className="grid grid-cols-1 gap-1.5">
                    {filteredBooks(testament as any).map(b => (
                      <BookItem key={b.id} b={b} currentChapter={chapterNum} isHindi={isHindi} onExpand={setExpandedBook} expandedBook={expandedBook} onSelect={handleUpdateNavigation} />
                    ))}
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>
        <button type="button" onClick={() => handleUpdateNavigation(bookParam, chapterNum, version === 'kjv' ? 'hin_irv' : 'kjv')} className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500"><Languages className="w-5 h-5" /></button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Loading Scripture...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/30 mb-6" />
            <h3 className="text-xl font-bold text-red-500 mb-2">Error!</h3>
            <p className="text-zinc-400 max-w-md">{error}</p>
            <button onClick={() => loadBibleContent(bookParam, chapterNum, version)} className="mt-6 px-6 py-3 bg-emerald-500/20 text-emerald-500 rounded-xl font-bold">Retry</button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="bible-content prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            <button type="button" onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30">
              <ArrowRight className="w-8 h-8 text-emerald-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Read Next Chapter</span>
            </button>
          </div>
        )}
      </main>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-1.5 flex items-center justify-between shadow-2xl">
          <button onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={toggleAudio} className="flex-1 mx-3 flex items-center justify-center gap-3 bg-emerald-500 text-black py-3 rounded-full shadow-xl hover:bg-emerald-400 transition-all">
            {isPlaying ? <Pause className="w-4 h-4 fill-black animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isPlaying ? "Stop" : "Suniye"}</span>
          </button>
          <button onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-600"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .verse-num, .bible-content .v { font-weight: 900; color: #10b981 !important; margin-right: 10px; font-size: 0.75em; opacity: 0.7; }
        .bible-content .verse-text, .bible-content p { margin-bottom: 1.5rem; line-height: 1.8; font-family: 'Playfair Display', serif; font-style: italic; color: #e4e4e7 !important; font-size: 1.1rem; }
        .bible-content .chapter-title, .bible-content h3 { font-size: 1.5rem; color: #10b981; font-family: 'Playfair Display', serif; font-weight: bold; margin-bottom: 1rem; border-left: 4px solid #10b981; padding-left: 1rem; margin-top: 1rem; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function BookItem({ b, expandedBook, currentChapter, isHindi, onExpand, onSelect }: any) {
  const isExpanded = expandedBook === b.id;
  return (
    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
      <button onClick={() => onExpand(isExpanded ? null : b.id)} className={cn("w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none", isExpanded ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xl" : "bg-zinc-900/40 border-white/5 hover:border-emerald-500/20 text-zinc-400")}>
        <div className="flex flex-col items-start text-left"><span className="font-bold text-sm tracking-wide">{isHindi ? b.hi : b.en}</span><span className="text-[9px] uppercase font-black opacity-30 tracking-widest mt-1">{b.chapters} Chapters</span></div>
        <div className={cn("size-2 rounded-full transition-all duration-500", isExpanded ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")} />
      </button>
      {isExpanded && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/60 rounded-[2rem] border border-white/5 shadow-inner mt-2">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
            <button key={ch} onClick={() => onSelect(b.id, ch)} className={cn("size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90", currentChapter === ch ? "bg-emerald-500 text-black shadow-xl" : "bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/5")}>{ch}</button>
          ))}
        </div>
      )}
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
