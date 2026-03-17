import BottomNav from '@/components/layout/BottomNav';
import React from 'react';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-zinc-950">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}