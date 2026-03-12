// src/app/(tabs)/read/page.tsx
"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Volume2, Pause, BookOpen, AlertCircle, Globe, Search } from 'lucide-react';
import { loadChapter } from '@/lib/bible-loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const BOOKS = [
  {c:'gen',h:'उत्पत्ति',e:'Genesis',n:50},{c:'exo',h:'निर्गमन',e:'Exodus',n:40},
  {c:'lev',h:'लेव्यव्यवस्था',e:'Leviticus',n:27},{c:'num',h:'गिनती',e:'Numbers',n:36},
  {c:'deu',h:'व्यवस्थाविवरण',e:'Deuteronomy',n:34},{c:'jos',h:'यहोशू',e:'Joshua',n:24},
  {c:'jdg',h:'न्यायियों',e:'Judges',n:21},{c:'rut',h:'रूत',e:'Ruth',n:4},
  {c:'1sa',h:'1 शमूएल',e:'1 Samuel',n:31},{c:'2sa',h:'2 शमूएल',e:'2 Samuel',n:24},
  {c:'1ki',h:'1 राजा',e:'1 Kings',n:22},{c:'2ki',h:'2 राजा',e:'2 Kings',n:25},
  {c:'1ch',h:'1 इतिहास',e:'1 Chronicles',n:29},{c:'2ch',h:'2 इतिहास',e:'2 Chronicles',n:36},
  {c:'ezr',h:'एज्रा',e:'Ezra',n:10},{c:'neh',h:'निहेम्याह',e:'Nehemiah',n:13},
  {c:'est',h:'एस्तेर',e:'Esther',n:10},{c:'job',h:'अय्यूब',e:'Job',n:42},
  {c:'psa',h:'भजन',e:'Psalms',n:150},{c:'pro',h:'नीतिवचन',e:'Proverbs',n:31},
  {c:'ecc',h:'उपदेशक',e:'Ecclesiastes',n:12},{c:'sng',h:'श्रेष्ठगीत',e:'Song of Solomon',n:8},
  {c:'isa',h:'यशायाह',e:'Isaiah',n:66},{c:'jer',h:'यिर्मयाह',e:'Jeremiah',n:52},
  {c:'lam',h:'विलापगीत',e:'Lamentations',n:5},{c:'ezk',h:'यहेजकेल',e:'Ezekiel',n:48},
  {c:'dan',h:'दानीएल',e:'Daniel',n:12},{c:'hos',h:'होशे',e:'Hosea',n:14},
  {c:'jol',h:'योएल',e:'Joel',n:3},{c:'amo',h:'आमोस',e:'Amos',n:9},
  {c:'oba',h:'ओबद्याह',e:'Obadiah',n:1},{c:'jon',h:'योना',e:'Jonah',n:4},
  {c:'mic',h:'मीका',e:'Micah',n:7},{c:'nah',h:'नहूम',e:'Nahum',n:3},
  {c:'hab',h:'हब्बकूक',e:'Habakkuk',n:3},{c:'zep',h:'सफन्याह',e:'Zephaniah',n:3},
  {c:'hag',h:'हग्गय',e:'Haggai',n:2},{c:'zec',h:'जकर्याह',e:'Zechariah',n:14},
  {c:'mal',h:'मलाकी',e:'Malachi',n:4},{c:'mat',h:'मत्ती',e:'Matthew',n:28},
  {c:'mrk',h:'मरकुस',e:'Mark',n:16},{c:'luk',h:'लूका',e:'Luke',n:24},
  {c:'jhn',h:'यूहन्ना',e:'John',n:21},{c:'act',h:'प्रेरित',e:'Acts',n:28},
  {c:'rom',h:'रोमियों',e:'Romans',n:16},{c:'1co',h:'1 कुरिन्थियों',e:'1 Corinthians',n:16},
  {c:'2co',h:'2 कुरिन्थियों',e:'2 Corinthians',n:13},{c:'gal',h:'गलातियों',e:'Galatians',n:6},
  {c:'eph',h:'इफिसियों',e:'Ephesians',n:6},{c:'php',h:'फिलिप्पियों',e:'Philippians',n:4},
  {c:'col',h:'कुलुस्सियों',e:'Colossians',n:4},{c:'1th',h:'1 थिस्सलुनीकियों',e:'1 Thessalonians',n:5},
  {c:'2th',h:'2 थिस्सलुनीकियों',e:'2 Thessalonians',n:3},{c:'1ti',h:'1 तिमुथियस',e:'1 Timothy',n:6},
  {c:'2ti',h:'2 तिमुथियस',e:'2 Timothy',n:4},{c:'tit',h:'तीतुस',e:'Titus',n:3},
  {c:'phm',h:'फिलेमोन',e:'Philemon',n:1},{c:'heb',h:'इब्रानियों',e:'Hebrews',n:13},
  {c:'jas',h:'याकूब',e:'James',n:5},{c:'1pe',h:'1 पतरस',e:'1 Peter',n:5},
  {c:'2pe',h:'2 पतरस',e:'2 Peter',n:3},{c:'1jn',h:'1 यूहन्ना',e:'1 John',n:5},
  {c:'2jn',h:'2 यूहन्ना',e:'2 John',n:1},{c:'3jn',h:'3 यूहन्ना',e:'3 John',n:1},
  {c:'jud',h:'यहूदा',e:'Jude',n:1},{c:'rev',h:'प्रकाशित',e:'Revelation',n:22},
  {c:'tob',h:'टोबित',e:'Tobit',n:14},{c:'jdt',h:'यहूदिथ',e:'Judith',n:16},
  {c:'wis',h:'ज्ञान',e:'Wisdom',n:19},{c:'sir',h:'सिराक',e:'Sirach',n:51},
  {c:'bar',h:'बारूक',e:'Baruch',n:6},{c:'1ma',h:'1 मक्काबियों',e:'1 Maccabees',n:16},
  {c:'2ma',h:'2 मक्काबियों',e:'2 Maccabees',n:15},{c:'3ma',h:'3 मक्काबियों',e:'3 Maccabees',n:6},
  {c:'4ma',h:'4 मक्काबियों',e:'4 Maccabees',n:18},{c:'man',h:'मनश्शेह प्रार्थना',e:'Prayer of Manasseh',n:1},
  {c:'1es',h:'1 एज्रा',e:'1 Esdras',n:9},{c:'2es',h:'2 एज्रा',e:'2 Esdras',n:16},
  {c:'esg',h:'एस्तेर अतिरिक्त',e:'Additions to Esther',n:10},{c:'lje',h:'यिर्मयाह पत्र',e:'Letter of Jeremiah',n:1},
  {c:'s3y',h:'तीन युवा गीत',e:'Song of Three Jews',n:1},{c:'sus',h:'सुसन्ना',e:'Susanna',n:1},
  {c:'bel',h:'बेल अजगर',e:'Bel and the Dragon',n:1},
];

