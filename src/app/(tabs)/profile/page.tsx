
'use client';

import React, { useState, useEffect } from 'react';
import { User, Settings, Languages, Moon, Sun, ChevronRight, LogOut, ShieldCheck, HelpCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, auth } = useFirebase();
  const { toast } = useToast();
  const [lang, setLang] = useState('IRV_HIN');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedLang = localStorage.getItem('bible_language') || 'IRV_HIN';
    setLang(savedLang);
  }, []);

  const handleLangToggle = () => {
    const newLang = lang === 'KJV' ? 'IRV_HIN' : 'KJV';
    setLang(newLang);
    localStorage.setItem('bible_language', newLang);
    toast({ title: "Language Updated", description: `Primary translation set to ${newLang === 'KJV' ? 'English' : 'Hindi'}.` });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-emerald-500/10 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-white italic">Settings</h1>
          <button className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-10">
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="size-24 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
            <User className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif italic text-white">{user?.displayName || 'Spiritual Journey'}</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{user?.email || 'Guest Explorer'}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2">App Customization</h3>
          <div className="space-y-3">
            <button onClick={handleLangToggle} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-5 flex items-center justify-between group transition-all hover:border-emerald-500/40">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Languages className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">Bible Language</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{lang === 'KJV' ? 'English (KJV)' : 'Hindi (IRV)'}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
            </button>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-5 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-sm">App Theme</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Dark Mode Only</span>
                </div>
              </div>
              <div className="bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Locked</div>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2">Support & Safety</h3>
          <div className="space-y-3">
            {[
              { icon: HelpCircle, title: 'Help & FAQ' },
              { icon: LogOut, title: 'Sign Out', danger: true }
            ].map((item, i) => (
              <button key={i} className="w-full bg-zinc-900 border border-zinc-800 rounded-[1.5rem] p-5 flex items-center justify-between group transition-all hover:border-emerald-500/40">
                <div className="flex items-center gap-4">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center", item.danger ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500")}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={cn("font-bold text-sm", item.danger && "text-red-500")}>{item.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </section>

        <div className="text-center pt-8 border-t border-zinc-800/50">
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">"Thy word is a lamp unto my feet"</p>
        </div>
      </main>
    </div>
  );
}
