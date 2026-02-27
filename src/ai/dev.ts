
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-scripture-question-flow.ts';
import '@/ai/flows/ai-scripture-question.ts';
import '@/ai/flows/ai-scripture-reflection.ts';
import '@/ai/flows/daily-verse-agent.ts';
import '@/ai/flows/smart-bible-search.ts';
import '@/ai/flows/bible-quiz-flow.ts';
