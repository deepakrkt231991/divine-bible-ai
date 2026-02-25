import { NextResponse } from 'next/server';
import { dailyVerseAgent } from '@/ai/flows/daily-verse-agent';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// This route will be called by Vercel cron for the daily auto agent run
export async function GET() {
  try {
    console.log('Daily Verse Agent triggered by cron at', new Date().toISOString());

    // 1. Run the AI agent to get the daily content
    const data = await dailyVerseAgent();

    // 2. Prepare the data for saving.
    // We are on the server, so we can't generate a canvas image.
    // We'll save the content without an image URL.
    const contentToSave = {
        ...data,
        createdAt: serverTimestamp(),
        date: new Date(),
        imageUrl: "" // No image from server-side cron
    };

    // 3. Save the generated content to Firestore
    await addDoc(collection(db, 'daily_content'), contentToSave);

    console.log('Daily Verse Agent finished successfully.');

    return NextResponse.json({ success: true, message: 'Daily agent ran successfully.' });
  } catch (error) {
    console.error('Cron job error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: 'Failed to run daily agent.', details: errorMessage }, { status: 500 });
  }
}
