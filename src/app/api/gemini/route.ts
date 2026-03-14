import { NextResponse } from 'next/server';
import { loadForGemini } from '@/lib/bible-loader';

export async function POST(req: Request) {
  try {
    const { book, chapter, question } = await req.json();
    
    const scripture = await loadForGemini(book, chapter);
    
    return NextResponse.json({ 
      answer: `Based on ${book} ${chapter}, here is your answer...` 
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
