
'use server';
/**
 * @fileOverview An AI agent that provides wise biblical answers using only scripture references.
 *
 * - aiScriptureQuestion - A function that handles the scripture question and answering process.
 * - AiScriptureQuestionInput - The input type for the aiScriptureQuestion function.
 * - AiScriptureQuestionOutput - The return type for the aiScriptureQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiScriptureQuestionInputSchema = z.object({
  passage: z
    .string()
    .optional()
    .describe('Optional: Specific Bible passage for context.'),
  question: z
    .string()
    .describe("The user's spiritual question or topic of inquiry."),
});
export type AiScriptureQuestionInput = z.infer<typeof AiScriptureQuestionInputSchema>;

const AiScriptureQuestionOutputSchema = z.object({
  answer: z
    .string()
    .describe('A wise answer strictly using scripture references and biblical principles.'),
});
export type AiScriptureQuestionOutput = z.infer<typeof AiScriptureQuestionOutputSchema>;

export async function aiScriptureQuestion(
  input: AiScriptureQuestionInput
): Promise<AiScriptureQuestionOutput> {
  return aiScriptureQuestionFlow(input);
}

const aiScriptureQuestionPrompt = ai.definePrompt({
  name: 'aiScriptureQuestionPrompt',
  input: {schema: AiScriptureQuestionInputSchema},
  output: {schema: AiScriptureQuestionOutputSchema},
  prompt: `You are a wise Bible scholar. Your task is to provide spiritual guidance and answers to users.
IMPORTANT: You must answer only using scripture references and biblical principles. 
If a user asks about a general life topic, relate it back to the Bible.
Be loving, encouraging, and authoritative in your use of the Word.

Context (if any): {{{passage}}}
User's Question: {{{question}}}

Provide a comprehensive and insightful answer that directly addresses the user's question, drawing upon your deep biblical knowledge.`,
});

const aiScriptureQuestionFlow = ai.defineFlow(
  {
    name: 'aiScriptureQuestionFlow',
    inputSchema: AiScriptureQuestionInputSchema,
    outputSchema: AiScriptureQuestionOutputSchema,
  },
  async input => {
    const {output} = await aiScriptureQuestionPrompt(input);
    return output!;
  }
);
