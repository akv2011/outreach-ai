
export interface ScoreBreakdown {
  revenuePoints: number;
  employeePoints: number;
  titlePoints: number;
  bbbPoints: number;
  explanations: string[];
}

export interface PriorityScoreInfo {
  total: number;
  breakdown: ScoreBreakdown;
}

export interface Lead {
  id: string;
  companyName: string;
  website?: string;
  industry: string;
  location: string;
  revenue?: number; // in millions
  employeeCount?: number;
  title?: string;
  ownerEmail?: string; // Added for prefilling 'To' field
  bbbRating?: string;
  priorityScoreInfo: PriorityScoreInfo;
  aiOpener?: string;
  aiSubject?: string; // Added for AI-generated subject
  isGeneratingOpener?: boolean;
  isGeneratingSubject?: boolean; // Added for subject generation loading state
}

// Expected headers in the CSV file that we will map
export const CSV_HEADERS = [
  'Company', // Maps to companyName
  'Website', // Maps to website
  'Industry',
  'Revenue', // Maps to revenue (e.g., "4.7M", "500k", "10" implying 10M)
  'Employee Count', // Maps to employeeCount
  "Owner's Title", // Maps to title
  "Owner's Email", // Added for prefilling 'To' field
  'BBB Rating',
  'City', 
  'State', 
] as const;

export type CSVHeader = (typeof CSV_HEADERS)[number];

// This type represents a row from the CSV with actual header names as keys
export type RawLeadData = {
  [key in CSVHeader]?: string; // Known headers
} & {
  [key: string]: string | undefined; // Allow other columns from CSV
};
