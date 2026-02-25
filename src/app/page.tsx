'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <div className="p-4 bg-primary/10 rounded-full">
            <BookOpen className="w-10 h-10 text-primary animate-pulse" />
           </div>
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
  );
}
