'use server';
/**
 * @fileOverview A daily verse agent that generates devotional content for an Indian audience.
 *
 * - dailyVerseAgent - A function that handles the daily verse generation process.
 * - DailyVerseAgentOutput - The return type for the dailyVerseAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// No input schema needed as the prompt is self-contained.
export type DailyVerseAgentInput = void;


const QuizQuestionSchema = z.object({
    question: z.string().describe("The quiz question."),
    options: z.array(z.string()).describe("An array of 4 possible answers."),
    correctAnswer: z.number().describe("The index of the correct answer in the options array."),
});

const DailyVerseAgentOutputSchema = z.object({
  verseReference: z.string().describe("The Bible verse reference (e.g., 'John 3:16')."),
  verseTextEnglish: z.string().describe("The full text of the verse in English."),
  verseTextHindi: z.string().describe("The full text of the verse in Hindi."),
  explanation: z.string().describe("A short, 60-second explanation of the verse in simple Hindi."),
  takeaways: z.array(z.string()).describe("An array of 3 bullet points on what to learn from the verse."),
  prayer: z.string().describe("A heartfelt prayer in Hindi related to the verse."),
  instagramCaption: z.string().describe("An emotional Instagram Reel caption with a call to action."),
  instagramHashtags: z.array(z.string()).describe("An array of 15 relevant hashtags."),
  quiz: z.array(QuizQuestionSchema).describe("A 5-question multiple choice quiz in JSON format."),
  songLyrics: z.string().describe("Short, 2-line song lyrics based on the verse."),
});

export type DailyVerseAgentOutput = z.infer<typeof DailyVerseAgentOutputSchema>;

export async function dailyVerseAgent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  input: DailyVerseAgentInput
): Promise<DailyVerseAgentOutput> {
  return dailyVerseAgentFlow();
}

const dailyVerseAgentPrompt = ai.definePrompt({
  name: 'dailyVerseAgentPrompt',
  output: {schema: DailyVerseAgentOutputSchema},
  prompt: `You are a professional Bible teacher for an Indian audience.
Today's date: ${new Date().toLocaleDateString('hi-IN')}

Pick one powerful Bible verse (Hindi + English) from popular ones or suggest a fresh one.

Then create:
1. Verse reference + full text (Hindi + English)
2. Short 60-second explanation in simple Hindi
3. 3 bullet points "Aaj is vachan se hum kya seekhein"
4. Ek heartfelt prayer (Hindi)
5. Instagram Reel caption (emotional + call to action) + 15 relevant hashtags
6. 5-question multiple choice quiz (JSON format) for users to play
7. Short song lyrics (2 lines) on this verse for background music

Tone: Loving, encouraging, like a caring pastor. Use words like Prabhu, vachan, ashish, etc.
Please provide the output in the specified JSON format.
`,
});

const dailyVerseAgentFlow = ai.defineFlow(
  {
    name: 'dailyVerseAgentFlow',
    outputSchema: DailyVerseAgentOutputSchema,
  },
  async () => {
    const {output} = await dailyVerseAgentPrompt();
    return output!;
  }
);
