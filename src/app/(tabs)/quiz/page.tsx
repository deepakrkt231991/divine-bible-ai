
'use client';

import React, { useState, useEffect } from 'react';
import { Compass, User, Sparkles, ChevronRight, HelpCircle, Trophy, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { generateBibleQuiz } from '@/ai/flows/bible-quiz-flow';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function QuizPage() {
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const data = await generateBibleQuiz({ verse: "Jeremiah 29:11" });
      setQuizData(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
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
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    
    setTimeout(async () => {
      if (currentIndex < quizData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        // Save score to Firestore
        try {
          await addDoc(collection(db, 'quizScores'), {
            userId: 'anonymous', // Replace with real auth UID if needed
            score: score + (correct ? 1 : 0),
            totalQuestions: quizData.length,
            verseReference: "Jeremiah 29:11",
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Score save error:", e);
        }
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <HelpCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic text-white">Bible Quiz</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors px-3 py-1.5 border border-emerald-500/30 rounded-full">
            Register
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-100">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {!quizData && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="size-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
              <Trophy className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold italic">Ready for today's challenge?</h2>
              <p className="text-zinc-500 text-sm max-w-xs">Test your knowledge of the scriptures with our AI-powered daily quiz.</p>
            </div>
            <button 
              onClick={startQuiz}
              className="bg-emerald-500 text-zinc-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Start AI Quiz
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 animate-pulse">Consulting the Scribes...</p>
          </div>
        )}

        {quizData && !showResult && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <span>Question {currentIndex + 1} of {quizData.length}</span>
              <span className="text-emerald-500">Score: {score}</span>
            </div>
            
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
              ></div>
            </div>

            <h2 className="text-xl font-serif font-bold text-zinc-100 leading-relaxed italic">
              {quizData[currentIndex].question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {quizData[currentIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={cn(
                    "w-full p-5 rounded-2xl border text-left font-medium transition-all flex justify-between items-center",
                    selectedOption === null 
                      ? "bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 text-zinc-300" 
                      : idx === quizData[currentIndex].correctAnswerIndex
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : idx === selectedOption
                          ? "bg-red-500/10 border-red-500 text-red-400"
                          : "bg-zinc-900 border-zinc-800 opacity-50"
                  )}
                >
                  {option}
                  {selectedOption !== null && idx === quizData[currentIndex].correctAnswerIndex && <CheckCircle2 className="w-5 h-5" />}
                  {selectedOption === idx && idx !== quizData[currentIndex].correctAnswerIndex && <XCircle className="w-5 h-5" />}
                </button>
              ))}
            </div>

            {selectedOption !== null && (
              <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl animate-in zoom-in-95">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Insight</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{quizData[currentIndex].explanation}</p>
              </div>
            )}
          </div>
        )}

        {showResult && (
          <div className="text-center py-20 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative inline-block">
              <div className="size-32 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/20">
                <span className="text-5xl font-black text-emerald-500">{score}/{quizData.length}</span>
              </div>
              <div className="absolute -top-4 -right-4 size-12 bg-zinc-900 rounded-full border-4 border-background flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold italic">Splendid!</h2>
              <p className="text-zinc-500">Your knowledge of the Word grows stronger.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={startQuiz}
                className="w-full bg-emerald-500 text-zinc-950 font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
              >
                Study More
              </button>
              <button className="w-full bg-zinc-900 text-zinc-100 font-black uppercase tracking-widest text-xs py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all">
                Share Achievement
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
