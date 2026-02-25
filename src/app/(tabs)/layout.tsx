import BottomNav from '@/components/layout/BottomNav';
import React from 'react';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <main className="pb-20 min-h-screen">{children}</main>
      <BottomNav />
    </div>
  );
}
