
'use server';
/**
 * @fileOverview Generates a 3-question Bible quiz based on a specific verse using Gemini.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizInputSchema = z.object({
  verse: z.string().describe('The verse text or reference to base the quiz on.')
});

const QuizOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswerIndex: z.number(),
    explanation: z.string()
  }))
});

export async function generateBibleQuiz(input: z.infer<typeof QuizInputSchema>) {
  return bibleQuizFlow(input);
}

const bibleQuizPrompt = ai.definePrompt({
  name: 'bibleQuizPrompt',
  input: {schema: QuizInputSchema},
  output: {schema: QuizOutputSchema},
  prompt: `You are an expert Bible teacher. Generate 3 multiple-choice questions in Hindi based on the following verse context:
Verse Context: {{{verse}}}

For each question:
1. Provide 4 options.
2. Mark the correct_answer_index (0-3).
3. Provide a short explanation in Hindi.
Ensure the tone is spiritual and encouraging.`,
});

const bibleQuizFlow = ai.defineFlow(
  {
    name: 'bibleQuizFlow',
    inputSchema: QuizInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async input => {
    const {output} = await bibleQuizPrompt(input);
    return output!;
  }
);
