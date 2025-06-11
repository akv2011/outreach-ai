
'use server';

/**
 * @fileOverview A flow to generate personalized opening lines for cold emails.
 *
 * - generateEmailOpener - A function that generates personalized opening lines for cold emails.
 * - GenerateEmailOpenerInput - The input type for the generateEmailOpener function.
 * - GenerateEmailOpenerOutput - The return type for the generateEmailOpener function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailOpenerInputSchema = z.object({
  companyName: z.string().describe('The name of the lead company.'),
  industry: z.string().describe('The industry of the lead company.'),
  location: z.string().describe('The location of the lead company.'),
  salesGoal: z.string().optional().describe('The user\'s sales goal or product focus for added context.'),
  website: z.string().optional().describe('The company\'s website URL, for potential future deep dive.')
});
export type GenerateEmailOpenerInput = z.infer<
  typeof GenerateEmailOpenerInputSchema
>;

const GenerateEmailOpenerOutputSchema = z.object({
  opener: z.string().describe('A personalized, 2-sentence opening for a cold email.'),
});
export type GenerateEmailOpenerOutput = z.infer<
  typeof GenerateEmailOpenerOutputSchema
>;

export async function generateEmailOpener(
  input: GenerateEmailOpenerInput
): Promise<GenerateEmailOpenerOutput> {
  const flowOutput = await generateEmailOpenerFlow(input);
  if (!flowOutput) {
    throw new Error("generateEmailOpenerFlow returned undefined output");
  }
  return flowOutput;
}

const generateEmailOpenerPrompt = ai.definePrompt({
  name: 'generateEmailOpenerPrompt',
  input: {schema: GenerateEmailOpenerInputSchema},
  output: {schema: GenerateEmailOpenerOutputSchema},
  prompt: `You are an expert sales development representative. Your task is to write a compelling, 2-sentence opening for a cold email.
Sentence 1 must be a personalized observation that mentions the prospect's Company Name ({{{companyName}}}), their Industry ({{{industry}}}), and their Location ({{{location}}}).
Sentence 2 must be an insightful, open-ended question that connects their industry to a common business challenge, creating a reason to talk.
Your tone should be professional yet curious. Do not offer a solution yet. Just state the observation and ask the question.
{{#if salesGoal}}Consider this sales goal for context when framing the challenge: {{{salesGoal}}}{{/if}}

Opener:`,
});

const generateEmailOpenerFlow = ai.defineFlow(
  {
    name: 'generateEmailOpenerFlow',
    inputSchema: GenerateEmailOpenerInputSchema,
    outputSchema: GenerateEmailOpenerOutputSchema,
  },
  async input => {
    const {output} = await generateEmailOpenerPrompt(input);
    // Ensure output is not undefined, though definePrompt with an output schema should guarantee it
    if (!output) {
      throw new Error('AI prompt did not return an output.');
    }
    return output;
  }
);

