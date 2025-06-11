
import type { Lead, RawLeadData } from '@/types';

// Helper function to split a CSV line, respecting quotes and escaped quotes
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Check for escaped quote ("")
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        currentField += '"';
        i++; // Skip the second quote of the pair
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim()); // Add the last field
  return result;
}

export function parseCSV(csvString: string): Partial<RawLeadData>[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row.');
  }

  const headerLine = lines[0].trim();
  const headers = splitCSVLine(headerLine).map(h => h.replace(/^"|"$/g, '').trim());
  
  const dataRows = lines.slice(1);
  const parsedData: Partial<RawLeadData>[] = [];

  dataRows.forEach((line) => {
    if (line.trim() === '') return;

    const values = splitCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim());
    
    const rowData: Partial<RawLeadData> = {};
    headers.forEach((header, index) => {
      if (header && values[index] !== undefined) { 
        (rowData as any)[header] = values[index] === '' ? undefined : values[index];
      }
    });
    parsedData.push(rowData);
  });

  return parsedData;
}

export function transformRawDataToLead(rawData: Partial<RawLeadData>, id: string): Partial<Lead> {
  const revenueString = rawData['Revenue'];
  const employeeString = rawData['Employee Count'];

  let revenueInMillions: number | undefined = undefined;
  if (revenueString) {
    const lcRevenueString = revenueString.toLowerCase();
    const numericMatch = lcRevenueString.replace(/,/g, '').match(/[0-9.]+/);
    if (numericMatch) {
      const value = parseFloat(numericMatch[0]);
      if (!isNaN(value)) {
        if (lcRevenueString.includes('m')) {
          revenueInMillions = value;
        } else if (lcRevenueString.includes('k')) {
          revenueInMillions = value / 1000;
        } else {
          revenueInMillions = value; 
        }
      }
    }
  }
  
  let employeeCount: number | undefined = undefined;
  if (employeeString) {
    const cleanedEmployeeString = employeeString.replace(/,/g, '');
    const parsedEmployees = parseInt(cleanedEmployeeString.replace(/[^0-9]/g, ''));
    if (!isNaN(parsedEmployees)) {
      employeeCount = parsedEmployees;
    }
  }

  let derivedLocation: string | undefined = rawData['Location'] ? rawData['Location'].trim() : undefined;
  if (!derivedLocation || derivedLocation === '') {
    const city = rawData['City'] ? rawData['City'].trim() : undefined;
    const state = rawData['State'] ? rawData['State'].trim() : undefined;
    
    const locationParts = [city, state].filter(part => part && part.trim() !== '');
    if (locationParts.length > 0) {
      derivedLocation = locationParts.join(', ');
    }
  }

  return {
    id,
    companyName: rawData['Company'] || undefined,
    website: rawData['Website'] || undefined,
    industry: rawData['Industry'] || undefined,
    location: derivedLocation,
    revenue: revenueInMillions,
    employeeCount,
    title: rawData["Owner's Title"] || undefined,
    ownerEmail: rawData["Owner's Email"] || undefined,
    bbbRating: rawData['BBB Rating'] || undefined,
  };
}
