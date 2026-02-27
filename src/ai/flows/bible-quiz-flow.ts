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
    question: z.string().describe('The quiz question in Hindi/Marathi.'),
    options: z.array(z.string()).describe('4 possible answers.'),
    correctAnswerIndex: z.number().describe('0-3 index of the correct answer.'),
    explanation: z.string().describe('Short spiritual explanation in Hindi/Marathi.')
  }))
});

export async function generateBibleQuiz(input: z.infer<typeof QuizInputSchema>) {
  return bibleQuizFlow(input);
}

const bibleQuizPrompt = ai.definePrompt({
  name: 'bibleQuizPrompt',
  input: {schema: QuizInputSchema},
  output: {schema: QuizOutputSchema},
  prompt: `You are a world-class Bible Scholar. 
Use this context: "{{{verse}}}". 

Generate 3 high-quality multiple-choice questions in Hindi (with Marathi nuances if requested).
For each question:
1. Provide 4 options.
2. Mark the correct_answer_index (0-3).
3. Provide a short, encouraging explanation.

Return ONLY a JSON object. Ensure the tone is wise and spiritual.`,
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