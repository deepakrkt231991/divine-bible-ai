// src/app/(tabs)/read/page.tsx
// ✅ Professional Bible Reader - Multi-language, Notes, Highlights
// ✅ Matches your design exactly + advanced features

'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChapter } from '@/lib/bible-loader';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Settings, Search, 
  Home, BookOpen, Users, MoreHorizontal, Volume2, Globe,
  StickyNote, Highlighter, Copy, Share2, X, Check, Palette
} from 'lucide-react';

// ============ TYPES ============
interface Note {
  id: string;
  verse: number;
  text: string;
  color: string;
  createdAt: string;
}

interface HighlightColor {
  name: string;
  value: string;
  class: string;
}

export default function ReadPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const bookParam = searchParams.get('book') || 'GEN';
  const chapterParam = parseInt(searchParams.get('chapter') || '1');
  const langParam = searchParams.get('lang') || 'eng-kjv';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  
  const verseRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  
  // ============ BOOK DISPLAY NAMES ============
  const bookNames: Record<string, string> = {
    'gen': 'Genesis', 'exod': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers',
    'deut': 'Deuteronomy', 'josh': 'Joshua', 'judg': 'Judges', 'ruth': 'Ruth',
    '1sam': '1 Samuel', '2sam': '2 Samuel', '1kgs': '1 Kings', '2kgs': '2 Kings',
    '1chr': '1 Chronicles', '2chr': '2 Chronicles', 'ezra': 'Ezra', 'neh': 'Nehemiah',
    'esth': 'Esther', 'job': 'Job', 'ps': 'Psalms', 'prov': 'Proverbs',
    'eccl': 'Ecclesiastes', 'song': 'Song of Solomon', 'isa': 'Isaiah',
    'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezek': 'Ezekiel', 'dan': 'Daniel',
    'hos': 'Hosea', 'joel': 'Joel', 'amos': 'Amos', 'obad': 'Obadiah',
    'jonah': 'Jonah', 'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk',
    'zeph': 'Zephaniah', 'hag': 'Haggai', 'zech': 'Zechariah', 'mal': 'Malachi',
    'matt': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John',
    'acts': 'Acts', 'rom': 'Romans', '1cor': '1 Corinthians', '2cor': '2 Corinthians',
    'gal': 'Galatians', 'eph': 'Ephesians', 'phil': 'Philippians', 'col': 'Colossians',
    '1thess': '1 Thessalonians', '2thess': '2 Thessalonians', '1tim': '1 Timothy',
    '2tim': '2 Timothy', 'titus': 'Titus', 'phlm': 'Philemon', 'heb': 'Hebrews',
    'jas': 'James', '1pet': '1 Peter', '2pet': '2 Peter', '1john': '1 John',
    '2john': '2 John', '3john': '3 John', 'jude': 'Jude', 'rev': 'Revelation',
    'tob': 'Tobit', 'jdt': 'Judith', 'wis': 'Wisdom', 'sir': 'Sirach',
    'bar': 'Baruch', '1macc': '1 Maccabees', '2macc': '2 Maccabees'
  };
  
  const bookName = bookNames[bookParam.toLowerCase()] || bookParam;
  
  // ============ LANGUAGE OPTIONS ============
  const LANGUAGES = [
    { code: 'eng-kjv', name: 'English', version: 'KJV', flag: '🇬🇧' },
    { code: 'hin-hindi', name: 'Hindi', version: 'IRV', flag: '🇮🇳' },
    { code: 'spa-spanish', name: 'Spanish', version: 'RVR1909', flag: '🇪🇸' },
    { code: 'fra-french', name: 'French', version: 'LSG', flag: '🇫🇷' },
  ];
  
  // ============ HIGHLIGHT COLORS ============
  const HIGHLIGHT_COLORS: HighlightColor[] = [
    { name: 'Emerald', value: 'emerald', class: 'highlight-emerald' },
    { name: 'Amber', value: 'amber', class: 'highlight-amber' },
    { name: 'Blue', value: 'blue', class: 'highlight-blue' },
    { name: 'Rose', value: 'rose', class: 'highlight-rose' },
  ];
  
  // ============ LOAD NOTES FROM STORAGE ============
  useEffect(() => {
    const key = `bible-notes-${langParam}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
    
    const highlightsKey = `bible-highlights-${langParam}`;
    const savedHighlights = localStorage.getItem(highlightsKey);
    if (savedHighlights) {
      try {
        setHighlights(JSON.parse(savedHighlights));
      } catch (e) {
        console.error('Failed to load highlights:', e);
      }
    }
  }, [langParam]);
  
  // ============ SAVE NOTES TO STORAGE ============
  const saveNotes = (newNotes: Record<string, Note[]>) => {
    const key = `bible-notes-${langParam}`;
    localStorage.setItem(key, JSON.stringify(newNotes));
    setNotes(newNotes);
  };
  
  const saveHighlights = (newHighlights: Record<string, string>) => {
    const key = `bible-highlights-${langParam}`;
    localStorage.setItem(key, JSON.stringify(newHighlights));
    setHighlights(newHighlights);
  };
  
  // ============ LOAD CHAPTER ============
  const { verses, loading, error } = useChapter(
    bookParam.toLowerCase(), 
    chapterParam, 
    langParam
  );
  
  // ============ NAVIGATION HANDLERS ============
  const handlePrevChapter = () => {
    if (chapterParam > 1) {
      router.push(`/read?book=${bookParam}&chapter=${chapterParam - 1}&lang=${langParam}`);
    }
  };
  
  const handleNextChapter = () => {
    router.push(`/read?book=${bookParam}&chapter=${chapterParam + 1}&lang=${langParam}`);
  };
  
  const handleLangChange = (newLang: string) => {
    setShowLangSelector(false);
    router.push(`/read?book=${bookParam}&chapter=${chapterParam}&lang=${newLang}`);
  };
  
  const handleBookChange = (newBook: string) => {
    setShowBookSelector(false);
    router.push(`/read?book=${newBook}&chapter=1&lang=${langParam}`);
  };
  
  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };
  
  // ============ TEXT SELECTION HANDLERS ============
  const handleVerseLongPress = (verseNum: number, event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    setSelectedVerse(verseNum);
    
    // Get position for toolbar
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setToolbarPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 60
    });
    setShowToolbar(true);
  };
  
  const handleTextSelection = (verseNum: number) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedVerse(verseNum);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 60
      });
      setShowToolbar(true);
    }
  };
  
  // ============ HIGHLIGHT HANDLER ============
  const handleHighlight = (color: string) => {
    if (selectedVerse === null) return;
    
    const key = `${bookParam}-${chapterParam}-${selectedVerse}`;
    const newHighlights = { ...highlights, [key]: color };
    saveHighlights(newHighlights);
    setShowToolbar(false);
    setSelectedVerse(null);
  };
  
  // ============ ADD NOTE HANDLER ============
  const handleAddNote = () => {
    if (selectedVerse === null) return;
    
    const noteText = prompt('Add your reflection note:');
    if (noteText && noteText.trim()) {
      const key = `${bookParam}-${chapterParam}`;
      const newNote: Note = {
        id: Date.now().toString(),
        verse: selectedVerse,
        text: noteText.trim(),
        color: 'emerald',
        createdAt: new Date().toISOString()
      };
      
      const chapterNotes = notes[key] || [];
      const newNotes = { ...notes, [key]: [...chapterNotes, newNote] };
      saveNotes(newNotes);
    }
    
    setShowToolbar(false);
    setSelectedVerse(null);
  };
  
  // ============ COPY VERSE HANDLER ============
  const handleCopyVerse = () => {
    if (selectedVerse === null || !verses) return;
    
    const verse = verses.find(v => v.verse === selectedVerse);
    if (verse) {
      const text = `${bookName} ${chapterParam}:${verse.verse} - ${verse.text}`;
      navigator.clipboard.writeText(text);
      alert('Verse copied to clipboard!');
    }
    
    setShowToolbar(false);
    setSelectedVerse(null);
  };
  
  // ============ SHARE VERSE HANDLER ============
  const handleShareVerse = async () => {
    if (selectedVerse === null || !verses) return;
    
    const verse = verses.find(v => v.verse === selectedVerse);
    if (verse && navigator.share) {
      try {
        await navigator.share({
          title: `${bookName} ${chapterParam}:${verse.verse}`,
          text: verse.text,
          url: window.location.href
        });
      } catch (e) {
        console.log('Share cancelled');
      }
    }
    
    setShowToolbar(false);
    setSelectedVerse(null);
  };
  
  // ============ GET VERSE HIGHLIGHT CLASS ============
  const getHighlightClass = (verseNum: number): string => {
    const key = `${bookParam}-${chapterParam}-${verseNum}`;
    const color = highlights[key];
    const highlight = HIGHLIGHT_COLORS.find(h => h.value === color);
    return highlight ? highlight.class : '';
  };
  
  // ============ GET VERSE NOTES ============
  const getVerseNotes = (verseNum: number): Note[] => {
    const key = `${bookParam}-${chapterParam}`;
    return notes[key]?.filter(n => n.verse === verseNum) || [];
  };
  
  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error || !verses) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-red-400 mb-4 text-lg">{error || 'Chapter not found'}</p>
          <p className="text-zinc-500 text-sm mb-6">
            {bookName} {chapterParam} • {langParam}
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-zinc-950 rounded-full font-semibold hover:bg-emerald-400 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ============ CURRENT LANGUAGE INFO ============
  const currentLang = LANGUAGES.find(l => l.code === langParam) || LANGUAGES[0];

  // ============ MAIN UI ============
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans">
      
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-20 flex items-center bg-zinc-950/95 backdrop-blur-md p-4 border-b border-zinc-800 justify-between">
        
        {/* Settings Button */}
        <button 
          onClick={() => setShowBookSelector(true)}
          className="text-slate-100 hover:text-primary transition-colors p-2"
          title="Change Book"
        >
          <BookOpen className="w-6 h-6" />
        </button>
        
        {/* Book Title + Language Selector */}
        <div className="flex flex-col items-center flex-1 px-4">
          <button
            onClick={() => setShowBookSelector(true)}
            className="text-slate-100 text-lg font-bold leading-tight tracking-tight text-center hover:text-primary transition-colors"
          >
            {bookName} {chapterParam}
          </button>
          
          {/* Language + Version Selector */}
          <div className="flex items-center gap-2 mt-1">
            <div className="relative">
              <button
                onClick={() => setShowLangSelector(!showLangSelector)}
                className="appearance-none bg-zinc-800 text-slate-100 text-[10px] rounded px-2 py-0.5 pr-6 border border-zinc-700 focus:outline-none focus:border-primary cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                {currentLang.flag} {currentLang.name}
              </button>
              
              {/* Language Dropdown */}
              {showLangSelector && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors ${
                        lang.code === langParam ? 'bg-zinc-800 text-primary' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="text-xs text-zinc-500 ml-auto">({lang.version})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
              Version
            </span>
          </div>
        </div>
        
        {/* Search Button */}
        <button className="text-slate-100 hover:text-primary transition-colors p-2">
          <Search className="w-6 h-6" />
        </button>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-40">
        <div className="mb-8 max-w-2xl mx-auto">
          
          {/* Chapter Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-[1px] flex-1 bg-zinc-800"></div>
            <span className="text-zinc-400 text-xs font-medium tracking-widest uppercase whitespace-nowrap">
              Chapter {chapterParam}
            </span>
            <div className="h-[1px] flex-1 bg-zinc-800"></div>
          </div>
          
          {/* Verses */}
          <div className="space-y-5 font-serif leading-relaxed text-lg lg:text-xl text-slate-200">
            {verses.map((verse: any) => {
              const verseNotes = getVerseNotes(verse.verse);
              const highlightClass = getHighlightClass(verse.verse);
              
              return (
                <p 
                  key={verse.verse} 
                  ref={el => verseRefs.current[verse.verse] = el}
                  className={`group cursor-pointer transition-all duration-200 ${highlightClass} ${
                    selectedVerse === verse.verse ? 'ring-2 ring-primary/50 rounded' : ''
                  }`}
                  onTouchStart={(e) => handleVerseLongPress(verse.verse, e)}
                  onMouseUp={() => handleTextSelection(verse.verse)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleVerseLongPress(verse.verse, e);
                  }}
                >
                  <span className="text-primary font-bold text-sm align-top mr-2 font-display group-hover:text-emerald-400 transition-colors select-none">
                    {verse.verse}
                  </span>
                  <span className="text-slate-200">{verse.text}</span>
                  
                  {/* Note Indicator */}
                  {verseNotes.length > 0 && (
                    <span 
                      className="material-symbols-outlined note-indicator text-primary ml-1 cursor-pointer hover:text-emerald-400"
                      title={`${verseNotes.length} note(s)`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const noteText = verseNotes.map(n => n.text).join('\n\n');
                        alert(`Notes for verse ${verse.verse}:\n\n${noteText}`);
                      }}
                    >
                      sticky_note_2
                    </span>
                  )}
                </p>
              );
            })}
          </div>
          
          {/* Chapter Footer */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-800">
            <button
              onClick={handlePrevChapter}
              disabled={chapterParam <= 1}
              className="flex items-center gap-2 text-zinc-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Previous</span>
            </button>
            <button
              onClick={handleNextChapter}
              className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* ============ FLOATING SELECTION TOOLBAR ============ */}
      {showToolbar && selectedVerse !== null && (
        <div 
          className="fixed z-50 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
          style={{ 
            left: `${toolbarPosition.x}px`, 
            top: `${toolbarPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Toolbar Header */}
          <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Verse {selectedVerse} Options
            </span>
            <button 
              onClick={() => { setShowToolbar(false); setSelectedVerse(null); }}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Toolbar Content */}
          <div className="p-4 space-y-4">
            
            {/* Highlight Colors */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-wider flex items-center gap-1">
                <Highlighter className="w-3 h-3" /> Highlight Color
              </p>
              <div className="flex gap-3">
                {HIGHLIGHT_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => handleHighlight(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      highlights[`${bookParam}-${chapterParam}-${selectedVerse}`] === color.value
                        ? 'border-white ring-2 ring-primary/20'
                        : 'border-transparent'
                    } ${
                      color.value === 'emerald' ? 'bg-emerald-500' :
                      color.value === 'amber' ? 'bg-amber-400' :
                      color.value === 'blue' ? 'bg-blue-400' :
                      'bg-rose-400'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            {/* Add Note Button */}
            <button 
              onClick={handleAddNote}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-slate-200"
            >
              <StickyNote className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Add Reflection Note</span>
            </button>
            
            {/* Copy & Share */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleCopyVerse}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span className="text-[10px] mt-1">Copy</span>
              </button>
              <button 
                onClick={handleShareVerse}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-[10px] mt-1">Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ AUDIO PLAYER ============ */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-40">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full p-2 flex items-center justify-between shadow-2xl pointer-events-auto">
          
          {/* Previous Chapter */}
          <button 
            onClick={handlePrevChapter}
            disabled={chapterParam <= 1}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-300 disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {/* Audio Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleAudio}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-zinc-950 shadow-lg shadow-primary/20 hover:bg-emerald-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-zinc-950" />
              ) : (
                <Play className="w-6 h-6 fill-zinc-950 ml-0.5" />
              )}
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">
                Audio Bible
              </span>
              <span className="text-xs text-white font-medium">
                {currentLang.flag} {currentLang.name} • Ch. {chapterParam}
              </span>
            </div>
          </div>
          
          {/* Next Chapter */}
          <button 
            onClick={handleNextChapter}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ============ BOTTOM NAVIGATION ============ */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 px-4 pb-6 pt-3 z-30">
        <div className="flex justify-around items-center">
          
          {/* Home */}
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <Home className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Home</p>
          </button>
          
          {/* Bible (Active) */}
          <button 
            onClick={() => router.push('/read')}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <BookOpen className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Bible</p>
          </button>
          
          {/* Chaplain */}
          <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <Volume2 className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Chaplain</p>
          </button>
          
          {/* Community */}
          <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <Users className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Community</p>
          </button>
          
          {/* More */}
          <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-6 h-6" />
            <p className="text-[10px] font-medium uppercase tracking-wider">More</p>
          </button>
        </div>
      </nav>

      {/* ============ BOOK SELECTOR MODAL ============ */}
      {showBookSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100">Select Book</h3>
              <button 
                onClick={() => setShowBookSelector(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(bookNames).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleBookChange(code.toUpperCase())}
                    className={`p-3 rounded-lg text-left text-sm transition-colors ${
                      code === bookParam.toLowerCase()
                        ? 'bg-primary text-zinc-950 font-semibold'
                        : 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ GLOBAL STYLES FOR HIGHLIGHTS ============ */}
      <style jsx global>{`
        .highlight-emerald {
          background: rgba(16, 183, 127, 0.15);
          border-left: 3px solid #10b77f;
          padding-left: 12px;
          margin-left: -14px;
          border-radius: 0 4px 4px 0;
        }
        .highlight-amber {
          background: rgba(245, 158, 11, 0.15);
          border-left: 3px solid #f59e0b;
          padding-left: 12px;
          margin-left: -14px;
          border-radius: 0 4px 4px 0;
        }
        .highlight-blue {
          background: rgba(59, 130, 246, 0.15);
          border-left: 3px solid #3b82f6;
          padding-left: 12px;
          margin-left: -14px;
          border-radius: 0 4px 4px 0;
        }
        .highlight-rose {
          background: rgba(244, 63, 94, 0.15);
          border-left: 3px solid #f43f5e;
          padding-left: 12px;
          margin-left: -14px;
          border-radius: 0 4px 4px 0;
        }
        .note-indicator {
          font-size: 14px !important;
          vertical-align: super;
          margin-left: 2px;
          color: #10b77f;
          cursor: pointer;
          transition: color 0.2s;
        }
        .note-indicator:hover {
          color: #34d399;
        }
      `}</style>
    </div>
  );
}