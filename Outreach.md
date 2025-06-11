# OutreachAI: Accelerating Lead Prioritization and Engagement

**Author:** Malini
**For:** Caprae Capital Partners - Intern Pre-Work

## Introduction

In the fast-paced world of sales and M&A, I've observed that lead lists are abundant, but actionable intelligence is often scarce. Raw CSV files, like those from SaaSquatch Enrichment, typically present a flat view of potential opportunities. I understood that manually sifting through these lists to identify high-potential leads and then crafting personalized outreach is a time-consuming and inefficient process. Consequently, generic outreach campaigns tend to suffer from low engagement and conversion rates.

I developed OutreachAI as my solution to this challenge. It's a web application I designed to transform static lead lists into dynamic, prioritized dashboards. By combining quantitative scoring with AI-driven qualitative enrichment, I aimed for OutreachAI to empower users to quickly identify the most promising leads and engage them with highly personalized, context-aware messaging.

## Approach & Model Selection

My core approach in building OutreachAI was to create a tool that not only prioritizes leads but also assists in the crucial first step of outreach: crafting a compelling opening.

*   **AI Model Selection:** For the AI-powered text generation, I decided to select Google's **Gemini 2.0 Flash** model, accessed via the **Genkit** framework.
    *   **My Rationale:** I chose Gemini 2.0 Flash because it offers a strong balance of sophisticated text generation capabilities, speed, and cost-effectiveness. This makes it suitable for generating concise and contextually relevant email openers and subject lines. Its ability to understand and follow complex instructions within prompts, including my requests for structured output (like a two-sentence opener with specific content for each sentence), was crucial for my project.
*   **Genkit Framework:** I also utilized the Genkit framework to streamline my integration with the Gemini model. I found that Genkit simplifies defining AI flows, managing prompts, and incorporating "tools" – custom functions the AI can leverage. This was particularly useful when I implemented the "Deep Dive" web scraping functionality.

## Data Preprocessing & Enrichment

I designed OutreachAI to perform several layers of data processing and enrichment:

1.  **CSV Parsing:** My application ingests SaaSquatch Enrichment CSV files. I built the parser to be flexible, correctly interpreting various formats for fields like `Revenue` (e.g., "4.7M", "500k", "1000000") and `Employee Count`. It also derives `Location` from `City` and `State` if a direct `Location` field isn't available.
2.  **Quantitative Lead Scoring:** I implemented a system where each lead is assigned a **Priority Score** (0-100). I calculate this score based on a weighted model that considers:
    *   Revenue (up to 30 points)
    *   Employee Count (up to 30 points)
    *   Owner's Title (up to 20 points)
    *   BBB Rating (up to 20 points)
    I made the scoring logic transparent; users can hover over a score to see a detailed breakdown, which I believe fosters trust and understanding of the prioritization.
3.  **Customizable AI Persona:** I enabled users to input their "Sales Goal / Product Focus." This context is dynamically injected into all AI prompts I designed, ensuring the generated content aligns with the user's specific objectives.
4.  **Standard AI Email Opener Generation:** My application automatically generates an initial 2-sentence email opener for each lead. The prompt I created guides the AI to:
    *   **Sentence 1:** Craft a personalized observation mentioning the prospect's Company Name, Industry, and Location.
    *   **Sentence 2:** Formulate an insightful, open-ended question connecting their industry to a common business challenge, creating a reason to talk.
5.  **"Deep Dive" Hyper-Personalized Opener:** For a more tailored approach, I included the "Deep Dive" feature, which allows users to:
    *   Trigger a real-time scrape of the lead's website (which I implemented as a Genkit tool using `axios` and `cheerio` to fetch the `<title>` and first meaningful `<p>` tag).
    *   Feed this scraped website content, along with other lead details and the sales goal, into a specialized AI prompt I developed.
    *   The AI then generates a hyper-personalized opener that directly references the company's own messaging or focus.
6.  **AI Email Subject Line Generation:** When the user opts to "Prefill Email," my application generates a compelling subject line. This AI prompt takes into account the company name, industry, the already generated email opener, and the user's sales goal.

## Key Features & User Workflow

I designed the user workflow to be intuitive:

1.  **Upload CSV:** The user uploads their lead list.
2.  **Automated Enrichment:** Leads are automatically parsed, scored, and I have the system generate initial AI openers.
3.  **Interactive Dashboard:** Leads are displayed in a sortable table, with clear visual cues I designed (e.g., color-coded badges for Priority Score and BBB Rating).
4.  **Deep Dive:** Users can select individual leads for deeper website-based personalization.
5.  **Actionable Outputs:**
    *   **Copy to Clipboard:** Users can easily copy generated openers.
    *   **Prefill Email:** This action opens the user's default email client with the lead's email address (if available in the CSV), the AI-generated subject line, and the AI-generated opener.

## Performance Evaluation (Conceptual)

While formal, large-scale A/B testing was beyond my project's scope, I believe the performance of OutreachAI can be evaluated through:

*   **Quantitative Metrics:** The Priority Score itself provides a clear, data-driven metric for lead ranking. The efficiency gain from automating parsing and initial outreach drafting can be measured against manual efforts.
*   **Qualitative Assessment:** The relevance, coherence, and personalization level of AI-generated openers and subject lines are key. The "Deep Dive" feature, in particular, I designed to aim for a noticeably higher degree of personalization. Success here would be judged by how well the AI leverages the scraped website content.
*   **User Feedback:** Ultimately, the tool's value is determined by its utility to the end-user. Feedback from sales or M&A professionals on how well the tool helps them identify and engage leads would be the most critical evaluation. The model I cited, Gemini 2.0 Flash, was chosen for its ability to follow instructions and generate creative text, which is central to this qualitative performance.

## Conclusion

OutreachAI, as I've developed it, demonstrates a practical application of modern AI to solve a common business problem. By intelligently combining data processing, quantitative scoring, and AI-driven personalization, my aim is for it to significantly enhance the efficiency and effectiveness of lead outreach, turning raw data into actionable opportunities.
