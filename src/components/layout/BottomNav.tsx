
'use client';

import React from 'react';
import { Home, BookOpen, Sparkles, Users, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide nav on register/login pages
  if (pathname === '/register' || pathname === '/login') return null;

  const navItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Bible', href: '/read', icon: BookOpen },
    { name: 'AI', href: '/ai', icon: Sparkles, center: true },
    { name: 'People', href: '/community', icon: Users },
    { name: 'More', href: '/more', icon: LayoutGrid },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 px-4 pb-1.5 pt-1 bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto flex items-center justify-between relative h-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.center) {
            return (
              <div key={item.name} className="relative -top-5 flex flex-col items-center scale-90">
                <Link
                  href={item.href}
                  className={cn(
                    "size-10 bg-emerald-500 text-black rounded-xl shadow-[0_5px_15px_rgba(16,185,129,0.3)] flex items-center justify-center hover:scale-105 transition-all border-[2px] border-[#09090b] active:scale-95 group",
                    isActive && "ring-1 ring-emerald-500 ring-offset-1 ring-offset-[#09090b]"
                  )}
                >
                  <item.icon className="w-4 h-4 font-bold group-hover:animate-pulse" />
                </Link>
                <span className={cn(
                  "text-[6px] font-black tracking-[0.1em] text-center block mt-1 uppercase",
                  isActive ? "text-emerald-500" : "text-zinc-600"
                )}>
                  Agent
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-all duration-300 px-1 pb-0.5",
                isActive ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-1 bg-emerald-500/10 blur-md rounded-full -z-10" />
                )}
                <item.icon className={cn("w-3.5 h-3.5 transition-all", isActive && "scale-110")} />
              </div>
              <span className="text-[6px] font-black uppercase tracking-tight leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
