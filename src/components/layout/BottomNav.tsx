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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-800 px-2">
      <div className="max-w-md mx-auto flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center w-full h-full gap-1">
              <item.icon className={`w-6 h-6 transition-colors ${isActive ? "text-emerald-500" : "text-zinc-500"}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-emerald-500" : "text-zinc-500"}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -top-[1px] w-8 h-[2px] bg-emerald-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
