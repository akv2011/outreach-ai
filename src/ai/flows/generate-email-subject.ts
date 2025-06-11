
'use server';
/**
 * @fileOverview A flow to generate compelling email subject lines.
 *
 * - generateEmailSubject - A function that generates email subject lines.
 * - GenerateEmailSubjectInput - The input type for the function.
 * - GenerateEmailSubjectOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailSubjectInputSchema = z.object({
  companyName: z.string().describe('The name of the lead company.'),
  industry: z.string().describe('The industry of the lead company.'),
  opener: z.string().describe('The already generated opening line for the email body.'),
  salesGoal: z.string().optional().describe("The user's sales goal or product focus for added context."),
});
export type GenerateEmailSubjectInput = z.infer<typeof GenerateEmailSubjectInputSchema>;

const GenerateEmailSubjectOutputSchema = z.object({
  subject: z.string().describe('A concise and compelling email subject line.'),
});
export type GenerateEmailSubjectOutput = z.infer<typeof GenerateEmailSubjectOutputSchema>;

export async function generateEmailSubject(
  input: GenerateEmailSubjectInput
): Promise<GenerateEmailSubjectOutput> {
  const flowOutput = await generateEmailSubjectFlow(input);
  if (!flowOutput) {
    throw new Error("generateEmailSubjectFlow returned undefined output");
  }
  return flowOutput;
}

const generateEmailSubjectPrompt = ai.definePrompt({
  name: 'generateEmailSubjectPrompt',
  input: {schema: GenerateEmailSubjectInputSchema},
  output: {schema: GenerateEmailSubjectOutputSchema},
  prompt: `You are an AI assistant. Your task is to generate a concise and compelling email subject line for a cold outreach email.
The email is for {{{companyName}}}, a company in the {{{industry}}} industry.
The generated opening line for the email body is: "{{{opener}}}"
{{#if salesGoal}}The user's sales goal is: "{{{salesGoal}}}"{{/if}}
Based on all this information, create a subject line that is engaging, relevant, and likely to get the email opened.
Subject Line:`,
});

const generateEmailSubjectFlow = ai.defineFlow(
  {
    name: 'generateEmailSubjectFlow',
    inputSchema: GenerateEmailSubjectInputSchema,
    outputSchema: GenerateEmailSubjectOutputSchema,
  },
  async (input) => {
    const {output} = await generateEmailSubjectPrompt(input);
    if (!output) {
      throw new Error('AI prompt did not return an output for email subject.');
    }
    return output;
  }
);
