"use client";
import { Home, BookOpen, MessageSquare, PlayCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Read", href: "/read", icon: BookOpen },
  { name: "AI Guide", href: "/ai", icon: MessageSquare },
  { name: "Audio", href: "/audio", icon: PlayCircle },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50 h-18 bg-zinc-900/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl px-6">
      <div className="max-w-md mx-auto flex justify-between items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center w-full h-full gap-1 group">
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-primary text-black" : "text-zinc-500 hover:text-primary hover:bg-primary/10"
              )}>
                <item.icon className="w-6 h-6" />
              </div>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { cn } from "@/lib/utils";