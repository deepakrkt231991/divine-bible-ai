// src/app/(tabs)/read/page.tsx
// ✅ MINIMAL WORKING VERSION - No EOF errors

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChapter } from '@/lib/bible-loader.client';

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ReaderContent />
    </Suspense>
  );
}

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const book = searchParams.get('book') || 'GEN';
  const chapter = parseInt(searchParams.get('chapter') || '1');
  const lang = searchParams.get('lang') || 'hin';
  
  const { verses, loading, error } = useChapter(book.toLowerCase(), chapter, `${lang}-hindi`);

  if (loading) {
    return <div className="p-4 text-center">Loading {book} {chapter}...</div>;
  }
  
  if (error || !verses) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error || 'Chapter not found'}</p>
        <p className="text-sm text-gray-500 mt-2">Book: {book}, Chapter: {chapter}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {book.toUpperCase()} {chapter}
      </h1>
      <div className="space-y-3">
        {verses.map((verse: any) => (
          <p key={verse.verse} className="leading-relaxed">
            <sup className="font-bold text-emerald-500 mr-2">{verse.verse}</sup>
            {verse.text}
          </p>
        ))}
      </div>
    </div>
  );
}