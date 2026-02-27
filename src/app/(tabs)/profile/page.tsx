
'use client';

import React, { useState, useEffect } from 'react';
import { User, Settings, Languages, Moon, Sun, ChevronRight, LogOut, ShieldCheck, HelpCircle, Check } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, auth } = useFirebase();
  const { toast } = useToast();
  const [lang, setLang] = useState('IRV_HIN');

  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') || 'IRV_HIN';
    setLang(savedLang);
  }, []);

  const handleLangToggle = () => {
    const newLang = lang === 'KJV' ? 'IRV_HIN' : 'KJV';
    setLang(newLang);
    localStorage.setItem('bible_language', newLang);
    toast({ title: "Language Updated", description: `Primary translation set to ${newLang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}.` });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-white italic">Settings</h1>
          <button className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="size-28 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10 relative group">
            <User className="w-14 h-14 text-emerald-500" />
            <div className="absolute -bottom-1 -right-1 size-8 bg-emerald-500 rounded-xl border-4 border-[#09090b] flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif italic text-white">{user?.displayName || 'Spiritual Journey'}</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">{user?.email || 'Guest Explorer'}</p>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 px-2">App Customization</h3>
          <div className="space-y-4">
            <button onClick={handleLangToggle} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all">
                  <Languages className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base">Bible Translation</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">{lang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Change</span>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
              </div>
            </button>

            <div className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-[1.5rem] p-6 flex items-center justify-between opacity-50 grayscale">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Moon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-base">App Appearance</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Dark Mode (Optimized)</span>
                </div>
              </div>
              <div className="bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Locked</div>
            </div>
          </div>
        </section>

        <section className="space-y-6 pt-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 px-2">Account & Support</h3>
          <div className="space-y-4">
            {[
              { icon: HelpCircle, title: 'Help & FAQ' },
              { icon: LogOut, title: 'Sign Out Account', danger: true }
            ].map((item, i) => (
              <button key={i} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-6 flex items-center justify-between group transition-all hover:border-emerald-500/40">
                <div className="flex items-center gap-4">
                  <div className={cn("size-12 rounded-2xl flex items-center justify-center transition-all", item.danger ? "bg-red-500/10 text-red-500 group-hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20")}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className={cn("font-bold text-base", item.danger && "text-red-500")}>{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-all" />
              </button>
            ))}
          </div>
        </section>

        <div className="text-center pt-10 border-t border-zinc-800/50">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
