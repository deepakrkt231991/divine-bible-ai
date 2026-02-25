'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate a short, personalized reflection or devotional
 * based on a Bible verse or passage, offering spiritual insights and daily life application.
 *
 * - aiScriptureReflection - A function that generates a scripture reflection.
 * - AiScriptureReflectionInput - The input type for the aiScriptureReflection function.
 * - AiScriptureReflectionOutput - The return type for the aiScriptureReflection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AiScriptureReflectionInputSchema = z.object({
  versePassage: z
    .string()
    .describe('The Bible verse or passage to reflect upon (e.g., "John 3:16" or "Psalm 23").'),
  userContext: z
    .string()
    .optional()
    .describe(
      "Optional: User's current situation or specific area they want the reflection to focus on (e.g., 'feeling anxious about work', 'seeking guidance on forgiveness')."
    ),
});
export type AiScriptureReflectionInput = z.infer<typeof AiScriptureReflectionInputSchema>;

// Output Schema
const AiScriptureReflectionOutputSchema = z.object({
  reflectionTitle: z.string().describe('A concise and inspiring title for the reflection or devotional.'),
  reflectionContent: z
    .string()
    .describe('The main content of the personalized reflection or devotional, providing spiritual insights and practical application.'),
});
export type AiScriptureReflectionOutput = z.infer<typeof AiScriptureReflectionOutputSchema>;

// Wrapper function
export async function aiScriptureReflection(
  input: AiScriptureReflectionInput
):
  Promise<AiScriptureReflectionOutput> {
  return aiScriptureReflectionFlow(input);
}

// Genkit Prompt definition
const scriptureReflectionPrompt = ai.definePrompt({
  name: 'scriptureReflectionPrompt',
  input: {schema: AiScriptureReflectionInputSchema},
  output: {schema: AiScriptureReflectionOutputSchema},
  prompt: `You are a spiritual guide and devotional writer. Your task is to generate a short, personalized reflection or devotional based on a given Bible verse or passage. The reflection should offer spiritual insights and practical applications for daily life.\n\nVerse/Passage: {{{versePassage}}}\n\n{{#if userContext}}\nUser's current context/focus: {{{userContext}}}\nPersonalize the reflection to address this context.\n{{/if}}\n\nPlease generate a reflection with a clear title and content.`,
});

// Genkit Flow definition
const aiScriptureReflectionFlow = ai.defineFlow(
  {
    name: 'aiScriptureReflectionFlow',
    inputSchema: AiScriptureReflectionInputSchema,
    outputSchema: AiScriptureReflectionOutputSchema,
  },
  async input => {
    const {output} = await scriptureReflectionPrompt(input);
    return output!;
  }
);
