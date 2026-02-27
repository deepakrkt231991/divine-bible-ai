
'use client';

import React from 'react';
import { Home, BookOpen, Sparkles, Users, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Bible', href: '/read', icon: BookOpen },
    { name: 'AI Magic', href: '/ai', icon: Sparkles, center: true },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'More', href: '/more', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 px-6 pb-6 pt-3 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.center) {
            return (
              <div key={item.name} className="relative -top-8">
                <Link
                  href={item.href}
                  className={cn(
                    "size-14 bg-primary text-zinc-950 rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform border-4 border-zinc-950",
                    isActive && "ring-2 ring-primary ring-offset-2 ring-offset-zinc-950"
                  )}
                >
                  <item.icon className="w-7 h-7 font-bold fill-current" />
                </Link>
                <span className={cn(
                  "text-[10px] font-bold tracking-widest text-center block mt-2 uppercase",
                  isActive ? "text-primary" : "text-zinc-500"
                )}>
                  {item.name}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2 bg-primary/20 blur-md rounded-full -z-10" />
                )}
                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest leading-normal">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
