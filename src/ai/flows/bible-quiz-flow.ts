
'use server';
/**
 * @fileOverview Generates a 5-question Bible quiz based on a specific verse.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizInputSchema = z.object({
  verse: z.string().describe('The verse to base the quiz on.')
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
  prompt: `You are an expert Bible teacher. Generate 5 challenging but fair multiple-choice questions based on the following verse:
Verse: {{{verse}}}

Provide 4 options for each question and clearly mark the correct answer index (0-3). Include a short explanation for why the answer is correct.`,
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
