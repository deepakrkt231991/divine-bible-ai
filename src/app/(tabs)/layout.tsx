import BottomNav from '@/components/layout/BottomNav';
import React from 'react';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
