
'use server';
/**
 * @fileOverview A Genkit tool to scrape basic information from a company's website.
 *
 * - scrapeWebsiteContent - A tool that fetches and extracts the title and first paragraph from a given URL.
 * - ScrapeWebsiteInput - The input type for the scrapeWebsiteContent tool.
 * - ScrapeWebsiteOutput - The return type for the scrapeWebsiteContent tool.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import axios from 'axios';
import * as cheerio from 'cheerio';

const ScrapeWebsiteInputSchema = z.object({
  websiteUrl: z.string().url().describe('The URL of the website to scrape.'),
});
export type ScrapeWebsiteInput = z.infer<typeof ScrapeWebsiteInputSchema>;

const ScrapeWebsiteOutputSchema = z.object({
  scrapedTitle: z.string().optional().describe('The title tag content of the website.'),
  scrapedParagraph: z.string().optional().describe('The content of the first meaningful paragraph found on the website.'),
});
export type ScrapeWebsiteOutput = z.infer<typeof ScrapeWebsiteOutputSchema>;

export const scrapeWebsiteContent = ai.defineTool(
  {
    name: 'scrapeWebsiteContent',
    description: 'Fetches a website URL and extracts its title and the first paragraph of content. Useful for getting context about a company directly from their website.',
    inputSchema: ScrapeWebsiteInputSchema,
    outputSchema: ScrapeWebsiteOutputSchema,
  },
  async (input: ScrapeWebsiteInput): Promise<ScrapeWebsiteOutput> => {
    try {
      let url = input.websiteUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const { data } = await axios.get(url, { timeout: 7000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } });
      const $ = cheerio.load(data);

      const scrapedTitle = $('title').first().text().trim() || undefined;
      
      let scrapedParagraph: string | undefined;
      // Try to find a paragraph with a decent amount of text
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        // Prefer paragraphs with more than 10 words as a simple heuristic
        if (text && text.split(' ').length > 10) {
          scrapedParagraph = text;
          return false; // Break the loop
        }
      });
      
      // Fallback to the first non-empty paragraph if the above didn't find one
      if (!scrapedParagraph) {
        $('p').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                scrapedParagraph = text;
                return false;
            }
        });
      }

      return { scrapedTitle, scrapedParagraph };
    } catch (error: any) {
      console.error(`Error scraping website ${input.websiteUrl}: ${error.message}`);
      return { scrapedTitle: undefined, scrapedParagraph: `Scraping failed: ${error.message}` };
    }
  }
);
