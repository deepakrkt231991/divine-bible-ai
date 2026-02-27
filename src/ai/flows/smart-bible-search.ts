
'use server';
/**
 * @fileOverview A Smart AI-powered Bible search agent that understands context.
 *
 * - smartBibleSearch - A function that interprets user queries and suggests Bible references.
 * - SmartSearchInput - The input type for the function.
 * - SmartSearchOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSearchInputSchema = z.object({
  query: z.string().describe('The user\'s spiritual search query or topic, e.g., "Peace in sorrow" or "Dukh mein shanti".'),
  language: z.string().default('Hindi').describe('The language for the explanation.'),
});

const SmartSearchOutputSchema = z.object({
  suggestedVerses: z.array(z.object({
    reference: z.string().describe('The verse reference, e.g., "John 3:16" or "Psalm 23:1".'),
    context: z.string().describe('Why this verse is relevant to the user\'s query in Hindi/English.'),
    bookId: z.number().optional().describe('Bolls.life Book ID if known.'),
    chapter: z.number().optional().describe('Chapter number.'),
  })).describe('List of recommended verses based on context.'),
  thematicInsight: z.string().describe('A short spiritual summary of why these verses were chosen.'),
});

export async function smartBibleSearch(input: z.infer<typeof SmartSearchInputSchema>) {
  return smartBibleSearchFlow(input);
}

const smartSearchPrompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: {schema: SmartSearchInputSchema},
  output: {schema: SmartSearchOutputSchema},
  prompt: `You are a world-class Bible Scholar and Spiritual Guide. 
The user is searching for something contextual in the Bible: "{{{query}}}".

If the query is a topic like "sorrow", "peace", "forgiveness", or "strength", provide 3-5 of the most powerful and relevant Bible verses.
If the query is in Hindi/Marathi, respond in a mix of Hindi and English as requested by the user.

For each verse:
1. Provide the full reference (e.g., "Psalm 23:1").
2. Explain in 1 sentence why it fits the query "{{{query}}}".

Return only the JSON object as defined. Ensure the tone is wise, loving, and authoritative.`,
});

const smartBibleSearchFlow = ai.defineFlow(
  {
    name: 'smartBibleSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async input => {
    const {output} = await smartSearchPrompt(input);
    return output!;
  }
);
