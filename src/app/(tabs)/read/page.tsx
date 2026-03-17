'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChapter } from '@/lib/bible-loader.client';
import { ChevronLeft, ChevronRight, Play, Pause, Globe, X, StickyNote, Copy, Share2 } from 'lucide-react';

interface Note { id: string; verse: number; text: string; color: string; createdAt: string; }
interface LanguageOption { code: string; name: string; version: string; flag: string; available: boolean; }

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-zinc-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <ReaderContent />
    </Suspense>
  );
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookParam = searchParams.get('book') || 'MATT';
  const chapterParam = parseInt(searchParams.get('chapter') || '1');
  const langParam = searchParams.get('lang') || 'eng-kjv';

  const [isPlaying, setIsPlaying] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const bookNames: Record<string, string> = {
    'gen':'Genesis','exod':'Exodus','lev':'Leviticus','num':'Numbers','deut':'Deuteronomy',
    'josh':'Joshua','judg':'Judges','ruth':'Ruth','1sam':'1 Samuel','2sam':'2 Samuel',
    '1kgs':'1 Kings','2kgs':'2 Kings','1chr':'1 Chronicles','2chr':'2 Chronicles',
    'ezra':'Ezra','neh':'Nehemiah','esth':'Esther','job':'Job','ps':'Psalms',
    'prov':'Proverbs','eccl':'Ecclesiastes','song':'Song of Solomon','isa':'Isaiah',
    'jer':'Jeremiah','lam':'Lamentations','ezek':'Ezekiel','dan':'Daniel','hos':'Hosea',
    'joel':'Joel','amos':'Amos','obad':'Obadiah','jonah':'Jonah','mic':'Micah',
    'nah':'Nahum','hab':'Habakkuk','zeph':'Zephaniah','hag':'Haggai','zech':'Zechariah',
    'mal':'Malachi','matt':'Matthew','mark':'Mark','luke':'Luke','john':'John',
    'acts':'Acts','rom':'Romans','1cor':'1 Corinthians','2cor':'2 Corinthians',
    'gal':'Galatians','eph':'Ephesians','phil':'Philippians','col':'Colossians',
    '1thess':'1 Thessalonians','2thess':'2 Thessalonians','1tim':'1 Timothy',
    '2tim':'2 Timothy','titus':'Titus','phlm':'Philemon','heb':'Hebrews','jas':'James',
    '1pet':'1 Peter','2pet':'2 Peter','1john':'1 John','2john':'2 John','3john':'3 John',
    'jude':'Jude','rev':'Revelation','tob':'Tobit','jdt':'Judith','wis':'Wisdom',
    'sir':'Sirach','bar':'Baruch','1macc':'1 Maccabees','2macc':'2 Maccabees'
  };

  const LANGUAGES: LanguageOption[] = [
    { code: 'eng-kjv', name: 'English', version: 'KJV', flag: '🇬🇧', available: true },
    { code: 'hin-hindi', name: 'Hindi', version: 'IRV', flag: '🇮🇳', available: true },
    { code: 'spa-spanish', name: 'Spanish', version: 'RVR1909', flag: '🇪🇸', available: false },
    { code: 'fra-french', name: 'French', version: 'LSG', flag: '🇫🇷', available: false },
  ];

  const HIGHLIGHT_COLORS = [
    { name: 'Emerald', value: 'emerald', class: 'highlight-emerald', bg: 'bg-emerald-500' },
    { name: 'Amber', value: 'amber', class: 'highlight-amber', bg: 'bg-amber-400' },
    { name: 'Blue', value: 'blue', class: 'highlight-blue', bg: 'bg-blue-400' },
    { name: 'Rose', value: 'rose', class: 'highlight-rose', bg: 'bg-rose-400' },
  ];

  const getChapterCount = (b: string) => ({'gen':50,'exod':40,'lev':27,'num':36,'deut':34,'josh':24,'judg':21,'ruth':4,'1sam':31,'2sam':24,'1kgs':22,'2kgs':25,'1chr':29,'2chr':36,'ezra':10,'neh':13,'esth':10,'job':42,'ps':150,'prov':31,'eccl':12,'song':8,'isa':66,'jer':52,'lam':5,'ezek':48,'dan':12,'hos':14,'joel':3,'amos':9,'obad':1,'jonah':4,'mic':7,'nah':3,'hab':3,'zeph':3,'hag':2,'zech':14,'mal':4,'matt':28,'mark':16,'luke':24,'john':21,'acts':28,'rom':16,'1cor':16,'2cor':13,'gal':6,'eph':6,'phil':4,'col':4,'1thess':5,'2thess':3,'1tim':6,'2tim':4,'titus':3,'phlm':1,'heb':13,'jas':5,'1pet':5,'2pet':3,'1john':5,'2john':1,'3john':1,'jude':1,'rev':22,'tob':14,'jdt':16,'wis':19,'sir':51,'bar':5,'1macc':16,'2macc':15} as Record<string,number>)[b] || 1;

  const bookName = bookNames[bookParam.toLowerCase()] || bookParam;
  const currentLang = LANGUAGES.find(l => l.code === langParam) || LANGUAGES[0];
  const totalChapters = getChapterCount(bookParam.toLowerCase());

  useEffect(() => {
    try { const s = localStorage.getItem(`notes-${langParam}`); if (s) setNotes(JSON.parse(s)); } catch(e) {}
    try { const s = localStorage.getItem(`highlights-${langParam}`); if (s) setHighlights(JSON.parse(s)); } catch(e) {}
  }, [langParam]);

  const saveNotes = (n: Record<string, Note[]>) => { localStorage.setItem(`notes-${langParam}`, JSON.stringify(n)); setNotes(n); };
  const saveHighlights = (h: Record<string, string>) => { localStorage.setItem(`highlights-${langParam}`, JSON.stringify(h)); setHighlights(h); };

  const { verses, loading, error } = useChapter(bookParam.toLowerCase(), chapterParam, langParam);
  const nav = (book: string, ch: number, lang: string) => router.push(`/read?book=${book}&chapter=${ch}&lang=${lang}`);

  const handleLangChange = (code: string) => {
    const l = LANGUAGES.find(x => x.code === code);
    if (!l?.available) { alert(`${l?.name} coming soon!`); return; }
    setShowLangSelector(false);
    nav(bookParam, chapterParam, code);
  };

  const handleTouchStart = (verseNum: number, e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setSelectedVerse(verseNum);
      setToolbarPosition({ x: rect.left + rect.width / 2, y: rect.top - 60 });
      setShowToolbar(true);
    }, 500);
  };

  const handleTouchEnd = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

  const handleContextMenu = (verseNum: number, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setSelectedVerse(verseNum);
    setToolbarPosition({ x: rect.left + rect.width / 2, y: rect.top - 60 });
    setShowToolbar(true);
  };

  const handleHighlight = (color: string) => {
    if (selectedVerse === null) return;
    saveHighlights({ ...highlights, [`${bookParam}-${chapterParam}-${selectedVerse}`]: color });
    setShowToolbar(false); setSelectedVerse(null);
  };

  const handleAddNote = () => {
    if (selectedVerse === null) return;
    const text = prompt('Add reflection note:');
    if (text?.trim()) {
      const key = `${bookParam}-${chapterParam}`;
      saveNotes({ ...notes, [key]: [...(notes[key]||[]), { id: Date.now().toString(), verse: selectedVerse, text: text.trim(), color: 'emerald', createdAt: new Date().toISOString() }]});
    }
    setShowToolbar(false); setSelectedVerse(null);
  };

  const handleCopy = async () => {
    if (selectedVerse === null || !verses) return;
    const v = verses.find((x: any) => x.verse === selectedVerse);
    if (v) { try { await navigator.clipboard.writeText(`${bookName} ${chapterParam}:${v.verse} - ${v.text}`); } catch(e) {} alert('✅ Copied!'); }
    setShowToolbar(false); setSelectedVerse(null);
  };

  const handleShare = async () => {
    if (selectedVerse === null || !verses) return;
    const v = verses.find((x: any) => x.verse === selectedVerse);
    if (v && navigator.share) { try { await navigator.share({ title: `${bookName} ${chapterParam}:${v.verse}`, text: v.text, url: window.location.href }); } catch(e) {} }
    setShowToolbar(false); setSelectedVerse(null);
  };

  const toggleAudio = () => {
    if (isPlaying) { window.speechSynthesis?.cancel(); setIsPlaying(false); return; }
    if (!verses?.length) return;
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(verses.map((v: any) => v.text).join(' '));
    u.rate = 0.85; u.pitch = 1; u.volume = 1;
    u.lang = langParam.startsWith('hin') ? 'hi-IN' : 'en-US';
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    window.speechSynthesis?.speak(u);
    setIsPlaying(true);
  };

  const getHL = (v: number) => HIGHLIGHT_COLORS.find(h => h.value === highlights[`${bookParam}-${chapterParam}-${v}`])?.class || '';
  const getNotes = (v: number): Note[] => notes[`${bookParam}-${chapterParam}`]?.filter(n => n.verse === v) || [];

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (error || !verses) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error || 'Not found'}</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary text-zinc-950 rounded-full font-semibold">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-950 text-slate-100">

      {/* HEADER */}
      <header className="sticky top-0 z-20 flex items-center bg-zinc-950/95 backdrop-blur-md p-3 border-b border-zinc-800 justify-between">
        <button onClick={() => setShowBookSelector(true)} className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg">
          <span className="text-primary text-sm">📖</span>
          <span className="font-semibold text-sm">{bookName}</span>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        </button>

        <button onClick={() => setShowChapterSelector(true)} className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg">
          <span className="font-semibold text-sm">Ch. {chapterParam}</span>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        </button>

        <div className="relative">
          <button onClick={() => setShowLangSelector(!showLangSelector)} className="flex items-center gap-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs">{currentLang.flag}</span>
            <span className="text-xs text-zinc-400">{currentLang.name}</span>
          </button>
          {showLangSelector && (
            <div className="absolute top-full right-0 mt-1 w-36 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => handleLangChange(l.code)} disabled={!l.available}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${l.code === langParam ? 'bg-zinc-800 text-primary' : l.available ? 'text-slate-300 hover:bg-zinc-800' : 'text-zinc-600 cursor-not-allowed'}`}>
                  <span>{l.flag}</span><span>{l.name}</span>
                  {!l.available && <span className="text-[8px] text-amber-500 ml-auto">Soon</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <main className="px-5 py-6 pb-36 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800"></div>
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Chapter {chapterParam}</span>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="space-y-4 font-serif leading-relaxed text-lg text-slate-200">
          {verses.map((verse: any) => {
            const vNotes = getNotes(verse.verse);
            return (
              <p key={verse.verse}
                className={`cursor-pointer select-none ${getHL(verse.verse)} ${selectedVerse === verse.verse ? 'ring-1 ring-primary/40 rounded' : ''}`}
                onTouchStart={(e) => handleTouchStart(verse.verse, e)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                onContextMenu={(e) => handleContextMenu(verse.verse, e)}>
                <span className="text-primary font-bold text-xs align-top mr-1.5">{verse.verse}</span>
                <span>{verse.text}</span>
                {vNotes.length > 0 && <span className="text-primary ml-1 text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); alert(vNotes.map((n: Note) => n.text).join('\n\n')); }}>📌</span>}
              </p>
            );
          })}
        </div>

        <div className="flex justify-between mt-10 pt-6 border-t border-zinc-800">
          <button onClick={() => chapterParam > 1 && nav(bookParam, chapterParam-1, langParam)} disabled={chapterParam <= 1} className="flex items-center gap-1 text-zinc-400 hover:text-primary disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" /><span className="text-sm">Prev</span>
          </button>
          <button onClick={() => nav(bookParam, chapterParam+1, langParam)} className="flex items-center gap-1 text-zinc-400 hover:text-primary">
            <span className="text-sm">Next</span><ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* TOOLBAR */}
      {showToolbar && selectedVerse !== null && (
        <div className="fixed z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl"
          style={{ left: Math.min(Math.max(toolbarPosition.x, 140), window.innerWidth-140), top: Math.max(toolbarPosition.y, 80), transform: 'translateX(-50%)' }}>
          <div className="p-2.5 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400">Verse {selectedVerse}</span>
            <button onClick={() => { setShowToolbar(false); setSelectedVerse(null); }}><X className="w-4 h-4 text-zinc-500" /></button>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c.value} onClick={() => handleHighlight(c.value)}
                  className={`w-7 h-7 rounded-full border-2 ${highlights[`${bookParam}-${chapterParam}-${selectedVerse}`] === c.value ? 'border-white scale-110' : 'border-transparent'} ${c.bg}`} />
              ))}
            </div>
            <button onClick={handleAddNote} className="w-full flex items-center gap-2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-slate-200">
              <StickyNote className="w-4 h-4 text-primary" /> Add Note
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCopy} className="flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 text-xs">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button onClick={handleShare} className="flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 text-xs">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIO PLAYER */}
      <div className="fixed bottom-16 left-0 right-0 max-w-sm mx-auto px-4 z-40">
        <div className="bg-zinc-900/95 border border-zinc-800 rounded-full px-3 py-1.5 flex items-center justify-between shadow-lg">
          <button onClick={() => chapterParam > 1 && nav(bookParam, chapterParam-1, langParam)} disabled={chapterParam <= 1} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-800 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleAudio} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-zinc-950 hover:bg-emerald-400">
              {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />}
            </button>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase leading-none">Audio</p>
              <p className="text-[10px] text-white font-medium leading-tight">{currentLang.flag} Ch. {chapterParam}</p>
            </div>
          </div>
          <button onClick={() => nav(bookParam, chapterParam+1, langParam)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-800">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOOK SELECTOR */}
      {showBookSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between">
              <h3 className="font-bold text-slate-100">Select Book</h3>
              <button onClick={() => setShowBookSelector(false)}><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto grid grid-cols-2 gap-2">
              {Object.entries(bookNames).map(([code, name]) => (
                <button key={code} onClick={() => { setShowBookSelector(false); nav(code.toUpperCase(), 1, langParam); }}
                  className={`p-2.5 rounded-lg text-left text-sm ${code === bookParam.toLowerCase() ? 'bg-primary text-zinc-950 font-semibold' : 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'}`}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER SELECTOR */}
      {showChapterSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between">
              <h3 className="font-bold text-slate-100">{bookName}</h3>
              <button onClick={() => setShowChapterSelector(false)}><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto grid grid-cols-6 gap-1.5">
              {Array.from({ length: totalChapters }, (_, i) => i+1).map(ch => (
                <button key={ch} onClick={() => { setShowChapterSelector(false); nav(bookParam, ch, langParam); }}
                  className={`p-2 rounded-lg text-sm font-medium ${ch === chapterParam ? 'bg-primary text-zinc-950' : 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'}`}>
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .highlight-emerald{background:rgba(16,183,127,.15);border-left:3px solid #10b77f;padding-left:10px;margin-left:-12px;border-radius:0 4px 4px 0}
        .highlight-amber{background:rgba(245,158,11,.15);border-left:3px solid #f59e0b;padding-left:10px;margin-left:-12px;border-radius:0 4px 4px 0}
        .highlight-blue{background:rgba(59,130,246,.15);border-left:3px solid #3b82f6;padding-left:10px;margin-left:-12px;border-radius:0 4px 4px 0}
        .highlight-rose{background:rgba(244,63,94,.15);border-left:3px solid #f43f5e;padding-left:10px;margin-left:-12px;border-radius:0 4px 4px 0}
      `}</style>
    </div>
  );
}