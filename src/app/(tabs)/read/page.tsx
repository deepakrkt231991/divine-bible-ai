"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
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
  Globe 
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

// --- LANGUAGE CONFIGURATION ---
const LANGUAGES = [
  { code: 'hin', name: 'Hindi', file: 'hin-hindi-osis.xml', flag: '🇮🇳' },
  { code: 'eng', name: 'English', file: 'eng-web-osis.xml', flag: '🇬🇧' },
  { code: 'spa', name: 'Spanish', file: 'spa-rvr1909.xml', flag: '🇪🇸' },
  { code: 'fre', name: 'French', file: 'fre-lsg.xml', flag: '🇫🇷' },
  { code: 'ger', name: 'German', file: 'ger-schl2000.xml', flag: '🇩🇪' },
  { code: 'por', name: 'Portuguese', file: 'por-almeida.xml', flag: '🇵🇹' },
];

// --- XML PARSER (Clean Text Extraction) ---
function parseXMLToVerses(xmlText: string, bookName: string, chapterNum: number) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  let verses: { verse: number; text: string }[] = [];
  
  // Try to find book by different attributes (OSIS, Name, ID)
  const books = xmlDoc.getElementsByTagName("book") || xmlDoc.getElementsByTagName("BOOK");
  let targetBook: Element | null = null;
  
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const nameAttr = (book.getAttribute("name") || book.getAttribute("NAME") || "").toLowerCase();
    const idAttr = (book.getAttribute("id") || book.getAttribute("BIBLEBOOK") || "").toLowerCase();
    const osisAttr = (book.getAttribute("osisID") || "").toLowerCase();
    
    if (nameAttr.includes(bookName.toLowerCase()) || 
        idAttr.includes(bookName.toLowerCase()) ||
        osisAttr.includes(bookName.toLowerCase())) {
      targetBook = book;
      break;
    }
  }
  
  // Fallback: If not found, try by sequence (risky but better than empty)
  if (!targetBook && books.length > 0) {
    // This is a fallback if attributes don't match
  }
  
  if (targetBook) {
    const chapters = targetBook.getElementsByTagName("chapter") || targetBook.getElementsByTagName("CHAPTER");
    
    if (chapters[chapterNum - 1]) {
      const chapter = chapters[chapterNum - 1];
      const verseElements = chapter.getElementsByTagName("verse") || chapter.getElementsByTagName("VERSE");
      
      for (let i = 0; i < verseElements.length; i++) {
        const verseEl = verseElements[i];
        const verseNumAttr = verseEl.getAttribute("verse") || verseEl.getAttribute("VERSE") || verseEl.getAttribute("number");
        const verseNum = parseInt(verseNumAttr || (i + 1).toString());
        
        let text = verseEl.textContent || "";
        
        // 1. Remove Strong's numbers (G1234, H5678, etc.)
        text = text.replace(/\b[G|H]\d+\b/g, '');
        
        // 2. Remove extra formatting numbers that aren't text
        text = text.replace(/\b\d+\b/g, (match, offset) => {
          // Keep numbers if they look like part of text (e.g., at start or after punctuation)
          if (offset === 0 || /[.,;:!?]\s*$/.test(text.substring(0, offset))) {
            return match;
          }
          return '';
        });
        
        // 3. Clean up extra spaces and newlines
        text = text.replace(/\s+/g, ' ').trim();
        
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
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const bookParam = searchParams.get('book') || 'MAT';
  const chapterNum = parseInt(searchParams.get('chapter') || '1');
  const langCode = searchParams.get('lang') || 'hin';

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [langSelectorOpen, setLangSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
  const isHindi = langCode === 'hin';
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBookData = BIBLE_BOOKS.find(b => 
    b.id.toString().toUpperCase() === bookParam.toUpperCase() || 
    b.en.toLowerCase() === bookParam.toLowerCase() || 
    b.hi === bookParam ||
    b.usfm?.toUpperCase() === bookParam.toUpperCase()
  ) || BIBLE_BOOKS.find(b => b.id === 'MAT')!;

  // --- LOAD FROM XML FILES ---
  const loadBibleContent = useCallback(async (bookParam: string, chapter: number, lang: string) => {
    setLoading(true);
    setError(null);
    
    const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    const bookName = currentBookData.en.toLowerCase();
    
    console.log(`📖 Loading XML: ${bookName} ${chapter} from ${language.file}`);
    
    try {
      const response = await fetch(`/bible/${language.file}`);
      
      if (!response.ok) {
        throw new Error(`Bible file '${language.file}' not found in public folder.`);
      }
      
      const xmlText = await response.text();
      const verses = parseXMLToVerses(xmlText, bookName, chapter);
      
      if (verses.length > 0) {
        const html = verses.map(v => 
          `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${v.text}</span></p>`
        ).join("");
        
        setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${chapter}</div>${html}`);
        
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      } else {
        throw new Error(`XML mein '${bookName} ${chapter}' ka data nahi mila.`);
      }
      
    } catch (e: any) {
      console.error("❌ Reader Error:", e);
      setError(`${isHindi ? currentBookData.hi : currentBookData.en} ${chapter} - ${e.message}`);
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
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const text = document.querySelector('.bible-content')?.textContent || "";
    if (!text) return;
    
    const langMap: Record<string, string> = {
      'hin': 'hi-IN', 'eng': 'en-US', 'spa': 'es-ES', 'fre': 'fr-FR', 'ger': 'de-DE', 'por': 'pt-BR'
    };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[langCode] || 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => 
    BIBLE_BOOKS.filter(b => 
      b.testament === testament && 
      (b.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
       b.hi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative">
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-[60]">
        <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic leading-none">
                  {isHindi ? currentBookData.hi : currentBookData.en} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-widest font-black mt-1.5">
                {currentLang.flag} {currentLang.name}
              </span>
            </button>
          </DialogTrigger>

          <DialogContent className="bg-[#09090b] border-white/5 max-h-[85vh] w-[95%] rounded-[2.5rem] shadow-2xl overflow-hidden p-0">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif text-2xl flex items-center gap-3 italic">
                <BookOpen className="w-6 h-6" /> {isHindi ? "Pustak Chuniye" : "Select Scripture"}
              </DialogTitle>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search books..." 
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </DialogHeader>
            
            <Tabs defaultValue={currentBookData.testament} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="bg-zinc-900/50 p-1 mx-6 mt-4 rounded-2xl border border-white/5 h-12">
                <TabsTrigger value="old" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">OT</TabsTrigger>
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">81-Books</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">NT</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1 px-6 py-4">
                {['old', 'deuterocanon', 'new'].map(t => (
                  <TabsContent key={t} value={t} className="m-0 space-y-1.5">
                    {filteredBooks(t as any).map(b => (
                      <BookItem 
                        key={b.id} 
                        b={b} 
                        currentChapter={chapterNum} 
                        isHindi={isHindi} 
                        onExpand={setExpandedBook} 
                        expandedBook={expandedBook} 
                        onSelect={handleUpdateNavigation} 
                      />
                    ))}
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={langSelectorOpen} onOpenChange={setLangSelectorOpen}>
          <DialogTrigger asChild>
            <button className="size-11 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none">
              <Globe className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 w-[90%] max-w-sm rounded-[2.5rem] shadow-2xl p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-emerald-500 font-serif text-xl flex items-center gap-3 italic">
                <Languages className="w-6 h-6" /> {isHindi ? "Bhasha Chuniye" : "Select Language"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "w-full p-4 rounded-2xl flex items-center gap-4 transition-all border outline-none",
                    langCode === lang.code 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                      : 'bg-zinc-900/40 border-white/5 hover:border-emerald-500/30 text-zinc-400'
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-bold text-sm tracking-wide">{lang.name}</span>
                  {langCode === lang.code && <span className="ml-auto text-emerald-500">✓</span>}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* MAIN CONTENT */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-40 opacity-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Syncing {currentLang.name}...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/30 mb-4" />
            <h3 className="text-xl font-bold text-red-500 mb-2">Error!</h3>
            <p className="text-zinc-400 text-sm max-w-md">{error}</p>
            <button 
              onClick={() => loadBibleContent(bookParam, chapterNum, langCode)}
              className="mt-6 px-8 py-3 bg-emerald-500/20 text-emerald-500 rounded-xl font-bold hover:bg-emerald-500/30 transition-all"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div 
              className="bible-content prose prose-invert prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            <div className="pt-20 pb-16">
              <button 
                onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)}
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                <ArrowRight className="w-8 h-8 text-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500">Read Next Chapter</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* COMPACT AUDIO BAR */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[70]">
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))}
            className="size-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={toggleAudio}
            className="flex-1 mx-4 bg-emerald-500 text-black py-4 rounded-[1.75rem] flex items-center justify-center gap-3 group hover:bg-emerald-400 shadow-xl transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black animate-pulse" /> : <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isPlaying ? 'Stop' : 'Suniye'}</span>
          </button>
          
          <button 
            onClick={() => handleUpdateNavigation(bookParam, chapterNum + 1)}
            className="size-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .verse-num { 
          font-weight: 900; color: #10b981 !important; margin-right: 10px; font-size: 0.75em; opacity: 0.7;
        }
        .bible-content .verse-text, 
        .bible-content p { 
          margin-bottom: 1.5rem; line-height: 1.8; font-family: 'Playfair Display', serif; font-style: italic; color: #e4e4e7 !important; font-size: 1.1rem;
        }
        .bible-content .chapter-title { 
          font-size: 1.5rem; color: #10b981; font-family: 'Playfair Display', serif; font-weight: bold; margin-bottom: 1.5rem; border-left: 4px solid #10b981; padding-left: 1rem; margin-top: 2rem;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );

  function handleLanguageChange(newLang: string) {
    setLangSelectorOpen(false);
    handleUpdateNavigation(bookParam, chapterNum, newLang);
  }
}

// Book Item for Selector
function BookItem({ b, expandedBook, currentChapter, isHindi, onExpand, onSelect }: any) {
  const isExpanded = expandedBook === b.id;
  return (
    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
      <button 
        onClick={() => onExpand(isExpanded ? null : b.id)} 
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none", 
          isExpanded ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xl" : "bg-zinc-900/40 border-white/5 hover:border-emerald-500/20 text-zinc-400"
        )}
      >
        <div className="flex flex-col items-start text-left">
          <span className="font-bold text-sm tracking-wide">{isHindi ? b.hi : b.en}</span>
          <span className="text-[9px] uppercase font-black opacity-30 tracking-widest mt-1">{b.chapters} Chapters</span>
        </div>
        <div className={cn("size-2 rounded-full transition-all duration-500", isExpanded ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")} />
      </button>
      {isExpanded && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/60 rounded-[2rem] border border-white/5 shadow-inner mt-2 animate-in zoom-in-95 duration-300">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
            <button key={ch} onClick={() => onSelect(b.id, ch)} className={cn("size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90 outline-none", currentChapter === ch ? "bg-emerald-500 text-black shadow-xl" : "bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/5")}>{ch}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BibleReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}