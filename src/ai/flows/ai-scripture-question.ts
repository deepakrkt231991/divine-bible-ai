
'use server';
/**
 * @fileOverview An AI agent that provides wise biblical answers using only scripture references.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiScriptureQuestionInputSchema = z.object({
  passage: z.string().describe('The context passage.'),
  question: z.string().describe('The user\'s spiritual question.')
});

const AiScriptureQuestionOutputSchema = z.object({
  answer: z.string().describe('A wise answer using scripture references.')
});

export async function aiScriptureQuestion(input: z.infer<typeof AiScriptureQuestionInputSchema>) {
  return aiScriptureQuestionFlow(input);
}

const aiScriptureQuestionPrompt = ai.definePrompt({
  name: 'aiScriptureQuestionPrompt',
  input: {schema: AiScriptureQuestionInputSchema},
  output: {schema: AiScriptureQuestionOutputSchema},
  prompt: `You are a wise Bible scholar. Your task is to provide spiritual guidance and answers to users.
IMPORTANT: You must answer only using scripture references and biblical principles. 
If a user asks about a general life topic, relate it back to the Bible.

Current Context (if any): {{{passage}}}
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
