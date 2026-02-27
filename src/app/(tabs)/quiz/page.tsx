'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Loader2, CheckCircle2, XCircle, HelpCircle, User, RotateCcw, Share2, Flame } from 'lucide-react';
import { generateBibleQuiz } from '@/ai/flows/bible-quiz-flow';
import { cn } from '@/lib/utils';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function QuizPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentVerseRef, setCurrentVerseRef] = useState('');

  // Fetch user streak/stats
  const statsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc(statsRef);

  const startQuiz = async () => {
    setLoading(true);
    setQuizData(null);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);

    try {
      // 1. Pick random book (1-81) and chapter (usually 1 for simplicity in random)
      const randomBookId = Math.floor(Math.random() * 81) + 1;
      const translation = localStorage.getItem('bible_version') || 'IRV_HIN';
      
      // 2. Fetch from Bolls.life
      const response = await fetch(`https://bolls.life/get-chapter/${translation}/${randomBookId}/1/`);
      const verses = await response.json();
      
      if (!verses || verses.length === 0) throw new Error("Content not available");

      const contextText = verses.map((v: any) => v.text).join(" ").substring(0, 1500);
      const bookName = verses[0]?.book_name || `Book ${randomBookId}`;
      setCurrentVerseRef(`${bookName} Chapter 1`);

      // 3. Call AI Flow
      const data = await generateBibleQuiz({ context: contextText });
      setQuizData(data.questions);
    } catch (e) {
      console.error(e);
      toast({ title: "Quiz error", description: "Vachan load karne mein dikkat aayi. Phir se koshish karein.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === quizData[currentIndex].correctAnswerIndex;
    let finalScore = score;
    if (correct) {
      finalScore = score + 1;
      setScore(finalScore);
    }
    
    setTimeout(async () => {
      if (currentIndex < quizData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
        saveQuizResult(finalScore);
      }
    }, 1500);
  };

  const saveQuizResult = async (finalScore: number) => {
    if (!firestore || !user) return;

    const statsPath = `users/${user.uid}/quiz_history`;
    await addDoc(collection(firestore, statsPath), {
      score: finalScore,
      total: quizData.length,
      date: serverTimestamp(),
      verseContext: currentVerseRef
    });

    // Update global user streak/points
    const userRef = doc(firestore, 'users', user.uid);
    setDoc(userRef, {
      amenCount: increment(finalScore * 10), // Give points for correct answers
      lastQuizDate: serverTimestamp()
    }, { merge: true });
  };

  const handleShare = () => {
    const text = `Maine Divine Compass Quiz mein ${score}/${quizData.length} score kiya! 🙏 Aap bhi join karein: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: 'Divine Quiz Score', text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Score WhatsApp par share karein." });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32 flex flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <HelpCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">Divine Quiz</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-black text-zinc-300">{profile?.readingStreak || 1}</span>
          </div>
          <button className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {!quizData && !loading && (
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="size-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
              <Trophy className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif font-bold italic text-white">Sacred Challenge</h2>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">Test your knowledge with our AI-powered Bible quiz across all 81 books.</p>
            </div>
            <button 
              onClick={startQuiz}
              className="bg-emerald-500 text-black px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
            >
              Start Daily Quiz
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse">Meditation in progress...</p>
          </div>
        )}

        {quizData && !showResult && !loading && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{currentVerseRef}</span>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Question {currentIndex + 1}/3</span>
            </div>
            
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700" 
                style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
              ></div>
            </div>

            <div className="py-6">
              <h2 className="text-2xl font-serif font-bold text-white text-center leading-relaxed">
                "{quizData[currentIndex].question}"
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quizData[currentIndex].options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={cn(
                    "w-full p-6 rounded-2xl border text-left font-bold transition-all flex justify-between items-center text-sm",
                    selectedOption === null 
                      ? "bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 text-zinc-400 shadow-lg" 
                      : idx === quizData[currentIndex].correctAnswerIndex
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : idx === selectedOption
                          ? "bg-red-500/10 border-red-500 text-red-400"
                          : "bg-zinc-900 opacity-40"
                  )}
                >
                  <span className="flex-1 pr-4">{option}</span>
                  {selectedOption !== null && idx === quizData[currentIndex].correctAnswerIndex && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {selectedOption === idx && idx !== quizData[currentIndex].correctAnswerIndex && <XCircle className="w-5 h-5 shrink-0" />}
                </button>
              ))}
            </div>
            
            {selectedOption !== null && (
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl animate-in slide-in-from-bottom-4">
                <p className="text-xs text-zinc-400 leading-relaxed italic font-serif">
                  <span className="text-emerald-500 font-bold not-italic mr-2">Insight:</span>
                  {quizData[currentIndex].explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {showResult && (
          <div className="text-center space-y-10 animate-in zoom-in duration-500">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Trophy className="w-20 h-20 text-yellow-500 mb-4 animate-bounce" />
                <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full -z-10" />
              </div>
              <span className="text-6xl font-black text-emerald-500">{score} / {quizData.length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mt-2">Sacred Score</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold italic text-white">Well Done, Seeker!</h2>
              <p className="text-zinc-500 text-sm">Aapne prashno ke sahi uttar diye hain. Aapka streak badh raha hai!</p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-6">
              <button 
                onClick={startQuiz}
                className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-5 rounded-[1.5rem] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
              >
                <RotateCcw className="w-4 h-4" /> Next Challenge
              </button>
              <button 
                onClick={handleShare}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 font-black uppercase tracking-widest text-[11px] py-5 rounded-[1.5rem] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
              >
                <Share2 className="w-4 h-4" /> Share Progress
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
