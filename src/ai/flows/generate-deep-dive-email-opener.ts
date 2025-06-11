
'use server';
/**
 * @fileOverview A flow to generate hyper-personalized opening lines for cold emails using website content.
 *
 * - generateDeepDiveEmailOpener - A function that generates hyper-personalized opening lines.
 * - GenerateDeepDiveEmailOpenerInput - The input type for the function.
 * - GenerateDeepDiveEmailOpenerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ScrapeWebsiteOutput } from '@/ai/tools/website-scraper-tool'; 
import { scrapeWebsiteContent } from '@/ai/tools/website-scraper-tool';


const GenerateDeepDiveEmailOpenerInputSchema = z.object({
  companyName: z.string().describe('The name of the lead company.'),
  industry: z.string().describe('The industry of the lead company.'),
  location: z.string().describe('The location of the lead company.'),
  websiteUrl: z.string().url().describe('The URL of the company website for deep dive scraping.'),
  salesGoal: z.string().optional().describe("The user's sales goal or product focus for added context."),
});
export type GenerateDeepDiveEmailOpenerInput = z.infer<
  typeof GenerateDeepDiveEmailOpenerInputSchema
>;

const GenerateDeepDiveEmailOpenerOutputSchema = z.object({
  opener: z.string().describe('A hyper-personalized opening line for a cold email based on website content.'),
});
export type GenerateDeepDiveEmailOpenerOutput = z.infer<
  typeof GenerateDeepDiveEmailOpenerOutputSchema
>;

// This schema is for the prompt's direct input, including scraped data
const DeepDivePromptInputSchema = GenerateDeepDiveEmailOpenerInputSchema.extend({
  scrapedTitle: z.string().optional().describe('The title tag content of the website, if successfully scraped.'),
  scrapedParagraph: z.string().optional().describe('The content of the first meaningful paragraph found on the website, if successfully scraped. Could also contain an error message if scraping failed.'),
  scrapedContentIsError: z.boolean().describe('Indicates if the scrapedParagraph contains an error message rather than actual content.'),
});

export async function generateDeepDiveEmailOpener(
  input: GenerateDeepDiveEmailOpenerInput
): Promise<GenerateDeepDiveEmailOpenerOutput> {
  const flowOutput = await generateDeepDiveEmailOpenerFlow(input);
   if (!flowOutput) {
    throw new Error("generateDeepDiveEmailOpenerFlow returned undefined output");
  }
  return flowOutput;
}

const generateDeepDiveEmailOpenerPrompt = ai.definePrompt({
  name: 'generateDeepDiveEmailOpenerPrompt',
  input: {schema: DeepDivePromptInputSchema},
  output: {schema: GenerateDeepDiveEmailOpenerOutputSchema},
  prompt: `You are an expert sales development representative. Your task is to write a compelling, concise, and hyper-personalized opening for a cold email.
You MUST use the provided website information (title and paragraph, if available and not an error message) to make the opener highly specific and relevant to the company.
Naturally incorporate the company name, "{{{companyName}}}".
Your tone should be professional yet curious.
The opener should pique interest and create a natural reason to continue the conversation, perhaps by highlighting something specific from their website and connecting it to a potential area of interest or a relevant observation.
Do not offer a direct solution yet, but rather open the door for discussion.

Company Name: {{{companyName}}}
Industry: {{{industry}}}
Location: {{{location}}}
{{#if salesGoal}}User's Sales Goal/Product: {{{salesGoal}}}{{/if}}

{{#if scrapedTitle}}Website Title: "{{{scrapedTitle}}}"{{/if}}
{{#if scrapedParagraph}}
  {{#unless scrapedContentIsError}}
Relevant snippet from their website: "{{{scrapedParagraph}}}"
  {{else}}
Note: Attempted to scrape website, but encountered an issue: {{{scrapedParagraph}}}
  {{/unless}}
{{/if}}

Craft the opening line(s) based on ALL available information.
Prioritize referencing specific details from their website (title or paragraph) if successfully scraped (scrapedContentIsError is false).
If website information is unavailable or scraping failed (scrapedContentIsError is true), generate the best possible opener based on other details like industry, location, and company name, aiming for a similar professional and curious tone that encourages discussion.

Opening:`,
});

const generateDeepDiveEmailOpenerFlow = ai.defineFlow(
  {
    name: 'generateDeepDiveEmailOpenerFlow',
    inputSchema: GenerateDeepDiveEmailOpenerInputSchema,
    outputSchema: GenerateDeepDiveEmailOpenerOutputSchema,
  },
  async (flowInput: GenerateDeepDiveEmailOpenerInput) => {
    let scrapedTitle: string | undefined = undefined;
    let scrapedParagraph: string | undefined = undefined;
    let scrapedContentIsError = false;

    if (flowInput.websiteUrl) {
      try {
        const scrapedData: ScrapeWebsiteOutput = await scrapeWebsiteContent({ websiteUrl: flowInput.websiteUrl });
        scrapedTitle = scrapedData.scrapedTitle;
        scrapedParagraph = scrapedData.scrapedParagraph; 
        if (scrapedParagraph && scrapedParagraph.startsWith('Scraping failed:')) {
          scrapedContentIsError = true;
        }
      } catch (toolError: any) {
        console.warn(`Deep dive scraping tool execution failed for ${flowInput.websiteUrl}: ${toolError.message}`);
        scrapedParagraph = `Scraping failed: ${toolError.message}`; // Pass error to prompt
        scrapedContentIsError = true;
      }
    }

    const promptPayload = {
      ...flowInput,
      scrapedTitle,
      scrapedParagraph,
      scrapedContentIsError,
    };
    
    const {output} = await generateDeepDiveEmailOpenerPrompt(promptPayload);
    if (!output) {
        throw new Error("Failed to generate deep dive email opener.");
    }
    return output;
  }
);
