// src/app/api/gemini/route.ts
// ✅ Server-side API Route - Uses bible-loader.server.ts (NO React hooks)

import { NextResponse } from 'next/server';
import { loadForGemini } from '@/lib/bible-loader.server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: Request) {
  try {
    const { book, chapter, question, language } = await req.json();
    
    // Validate input
    if (!book || !chapter || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: book, chapter, question' },
        { status: 400 }
      );
    }

    // Load scripture from Bible
    const scripture = await loadForGemini(book, chapter, {
      includeVerseNumbers: true,
      format: 'markdown',
      lang: language || 'hin-hindi'
    });

    if (scripture.startsWith('Error:')) {
      return NextResponse.json(
        { error: scripture },
        { status: 404 }
      );
    }

    // Check if API key exists
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Create prompt for Gemini
    const prompt = `You are a helpful Bible study assistant.

📖 Scripture: ${book.toUpperCase()} ${chapter}
${scripture}

❓ Question: ${question}

Instructions:
1. Answer based ONLY on the scripture above
2. Cite specific verse numbers (e.g., "verse 5 says...")
3. Use the same language as the question
4. Keep answers clear, concise, and encouraging
5. If the question cannot be answered from this chapter, politely say so
6. Do not add external theological commentary unless asked

Please provide a helpful response:`;

    // Call Gemini API
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!geminiRes.ok) {
      const errorData = await geminiRes.json();
      console.error('Gemini API error:', errorData);
      
      if (geminiRes.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.' },
          { status: 401 }
        );
      }
      
      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Gemini API error. Please try again.' },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

    return NextResponse.json({
      book,
      chapter,
      question,
      scripture: scripture.substring(0, 500) + '...',
      answer,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Gemini API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Gemini API route is running',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash'
  });
}