import BottomNav from '@/components/layout/BottomNav';
import React from 'react';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-zinc-950">
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
