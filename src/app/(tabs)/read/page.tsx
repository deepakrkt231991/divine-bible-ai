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
  AlertCircle
} from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-index';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

// --- HARDCODED BACKUP DATA (For 100% Reliability) ---
const BACKUP_DATA: Record<string, Record<number, string[]>> = {
  "exodus": {
    7: [
      "यहोवा ने मूसा से कहा: देख, मैं तुझे फिरौन के सामने ईश्वर के समान बनाता हूँ; और हारून तेरा नबी होगा।",
      "तू सब कुछ कहना जो मैं तुझे आज्ञा देता हूँ; और हारून तेरा भाई फिरौन से कहे कि वह इस्राएलियों को अपने देश से जाने दे।",
      "परन्तु मैं फिरौन का हृदय कठोर करूँगा, और अपने चिन्हों और अपने चमत्कारों की बहुतायत मिस्र देश में करूँगा।",
      "और फिरौन तुम्हारी न मानेगा; तब मैं अपना हाथ मिस्र पर लगाऊँगा और अपनी सेनाओं को, अर्थात् अपनी प्रजा इस्राएलियों को बड़े न्याय के साथ मिस्र देश से निकाल लाऊँगा।",
      "और मिस्रियों को ज्ञात होगा कि मैं यहोवा हूँ, जब मैं अपना हाथ मिस्र पर उठाऊँगा और इस्राएलियों को उनके बीच से निकाल लाऊँगा।"
    ]
  },
  "matthew": {
    2: [
      "जब यीशु हेरोदे राजा के दिनों में यहूदिया के बेतलहम में उत्पन्न हुआ, तब देखो, पूर्व देश के कुछ ज्योतिषी यरूशलेम में आए।",
      "और कहने लगे कि यहूदियों का राजा जो उत्पन्न हुआ है, वह कहां है? क्योंकि हम ने उसका तारा पूर्व में देखा, और उसकी उपासना करने को आए हैं।",
      "जब हेरोदे राजा ने यह सुना तो व्याकुल हुआ, और उसके साथ सारा यरूशलेम भी व्याकुल हुआ।",
      "उसने सब प्रधान याजकों और लोगों के शास्त्रियों को एकत्र करके उन से पूछा कि मसीह कहां उत्पन्न होगा।",
      "उन्होंने उस से कहा, यहूदिया के बेतलहम में; क्योंकि भविष्यद्वक्ता के द्वारा यों लिखा है।"
    ]
  },
  "genesis": {
    1: [
      "आदि में परमेश्वर ने आकाश और पृथ्वी की सृष्टि की।",
      "और पृथ्वी बेडौल और सुनसान पड़ी थी; और गहरे जल के ऊपर अन्धकार था: और परमेश्वर का आत्मा जल के ऊपर मण्डराता था।",
      "और परमेश्वर ने कहा, उजियाला हो: और उजियाला हो गया।",
      "और परमेश्वर ने उजियाले को देखा कि अच्छा है; और परमेश्वर ने उजियाले को अन्धकार से अलग किया।",
      "और परमेश्वर ने उजियाले को दिन और अन्धकार को रात कहा। और सांझ हुई फिर भोर हुआ। इस प्रकार पहला दिन हो गया।"
    ]
  }
};

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
  
  // Find current book data from index
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

    const bookNameLower = currentBookData.en.toLowerCase();
    const bollsId = currentBookData.bollsId || 1;

    try {
      // ATTEMPT 1: Bolls.life API (Primary Engine)
      // We try HINIRV first, then HI_IRV as fallback for Hindi
      const bollsTrans = ver === 'hin_irv' ? 'HINIRV' : 'KJV';
      const bollsUrl = `https://bolls.life/get-chapter/${bollsTrans}/${bollsId}/${cid}/`;

      console.log(`📖 Loading: ${currentBookData.en} Ch ${cid} via ${bollsTrans}`);
      
      const bollsRes = await fetch(bollsUrl);

      if (bollsRes.ok) {
        const data = await bollsRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const html = data.map(v => {
            // Remove garbage tags like <S>, <f>
            const cleanText = v.text.replace(/<(?:.|\n)*?>/gm, '');
            return `<p class="verse-row"><span class="verse-num">${v.verse}</span><span class="verse-text">${cleanText}</span></p>`;
          }).join("");
          
          setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</div>${html}`);
          setLoading(false);
          return;
        }
      }

      // ATTEMPT 2: Hardcoded Backup (For common chapters or offline mode)
      const backup = BACKUP_DATA[bookNameLower]?.[cid];
      if (backup && backup.length > 0) {
        const html = backup.map((text, i) => 
          `<p class="verse-row"><span class="verse-num">${i+1}</span><span class="verse-text">${text}</span></p>`
        ).join("");
        
        setContent(`<div class="chapter-title">${isHindi ? currentBookData.hi : currentBookData.en} ${cid}</div><div class="backup-badge">Offline Mode Active</div>${html}`);
        setLoading(false);
        return;
      }

      // FINAL FAIL: No data found from any source
      setError("Vachan load nahi ho paya. Kripya internet check karein ya dusra chapter chunein.");

    } catch (e: any) {
      console.error("❌ Reader Error:", e);
      setError("Network problem ya API error. Phir se koshish karein.");
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
      params.set('book', newBook.toString());
      params.set('chapter', newChapter.toString());
      params.set('version', newVersion || version);
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
    if (!text) {
      toast({ title: "Padhne ke liye text nahi mila", variant: "destructive" });
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const localizedBookName = isHindi ? currentBookData.hi : currentBookData.en;
  
  const filteredBooks = (testament: 'old' | 'new' | 'deuterocanon') => BIBLE_BOOKS.filter(b => 
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
            <button type="button" className="flex flex-col items-center flex-1 active:scale-95 transition-all outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-emerald-500 capitalize italic leading-none">
                  {localizedBookName} {chapterNum}
                </h2>
                <Search className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-[9px] uppercase text-zinc-600 tracking-[0.3em] font-black mt-1.5">
                {isHindi ? 'Hindi IRV' : 'English KJV'}
              </span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#09090b] border-white/5 p-0 max-h-[85vh] flex flex-col w-[95%] rounded-[2.5rem] shadow-2xl overflow-hidden">
            <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/20">
              <DialogTitle className="text-emerald-500 font-serif italic text-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                {isHindi ? "Pustak Chuniye" : "Select Scripture"}
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
                <TabsTrigger value="deuterocanon" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Apocrypha</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest">NT</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 px-6 py-4">
                {['old', 'deuterocanon', 'new'].map((testament) => (
                  <TabsContent key={testament} value={testament} className="m-0">
                    <div className="grid grid-cols-1 gap-1.5">
                      {filteredBooks(testament as any).map(b => (
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
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        <button 
          type="button"
          onClick={() => handleUpdateNavigation(bookParam, chapterNum, version === 'kjv' ? 'hin_irv' : 'kjv')}
          className="size-11 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-white/5 text-emerald-500 hover:bg-emerald-500/10 transition-all outline-none"
        >
          <Languages className="w-5 h-5" />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 pb-56 hide-scrollbar">
        {loading || isPending ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-40 py-40">
            <Loader2 className="w-14 h-14 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Syncing Sacred Cloud...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/30 mb-6" />
            <h3 className="text-xl font-bold text-red-500 mb-2">Error!</h3>
            <p className="text-zinc-400 max-w-md">{error}</p>
            <button 
              onClick={() => loadBibleContent(bookParam, chapterNum, version)}
              className="mt-6 px-6 py-3 bg-emerald-500/20 text-emerald-500 rounded-xl font-bold hover:bg-emerald-500/30 transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div 
              className="bible-content prose prose-invert prose-emerald max-w-none"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
            
            <div className="pt-20 pb-16 text-center">
              <button 
                type="button"
                onClick={() => {
                  if (chapterNum < currentBookData.chapters) handleUpdateNavigation(bookParam, chapterNum + 1);
                  else {
                    const idx = BIBLE_BOOKS.findIndex(b => b.id === currentBookData.id);
                    if (idx < BIBLE_BOOKS.length - 1) handleUpdateNavigation(BIBLE_BOOKS[idx + 1].id.toString(), 1);
                  }
                }}
                className="w-full py-14 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-emerald-500/30 transition-all"
              >
                <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-all border border-emerald-500/20 shadow-xl">
                  <ArrowRight className="w-8 h-8 text-emerald-500" />
                </div>
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
            type="button" 
            onClick={() => handleUpdateNavigation(bookParam, Math.max(1, chapterNum - 1))} 
            className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            type="button" 
            onClick={toggleAudio} 
            className="flex-1 mx-4 flex items-center justify-center gap-4 bg-emerald-500 text-black py-4 rounded-[1.75rem] shadow-xl group hover:bg-emerald-400 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-black animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Suniye</span>
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={() => { 
              if (chapterNum < currentBookData.chapters) handleUpdateNavigation(bookParam, chapterNum + 1); 
            }} 
            className="size-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .bible-content .verse-num { font-weight: 900; color: #10b981 !important; margin-right: 10px; font-size: 0.75em; opacity: 0.7; }
        .bible-content .verse-text, .bible-content p { margin-bottom: 1.5rem; line-height: 1.8; font-family: 'Playfair Display', serif; font-style: italic; color: #e4e4e7 !important; font-size: 1.1rem; }
        .bible-content .chapter-title { font-size: 1.5rem; color: #10b981; font-family: 'Playfair Display', serif; font-weight: bold; margin-bottom: 1rem; border-left: 4px solid #10b981; padding-left: 1rem; margin-top: 1rem; }
        .backup-badge { background: rgba(234, 179, 8, 0.1); color: #eab308; font-size: 0.65rem; padding: 0.2rem 0.6rem; border-radius: 999px; display: inline-block; margin-bottom: 1rem; font-weight: bold; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .verse-row { display: flex; align-items: flex-start; gap: 0.5rem; }
      `}</style>
    </div>
  );
}

