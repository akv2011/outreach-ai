
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-email-opener.ts';
import '@/ai/tools/website-scraper-tool.ts';
import '@/ai/flows/generate-deep-dive-email-opener.ts';
import '@/ai/flows/generate-email-subject.ts'; // Added new flow
