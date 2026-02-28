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
    { name: 'AI Magic', href: '/ai', icon: Sparkles, center: true },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'More', href: '/more', icon: LayoutGrid },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 px-6 pb-4 pt-2 bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.center) {
            return (
              <div key={item.name} className="relative -top-8 flex flex-col items-center">
                <Link
                  href={item.href}
                  className={cn(
                    "size-14 bg-emerald-500 text-black rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center hover:scale-110 transition-all border-[4px] border-[#09090b] active:scale-95 group",
                    isActive && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#09090b]"
                  )}
                >
                  <item.icon className="w-7 h-7 font-bold group-hover:animate-pulse" />
                </Link>
                <span className={cn(
                  "text-[8px] font-black tracking-[0.15em] text-center block mt-1.5 uppercase",
                  isActive ? "text-emerald-500" : "text-zinc-600"
                )}>
                  AI
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 px-2 pb-1",
                isActive ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2 bg-emerald-500/15 blur-lg rounded-full -z-10" />
                )}
                <item.icon className={cn("w-5 h-5 transition-all", isActive && "scale-110")} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.05em] leading-normal">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
