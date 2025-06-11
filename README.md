
# OutreachAI: Lead Prioritization & Personalized Email Generation

OutreachAI is a Next.js web application designed to transform static lead lists from SaaSquatch Enrichment CSV files into dynamic, prioritized dashboards. It leverages AI (Google's Gemini 2.0 Flash via Genkit) to generate personalized email openers and subject lines, helping sales and M&A teams identify and engage high-potential leads more effectively.

## Core Features

-   **CSV Upload:** Simple interface for uploading SaaSquatch Enrichment Results CSV files.
-   **Data Parsing & Enrichment:** Parses the CSV, cleans data, and presents it in a clear, tabular format.
-   **Lead Scoring:** Calculates a priority score for each lead based on revenue, employee count, title, and BBB rating. Hover over the score for a detailed breakdown.
-   **Customizable AI Persona:** Users can input their "Sales Goal / Product Focus" to tailor AI-generated content.
-   **Standard AI Email Opener Generation:** Automatically generates a 2-sentence email opener using company name, industry, and location.
-   **"Deep Dive" Hyper-Personalized Opener:** For leads with websites, performs real-time web scraping (title and first paragraph) to generate a hyper-personalized opener.
-   **AI Email Subject Generation:** Creates compelling subject lines based on lead details, the opener, and the sales goal.
-   **Actionable Dashboard UI:** Interactive table sorted by Priority Score with company details and AI-generated content.
-   **Copy to Clipboard:** Easy copy-to-clipboard for AI-generated openers.
-   **Prefill Email:** Opens the user's default email client with the lead's email (if available), AI-generated subject, and AI-generated opener.

## Tech Stack

-   **Frontend:** Next.js (App Router), React, TypeScript
-   **UI:** ShadCN UI components, Tailwind CSS
-   **AI Integration:** Genkit, Google Gemini 2.0 Flash
-   **Web Scraping:** Axios, Cheerio (used within a Genkit tool)

## Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn

### Installation

1.  **Clone the repository (if applicable) or ensure you have the project files.**

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

### Environment Variables

This project uses Genkit, which typically relies on Google Cloud for authentication and API access for Google AI models like Gemini.

1.  **Create a `.env` file** in the root of your project by copying `.env.example` (if one exists) or creating it manually.
2.  **Set up Google Cloud Authentication for Genkit:**
    *   Ensure you have a Google Cloud Project with the "Vertex AI API" enabled.
    *   Authenticate the Google Cloud CLI:
        ```bash
        gcloud auth application-default login
        ```
    *   Alternatively, you can set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to a service account key JSON file if you prefer service account authentication.
    *   Genkit may also use `GCLOUD_PROJECT` if set, or attempt to infer the project. For clarity, you can add your Google Cloud Project ID to the `.env` file:
        ```
        GCLOUD_PROJECT=your-gcp-project-id
        ```
    *   For using specific models like Gemini, ensure your project has access and billing is enabled.

### Running the Development Servers

You need to run two development servers concurrently: one for the Next.js frontend and one for the Genkit flows.

1.  **Start the Next.js development server:**
    Open a terminal and run:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This will typically start the Next.js app on `http://localhost:9002`.

2.  **Start the Genkit development server:**
    Open a *separate* terminal and run:
    ```bash
    npm run genkit:dev
    # or use for hot-reloading of Genkit flows:
    # npm run genkit:watch
    ```
    This starts the Genkit development UI and flow server, usually on `http://localhost:4000` (Genkit UI) and `http://localhost:3400` (flow server). The Next.js app will communicate with the flow server.

Once both servers are running, you can access the OutreachAI application in your browser, typically at `http://localhost:9002`.

## Dataset

The application is designed to work with CSV files in a format similar to SaaSquatch enrichment exports. A sample dataset named `saasquatch_export.csv` might be used for testing.

**Key Expected Headers in the CSV:**

-   `Company`
-   `Website`
-   `Industry`
-   `Employee Count`
-   `Revenue` (e.g., "4.7M", "500k", "1000000")
-   `Owner's Title`
-   `Owner's Email`
-   `BBB Rating`
-   `City`
-   `State`

**Sample Data (`saasquatch_export.csv`):**

| Company       | Website              | Industry             | Product/Service Category                  | Business Type | Employee Count | Revenue | Year Founded | BBB Rating | City    | Owner's First Name | Owner's Email   |
| :------------ | :------------------- | :------------------- | :---------------------------------------- | :------------ | :------------- | :------ | :----------- | :--------- | :------ | :----------------- | :-------------- |
| Catalytic     | https://catalytic.com/ | Productivity/tech    | human resources, hr, saas                 | B2B           | 14             | 450.8k  | 2009         | A+         | IL      | Scott              | scott@page...   |
| Callpod, Inc. | https://callpod.com  | consumer electronics | internet security, chargers, mobile devices... | B2C           | 4              | 4.7M    | 2004         | A+         | IL      | Lourans            | l@callpod.com   |
| Red Fog LLC   | https://redfog.com   | computer games       | cryptocurrency, investment tools, bitcoin... | B2C           | 10             | NaN     | 2018         | NaN        | IL      | Max                | mark@redcloud.com |


## Key AI Flows (Implemented with Genkit)

-   **`generateEmailOpener`:** Generates a standard 2-sentence email opener based on company name, industry, location, and an optional user-defined sales goal.
-   **`generateDeepDiveEmailOpener`:**
    -   Uses the `scrapeWebsiteContent` tool to fetch the title and first paragraph from a company's website.
    -   Generates a hyper-personalized opener using this scraped content, along with other lead details and the sales goal.
-   **`generateEmailSubject`:** Creates a concise and relevant email subject line based on company details, the generated opener, and the sales goal.

