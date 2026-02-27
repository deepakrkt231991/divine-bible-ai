
'use client';

import React, { useState } from 'react';
import { Compass, User, ClipboardList, CheckCircle2, Circle, ChevronRight, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Plan = {
  id: string;
  name: string;
  duration: string;
  description: string;
  progress: number;
};

export default function PlansPage() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'discover'>('active');

  const plans: Plan[] = [
    { id: 'canonical', name: 'Canonical Plan', duration: '365 Days', description: 'Read the Bible from Genesis to Revelation in order.', progress: 12 },
    { id: 'chronological', name: 'Chronological Plan', duration: '365 Days', description: 'Read the Bible as it happened in time.', progress: 5 },
    { id: 'historical', name: 'Historical Plan', duration: '260 Days', description: 'Follow the history of Israel and the early church.', progress: 0 }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-serif italic">Reading Plans</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-emerald-400 transition-colors px-3 py-1.5 border border-primary/30 rounded-full">
            Register
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-zinc-800 transition-colors text-slate-100">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-lg border border-zinc-800/50">
          <button 
            onClick={() => setSelectedTab('active')}
            className={cn(
              "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all",
              selectedTab === 'active' ? "bg-primary text-zinc-950" : "text-zinc-500"
            )}
          >
            My Plans
          </button>
          <button 
            onClick={() => setSelectedTab('discover')}
            className={cn(
              "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all",
              selectedTab === 'discover' ? "bg-primary text-zinc-950" : "text-zinc-500"
            )}
          >
            Discover
          </button>
        </div>

        {/* Plan List */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-primary/40 transition-all cursor-pointer shadow-xl">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 font-serif italic">{plan.name}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{plan.duration}</p>
                  </div>
                  {plan.progress > 0 ? (
                    <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> In Progress
                    </div>
                  ) : (
                    <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Start Now</button>
                  )}
                </div>
                
                <p className="text-sm text-zinc-400 leading-relaxed">{plan.description}</p>
                
                {plan.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Progress</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${plan.progress}%` }}></div>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <PlayCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">Today: Day {Math.floor(plan.progress / 100 * 365) + 1}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Need Guidance?</p>
          <p className="text-sm text-zinc-300">Ask our AI Chaplain to explain any part of your reading plan.</p>
          <Link href="/ai">
            <button className="bg-primary text-zinc-950 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-full mt-2 hover:bg-emerald-400 transition-all">
              Chat Now
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
