// src/app/api/gemini/route.ts
// ✅ Server-side Gemini API Route - No React hooks, No crashes
// ✅ Uses bible-loader.ts for scripture loading
// ✅ Proper error handling + rate limiting ready

import { NextResponse } from 'next/server';
import { loadForGemini } from '@/lib/bible-loader';

// ============ CONFIG ============
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ============ POST: Handle Gemini Questions ============
export async function POST(req: Request) {
  try {
    // Parse request body
    const { book, chapter, question, language } = await req.json();
    
    // Validate required fields
    if (!book || !chapter || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: book, chapter, question' },
        { status: 400 }
      );
    }

    // Load scripture from Bible (uses split JSON files)
    const scripture = await loadForGemini(book, chapter, {
      includeVerseNumbers: true,
      format: 'markdown',
      lang: language || 'eng-kjv'  // Default to our parsed KJV
    });

    // Check if scripture loaded successfully
    if (scripture.startsWith('Error:')) {
      return NextResponse.json(
        { error: scripture },
        { status: 404 }
      );
    }

    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Create prompt for Gemini AI
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
          temperature: 0.3,      // Focused, not too creative
          topK: 40,              // Diversity control
          topP: 0.95,            // Nucleus sampling
          maxOutputTokens: 2048, // Max response length
        }
      })
    });

    // Handle Gemini API errors
    if (!geminiRes.ok) {
      let errorData = {};
      try {
        errorData = await geminiRes.json();
      } catch (e) {
        // Ignore JSON parse errors
      }
      
      console.error('Gemini API error:', {
        status: geminiRes.status,
        statusText: geminiRes.statusText,
        error: errorData
      });
      
      // Specific error responses
      if (geminiRes.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Gemini API key. Check GEMINI_API_KEY in environment variables.' },
          { status: 401 }
        );
      }
      
      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
      
      if (geminiRes.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request. Check your input parameters.' },
          { status: 400 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { error: 'Gemini API error. Please try again.' },
        { status: 500 }
      );
    }

    // Parse successful response
    const geminiData = await geminiRes.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

    // Return success response
    return NextResponse.json({
      success: true,
      book,
      chapter,
      question,
      scripture: scripture.substring(0, 500) + (scripture.length > 500 ? '...' : ''),
      answer,
      timestamp: new Date().toISOString(),
      model: GEMINI_MODEL
    });
    
  } catch (error: any) {
    // Catch unexpected errors
    console.error('Gemini API route error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    return NextResponse.json(
      { error: error?.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// ============ GET: Health Check Endpoint ============
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Gemini API route is running',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    model: GEMINI_MODEL,
    endpoint: GEMINI_URL.replace(GEMINI_API_KEY ? `?key=${GEMINI_API_KEY}` : '', ''),
    timestamp: new Date().toISOString()
  });
}