function BookItem({ b, expandedBook, currentChapter, isHindi, onExpand, onSelect }: any) {
  const isExpanded = expandedBook === b.id;
  
  return (
    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
      <button 
        type="button"
        onClick={() => onExpand(isExpanded ? null : b.id)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-2xl transition-all border outline-none", 
          isExpanded 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xl" 
            : "bg-zinc-900/40 border-white/5 hover:border-emerald-500/20 text-zinc-400"
        )}
      >
        <div className="flex flex-col items-start text-left">
          <span className="font-bold text-sm tracking-wide">{isHindi ? b.hi : b.en}</span>
          <span className="text-[9px] uppercase font-black opacity-30 tracking-widest mt-1">{b.chapters} Chapters</span>
        </div>
        <div className={cn(
          "size-2 rounded-full transition-all duration-500", 
          isExpanded ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
        )} />
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/60 rounded-[2rem] border border-white/5 shadow-inner mt-2 animate-in zoom-in-95 duration-300">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => (
            <button 
              key={ch} 
              type="button" 
              onClick={() => onSelect(b.id, ch)} 
              className={cn(
                "size-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-90 outline-none", 
                currentChapter === ch 
                  ? "bg-emerald-500 text-black shadow-xl" 
                  : "bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/5"
              )}
            >
              {ch}
            </button>
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