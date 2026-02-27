'use server';
/**
 * @fileOverview Generates a 3-question Bible quiz based on a provided text context using Gemini.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizInputSchema = z.object({
  context: z.string().describe('The biblical text or passage to base the quiz on.')
});

const QuizOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('The quiz question in Hindi.'),
    options: z.array(z.string()).describe('4 possible answers.'),
    correctAnswerIndex: z.number().describe('0-3 index of the correct answer.'),
    explanation: z.string().describe('Short spiritual explanation in Hindi.')
  }))
});

export async function generateBibleQuiz(input: z.infer<typeof QuizInputSchema>) {
  return bibleQuizFlow(input);
}

const bibleQuizPrompt = ai.definePrompt({
  name: 'bibleQuizPrompt',
  input: {schema: QuizInputSchema},
  output: {schema: QuizOutputSchema},
  prompt: `You are a world-class Bible Scholar and Quiz Master. 
Use this biblical context to create a challenge: "{{{context}}}". 

Generate 3 high-quality multiple-choice questions in simple Hindi.
For each question:
1. Provide 4 distinct options.
2. Mark the correct_answer_index (0-3).
3. Provide a short, encouraging explanation based on the text.

Return ONLY a JSON object. Ensure the tone is wise, encouraging, and accurate.`,
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