const LANGS = [{c:'hin',n:'Hindi',f:'🇮🇳'},{c:'eng',n:'English',f:'🇬🇧'}];

function ReaderContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = React.useTransition();
  const bookP = sp.get('book')||'GEN', chP = parseInt(sp.get('chapter')||'1'), langP = sp.get('lang')||'hin';
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [playing, setPlaying] = useState(false);
  const [selOpen, setSelOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selCh, setSelCh] = useState(chP);
  const curLang = LANGS.find(l=>l.c===langP)||LANGS[0];
  const curBook = BOOKS.find(b=>b.c.toUpperCase()===bookP.toUpperCase())||BOOKS[0];

  const load = useCallback(async (book:string,ch:number,lang:string) => {
    setLoading(true); setError(null);
    try {
      const res = await loadChapter(book, ch, `${lang}-hindi`);
      if (res?.length) { setVerses(res); setError(null); }
      else throw new Error('Is chapter ka data abhi available nahi hai');
    } catch(e:any) { setError(e.message||'Error loading chapter'); setVerses([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(bookP.toLowerCase(), chP, langP); }, [bookP,chP,langP,load]);

  const nav = (b:string,c:number,l?:string) => {
    setSelOpen(false); setLangOpen(false);
    start(() => {
      const p = new URLSearchParams(); p.set('book',b.toUpperCase()); p.set('chapter',c.toString()); p.set('lang',l||langP);
      router.push(`/tab/read?${p.toString()}`);
    });
  };

  const toggleAudio = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return; }
    const txt = verses.map((v:any)=>v.text).join(' ');
    if (!txt) return;
    const u = new SpeechSynthesisUtterance(txt); u.lang = langP==='hin'?'hi-IN':'en-US';
    u.onend = ()=>setPlaying(false); window.speechSynthesis.speak(u); setPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      <header className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#09090b]/95 backdrop-blur sticky top-0 z-50">
        <Dialog open={selOpen} onOpenChange={setSelOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center flex-1 outline-none">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-emerald-500">{curBook.h} {chP}</h2>
                <Search className="w-4 h-4 text-zinc-600"/>
              </div>
              <span className="text-[8px] uppercase text-zinc-600 tracking-widest">{curLang.f} {curLang.n}</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-white/5 max-h-[80vh] w-[95%] rounded-2xl">
            <DialogHeader className="p-4 border-b border-white/5">
              <DialogTitle className="text-emerald-500 font-serif text-lg">📖 Pustak Chuniye</DialogTitle>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Khojein..." className="w-full bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2 mt-3 text-sm outline-none"/>
            </DialogHeader>
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="grid grid-cols-1 gap-1">
                {BOOKS.filter(b=>b.h.toLowerCase().includes(search.toLowerCase())||b.e.toLowerCase().includes(search.toLowerCase())).map(b=>(
                  <button key={b.c} onClick={()=>{nav(b.c,1);setSelCh(1);}} className="p-3 rounded-lg bg-zinc-900/40 border border-white/5 text-left flex justify-between text-sm">
                    <span className="font-medium">{b.h}</span><span className="text-[10px] text-zinc-600">{b.n} Ch</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <button onClick={()=>setLangOpen(true)} className="size-9 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-emerald-500"><Globe className="w-4 h-4"/></button>
        <Dialog open={langOpen} onOpenChange={setLangOpen}>
          <DialogContent className="bg-[#09090b] border-white/5 w-[85%] max-w-xs rounded-xl">
            <DialogHeader><DialogTitle className="text-emerald-500 text-sm">Language</DialogTitle></DialogHeader>
            <div className="space-y-1 p-3">
              {LANGS.map(l=>(
                <button key={l.c} onClick={()=>nav(bookP,chP,l.c)} className={`w-full p-3 rounded-lg flex items-center gap-3 border text-sm ${langP===l.c?'bg-emerald-500/10 border-emerald-500':'bg-zinc-900 border-white/5'}`}>
                  <span className="text-lg">{l.f}</span><span className="font-medium">{l.n}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <div className="px-4 py-2 border-b border-white/5 bg-[#09090b]/80 flex items-center gap-2 overflow-x-auto">
        <button onClick={()=>selCh>1&&setSelCh(selCh-1)} className="p-2 rounded-lg bg-zinc-900 text-zinc-400 disabled:opacity-30" disabled={selCh<=1}><ChevronLeft className="w-4 h-4"/></button>
        <div className="flex gap-1">
          {Array.from({length:Math.min(curBook.n,10)},(_,i)=>i+1).map(ch=>(
            <button key={ch} onClick={()=>{setSelCh(ch);nav(bookP,ch,langP);}} className={`w-8 h-8 rounded-lg text-xs font-medium ${selCh===ch?'bg-emerald-500 text-black':'bg-zinc-900 text-zinc-400'}`}>{ch}</button>
          ))}
          {curBook.n>10&&<span className="w-8 h-8 flex items-center justify-center text-xs text-zinc-600">+{curBook.n-10}</span>}
        </div>
        <button onClick={()=>selCh<curBook.n&&setSelCh(selCh+1)} className="p-2 rounded-lg bg-zinc-900 text-zinc-400 disabled:opacity-30" disabled={selCh>=curBook.n}><ChevronRight className="w-4 h-4"/></button>
      </div>
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {loading?(
          <div className="flex flex-col items-center justify-center h-64"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin"/><p className="text-xs text-zinc-500 mt-3">Loading...</p></div>
        ):error?(
          <div className="flex flex-col items-center justify-center h-64 text-center"><AlertCircle className="w-8 h-8 text-red-500/50 mb-2"/><p className="text-sm text-zinc-400">{error}</p><button onClick={()=>load(bookP,chP,langP)} className="mt-3 px-4 py-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg text-xs">Retry</button></div>
        ):verses.length>0?(
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-emerald-500 text-center mb-4">{curBook.h} {chP}</h1>
            {verses.map((v:any)=>(<p key={v.verse} className="leading-relaxed text-base"><sup className="text-emerald-500 font-bold mr-1 text-xs">{v.verse}</sup>{v.text}</p>))}
          </div>
        ):(
          <div className="text-center py-20 text-zinc-500"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30"/><p className="text-sm">Select a book and chapter to read</p></div>
        )}
      </main>
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-50">
        <div className="bg-zinc-950/90 backdrop-blur border border-white/10 rounded-full p-1.5 flex items-center justify-between">
          <button onClick={()=>nav(bookP,Math.max(1,chP-1))} className="size-8 rounded-full flex items-center justify-center text-zinc-500"><ChevronLeft className="w-4 h-4"/></button>
          <button onClick={toggleAudio} className="flex-1 mx-2 bg-emerald-500 text-black py-2 rounded-full flex items-center justify-center gap-1.5">{playing?<Pause className="w-3.5 h-3.5"/>:<Volume2 className="w-3.5 h-3.5"/>}<span className="text-[9px] font-bold uppercase">{playing?'Stop':'Suniye'}</span></button>
          <button onClick={()=>nav(bookP,chP+1)} className="size-8 rounded-full flex items-center justify-center text-zinc-500"><ChevronRight className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}

export default function BibleReaderPage(){return(<Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin"/></div>}><ReaderContent/></Suspense>);}