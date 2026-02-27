'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, Loader2, CheckCircle2, XCircle, HelpCircle, User, ArrowLeft, RotateCcw } from 'lucide-react';
import { generateBibleQuiz } from '@/ai/flows/bible-quiz-flow';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function QuizPage() {
  const { firestore, user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    try {
      // Verse of the day logic for quiz context
      const data = await generateBibleQuiz({ verse: "Jeremiah 29:11" });
      setQuizData(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelectedOption(null);
    } catch (e) {
      console.error(e);
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
        // Save score to Firebase as requested
        if (firestore && user) {
          addDoc(collection(firestore, 'user_stats', user.uid, 'quizzes'), {
            score: finalScore,
            total: quizData.length,
            date: serverTimestamp(),
            verseContext: "Jeremiah 29:11"
          });
        }
      }
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32 flex flex-col">
      {/* Top Bar header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <HelpCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">Bible Quiz</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
            Register
          </button>
          <button className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {!quizData && !loading && (
          <div className="flex flex-col items-center justify-center text-center space-y-10">
            <div className="relative">
              <div className="size-32 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <Trophy className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl shadow-xl">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold italic text-emerald-500">Sacred Challenge</h2>
              <p className="text-zinc-500 text-base max-w-xs mx-auto leading-relaxed">Test your spiritual knowledge with our daily AI-powered Bible quiz.</p>
            </div>
            <button 
              onClick={startQuiz}
              className="bg-emerald-500 text-black px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 flex items-center gap-3 group"
            >
              <Sparkles className="w-4 h-4 group-hover:animate-pulse" /> Start AI Quiz
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-8 py-20">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse">Generating Daily Questions</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Consulting Scriptures...</p>
            </div>
          </div>
        )}

        {quizData && !showResult && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Progress</p>
                <p className="text-sm font-bold text-zinc-300">Question {currentIndex + 1} <span className="text-zinc-600">/ {quizData.length}</span></p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Score</p>
                <p className="text-xl font-black text-emerald-500">{score}</p>
              </div>
            </div>
            
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-emerald-500 glow-primary transition-all duration-700 ease-out" 
                style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
              ></div>
            </div>

            <div className="py-10">
              <h2 className="text-3xl font-serif font-bold text-zinc-100 leading-snug italic text-center px-4">
                "{quizData[currentIndex].question}"
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {quizData[currentIndex].options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={cn(
                    "w-full p-7 rounded-[1.5rem] border text-left font-bold transition-all flex justify-between items-center text-sm shadow-xl",
                    selectedOption === null 
                      ? "bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 text-zinc-400" 
                      : idx === quizData[currentIndex].correctAnswerIndex
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : idx === selectedOption
                          ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                          : "bg-zinc-900 border-zinc-800 opacity-40"
                  )}
                >
                  <span className="flex items-center gap-4">
                    <span className={cn(
                      "size-8 rounded-lg flex items-center justify-center text-[10px] font-black border",
                      selectedOption === null ? "bg-zinc-800 border-zinc-700" : "bg-transparent border-current"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                  {selectedOption !== null && idx === quizData[currentIndex].correctAnswerIndex && <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />}
                  {selectedOption === idx && idx !== quizData[currentIndex].correctAnswerIndex && <XCircle className="w-5 h-5 animate-in zoom-in" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {showResult && (
          <div className="text-center space-y-12 animate-in zoom-in duration-700">
            <div className="relative inline-block">
              <div className="size-48 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.15)]">
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black text-emerald-500">{score}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mt-2">Points</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 size-16 bg-zinc-900 rounded-2xl border-4 border-[#09090b] flex items-center justify-center shadow-2xl">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-serif font-bold italic text-emerald-500">Well Done!</h2>
              <p className="text-zinc-500 max-w-xs mx-auto leading-relaxed">Your spiritual knowledge continues to flourish like a cedar of Lebanon.</p>
            </div>

            <div className="flex flex-col gap-4 max-w-xs mx-auto pt-6">
              <button 
                onClick={startQuiz}
                className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-6 rounded-[1.5rem] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-4 h-4" /> Retake AI Quiz
              </button>
              <button className="w-full bg-[#121214] text-zinc-100 font-black uppercase tracking-widest text-[11px] py-6 rounded-[1.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all">
                Share My Score
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}