"use client";

import { Home, BookOpen, Edit3, Church, Heart, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "HOME", href: "/home", icon: Home },
    { name: "BIBLE", href: "/read", icon: BookOpen },
    { name: "JOURNAL", href: "/journal", icon: Edit3 },
    { name: "PRAY", href: "/pray", icon: Heart },
    { name: "SETTINGS", href: "/profile", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 glass-nav z-50 px-6 pb-8 pt-3">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          
          if (index === 2) { // Middle "Add" style button
            return (
              <div key={item.name} className="relative -top-6">
                <Link 
                  href={item.href}
                  className="size-14 bg-primary text-zinc-950 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Church className="w-8 h-8 font-bold" />
                </Link>
                <span className="text-[10px] font-bold tracking-wide text-zinc-500 block text-center mt-1">
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
                "flex flex-col items-center gap-1 transition-colors duration-300",
                isActive ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-2 bg-primary/20 blur-md rounded-full -z-10" />
                )}
                <item.icon className={cn("w-7 h-7", isActive && "fill-current")} />
              </div>
              <span className="text-[10px] font-bold tracking-wide uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}