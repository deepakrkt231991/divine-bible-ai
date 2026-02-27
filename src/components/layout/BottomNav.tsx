"use client";

import { Home, BookOpen, MessageSquare, Heart, LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Bible", href: "/read", icon: BookOpen },
  { name: "Journal", href: "/journal", icon: Plus, isCenter: true },
  { name: "Community", href: "/community", icon: LayoutGrid },
  { name: "More", href: "/profile", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav px-6 pb-8 pt-3">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          if (item.isCenter) {
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className="relative -mt-12 flex flex-col items-center group"
              >
                <div className="bg-primary shadow-[0_8px_24px_rgba(16,183,127,0.4)] w-14 h-14 rounded-full flex items-center justify-center border-4 border-background transition-transform active:scale-90 group-hover:scale-105">
                  <item.icon className="w-7 h-7 text-background font-bold" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pt-2">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1.5 transition-colors duration-300",
                isActive ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className="relative p-1">
                <item.icon className={cn("w-7 h-7", isActive && "fill-current")} />
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator-glow"
                    className="absolute -inset-2 bg-primary/20 blur-xl rounded-full -z-10"
                  />
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}