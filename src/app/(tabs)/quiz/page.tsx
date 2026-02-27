'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, Loader2, CheckCircle2, XCircle, HelpCircle, User, RotateCcw } from 'lucide-react';
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
      const data = await generateBibleQuiz({ 
        verse: "Jeremiah 29:11 - For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." 
      });
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
        if (firestore && user) {
          addDoc(collection(firestore, 'user_stats', user.uid, 'quizzes'), {
            score: finalScore,
            total: quizData.length,
            date: serverTimestamp(),
            verseContext: "Jeremiah 29:11"
          });
        }
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <HelpCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">Divine Quiz</h1>
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

      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {!quizData && !loading && (
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="size-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
              <Trophy className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold italic text-white">Sacred Challenge</h2>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">Test your knowledge with our AI-powered Bible quiz.</p>
            </div>
            <button 
              onClick={startQuiz}
              className="bg-emerald-500 text-black px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
            >
              Start AI Quiz
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse">Generating Questions...</p>
          </div>
        )}

        {quizData && !showResult && !loading && (
          <div className="space-y-10 animate-in fade-in duration-500">
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
                      ? "bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 text-zinc-400" 
                      : idx === quizData[currentIndex].correctAnswerIndex
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : idx === selectedOption
                          ? "bg-red-500/10 border-red-500 text-red-400"
                          : "bg-zinc-900 opacity-40"
                  )}
                >
                  {option}
                  {selectedOption !== null && idx === quizData[currentIndex].correctAnswerIndex && <CheckCircle2 className="w-5 h-5" />}
                  {selectedOption === idx && idx !== quizData[currentIndex].correctAnswerIndex && <XCircle className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {showResult && (
          <div className="text-center space-y-10 animate-in zoom-in duration-500">
            <div className="flex flex-col items-center">
              <span className="text-6xl font-black text-emerald-500">{score}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mt-2">Score</span>
            </div>
            <h2 className="text-4xl font-serif font-bold italic text-white">Well Done!</h2>
            <button 
              onClick={startQuiz}
              className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-5 rounded-[1.5rem] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
          </div>
        )}
      </main>
    </div>
  );
}