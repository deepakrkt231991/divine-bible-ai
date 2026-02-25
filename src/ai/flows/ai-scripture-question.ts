'use server';
/**
 * @fileOverview An AI agent that provides intelligent and contextual answers to questions about Bible passages.
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
    .describe(
      'The specific Bible passage or verse the user is currently reading. E.g., "John 3:16" or "Psalm 23".'
    ),
  question: z
    .string()
    .describe(
      'The user\'s question about the provided Bible passage. E.g., "What does this verse mean?" or "How does this apply to modern life?".'
    ),
});
export type AiScriptureQuestionInput = z.infer<
  typeof AiScriptureQuestionInputSchema
>;

const AiScriptureQuestionOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      'An intelligent and contextual answer to the user\'s question about the Bible passage.'
    ),
});
export type AiScriptureQuestionOutput = z.infer<
  typeof AiScriptureQuestionOutputSchema
>;

export async function aiScriptureQuestion(
  input: AiScriptureQuestionInput
): Promise<AiScriptureQuestionOutput> {
  return aiScriptureQuestionFlow(input);
}

const aiScriptureQuestionPrompt = ai.definePrompt({
  name: 'aiScriptureQuestionPrompt',
  input: {schema: AiScriptureQuestionInputSchema},
  output: {schema: AiScriptureQuestionOutputSchema},
  prompt: `You are an expert theologian and biblical scholar, known for your deep understanding of scripture and ability to explain complex concepts clearly and contextually. Your task is to provide an intelligent and contextual answer to a user's question about a specific Bible passage.

Bible Passage: {{{passage}}}
User's Question: {{{question}}}

Provide a comprehensive and insightful answer that directly addresses the user's question, drawing upon your biblical knowledge. Focus on the meaning, historical context, and potential applications of the passage.`,
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
