
'use client';

import React, { useState, useMemo } from 'react';
import { ClipboardList, User, CheckCircle2, PlayCircle, ChevronRight, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase, useMemoFirebase, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 260-Day Plan Logic (5 days/week)
const PLANS_CONFIG = [
  {
    id: 'nt-260',
    name: 'New Testament in 260 Days',
    duration: '260 Days (5 days/week)',
    description: 'A focused journey through the entire New Testament, perfectly paced for weekdays.',
    totalDays: 260,
    type: 'nt'
  },
  {
    id: 'canonical-365',
    name: 'Bible in a Year',
    duration: '365 Days',
    description: 'Read the entire Bible from Genesis to Revelation in one year.',
    totalDays: 365,
    type: 'full'
  }
];

// Sample reading data for Day 1-3 as per your logic
const READING_DATA: Record<number, { book: string, id: number, chapters: string }> = {
  1: { book: "Matthew", id: 40, chapters: "1-2" },
  2: { book: "Matthew", id: 40, chapters: "3-4" },
  3: { book: "Matthew", id: 40, chapters: "5-7" },
  100: { book: "John", id: 43, chapters: "3-4" }
};

export default function PlansPage() {
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'active' | 'discover'>('active');

  // Fetch user progress for the 260-day plan
  const progressRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'reading_progress', 'nt-260');
  }, [firestore, user]);

  const { data: progress, isLoading: isProgressLoading } = useDoc(progressRef);

  const handleStartPlan = async (planId: string) => {
    if (!firestore || !user) return;
    const ref = doc(firestore, 'users', user.uid, 'reading_progress', planId);
    await setDoc(ref, {
      userId: user.uid,
      readingPlanId: planId,
      currentDayNumber: 1,
      completedDays: [],
      status: 'inProgress',
      startDate: serverTimestamp(),
      lastProgressUpdateAt: serverTimestamp()
    }, { merge: true });
  };

  const handleMarkComplete = async (day: number) => {
    if (!firestore || !user || !progress) return;
    const ref = doc(firestore, 'users', user.uid, 'reading_progress', progress.id);
    const completedDays = progress.completedDays || [];
    if (!completedDays.includes(day)) {
      await setDoc(ref, {
        completedDays: [...completedDays, day],
        currentDayNumber: Math.max(progress.currentDayNumber, day + 1),
        lastProgressUpdateAt: serverTimestamp()
      }, { merge: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* Top Header Panel (Consistent) */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <ClipboardList className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight italic text-white">Divine Compass</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-2 border border-emerald-500/30 rounded-full">
              Register
            </button>
            <button className="flex items-center justify-center size-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
              <User className="w-5 h-5 text-slate-100" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Plan Header */}
        <div className="flex items-center justify-between px-1">
          <h1 className="text-2xl font-serif font-bold italic text-white">Reading Plans</h1>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {selectedTab === 'active' ? 'My Progress' : 'Discover'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/80">
          <button 
            onClick={() => setSelectedTab('active')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              selectedTab === 'active' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Active Plans
          </button>
          <button 
            onClick={() => setSelectedTab('discover')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              selectedTab === 'discover' ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Find Plans
          </button>
        </div>

        {/* Content Area */}
        {isProgressLoading ? (
          <div className="flex flex-col items-center py-20 gap-4 opacity-50">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Progress...</p>
          </div>
        ) : selectedTab === 'active' && !progress ? (
          <div className="text-center py-20 space-y-6">
            <div className="size-20 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto opacity-40">
              <BookOpen className="w-10 h-10 text-zinc-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold italic">No Active Plans</h3>
              <p className="text-zinc-500 text-sm">Start a plan to track your spiritual journey.</p>
            </div>
            <button 
              onClick={() => setSelectedTab('discover')}
              className="bg-emerald-500 text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Explore Plans
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(selectedTab === 'active' && progress ? [PLANS_CONFIG.find(p => p.id === progress.readingPlanId)!] : PLANS_CONFIG).map((plan) => {
              const currentDay = progress?.currentDayNumber || 1;
              const completedCount = progress?.completedDays?.length || 0;
              const progressPct = Math.round((completedCount / plan.totalDays) * 100);
              const todayReading = READING_DATA[currentDay] || READING_DATA[1];

              return (
                <div key={plan.id} className="bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem] p-6 hover:border-emerald-500/40 transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-24 h-24 text-emerald-500" />
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold font-serif italic text-white">{plan.name}</h3>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{plan.duration}</p>
                      </div>
                      {!progress && (
                        <button 
                          onClick={() => handleStartPlan(plan.id)}
                          className="text-[10px] font-black text-emerald-500 hover:underline uppercase tracking-widest"
                        >
                          Join Plan
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-zinc-400 leading-relaxed max-w-[90%]">{plan.description}</p>

                    {progress && (
                      <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <span>Progress</span>
                          <span className="text-emerald-500">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <span className="text-emerald-500 font-serif font-bold">D{currentDay}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-zinc-200">{todayReading.book} {todayReading.chapters}</span>
                              <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Today's Reading</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/read?bookId=${todayReading.id}&chapter=${todayReading.chapters.split('-')[0]}`}>
                              <button className="size-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg active:scale-90 transition-all">
                                <PlayCircle className="w-6 h-6" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleMarkComplete(currentDay)}
                              className="size-10 rounded-full bg-zinc-800 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/10 transition-all"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Support Section */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] p-8 text-center space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 relative z-10">Need Guidance?</p>
          <p className="text-sm text-zinc-300 font-serif italic relative z-10 leading-relaxed">
            "Ask our AI Chaplain to explain any part of your reading plan or offer deep spiritual reflections."
          </p>
          <Link href="/ai" className="inline-block relative z-10">
            <button className="bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.2em] px-10 py-3 rounded-full hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 active:scale-95 transition-all">
              Consult AI Chaplain
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
