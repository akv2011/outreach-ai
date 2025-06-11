
import type { Lead, PriorityScoreInfo, ScoreBreakdown } from '@/types';

export function calculatePriorityScore(lead: Partial<Lead>): PriorityScoreInfo {
  let totalScore = 0;
  const breakdown: ScoreBreakdown = {
    revenuePoints: 0,
    employeePoints: 0,
    titlePoints: 0,
    bbbPoints: 0,
    explanations: [],
  };

  // Revenue Score (0-30 points)
  if (lead.revenue !== undefined) {
    if (lead.revenue > 50) {
      breakdown.revenuePoints = 30;
      breakdown.explanations.push(`+30: High Revenue ($${lead.revenue.toLocaleString()}M)`);
    } else if (lead.revenue >= 10) {
      breakdown.revenuePoints = 20;
      breakdown.explanations.push(`+20: Significant Revenue ($${lead.revenue.toLocaleString()}M)`);
    } else if (lead.revenue >= 1) {
      breakdown.revenuePoints = 10;
      breakdown.explanations.push(`+10: Notable Revenue ($${lead.revenue.toLocaleString()}M)`);
    }
    totalScore += breakdown.revenuePoints;
  }

  // Employee Count Score (0-30 points)
  if (lead.employeeCount !== undefined) {
    if (lead.employeeCount > 500) {
      breakdown.employeePoints = 30;
      breakdown.explanations.push(`+30: Large Employee Count (${lead.employeeCount.toLocaleString()})`);
    } else if (lead.employeeCount >= 100) {
      breakdown.employeePoints = 20;
      breakdown.explanations.push(`+20: Medium Employee Count (${lead.employeeCount.toLocaleString()})`);
    } else if (lead.employeeCount >= 10) {
      breakdown.employeePoints = 10;
      breakdown.explanations.push(`+10: Small Employee Count (${lead.employeeCount.toLocaleString()})`);
    }
    totalScore += breakdown.employeePoints;
  }

  // Title Score (0-20 points)
  if (lead.title) {
    const lowerTitle = lead.title.toLowerCase();
    if (/\b(ceo|cfo|cto|cmo|coo|founder|president)\b/.test(lowerTitle)) {
      breakdown.titlePoints = 20;
      breakdown.explanations.push(`+20: Key Title (${lead.title})`);
    } else if (/\b(vp|vice president)\b/.test(lowerTitle)) {
      breakdown.titlePoints = 15;
      breakdown.explanations.push(`+15: VP Level Title (${lead.title})`);
    } else if (/\b(director)\b/.test(lowerTitle)) {
      breakdown.titlePoints = 10;
      breakdown.explanations.push(`+10: Director Level Title (${lead.title})`);
    } else if (/\b(manager)\b/.test(lowerTitle)) {
      breakdown.titlePoints = 5;
      breakdown.explanations.push(`+5: Manager Level Title (${lead.title})`);
    }
    totalScore += breakdown.titlePoints;
  }

  // BBB Rating Score (0-20 points)
  if (lead.bbbRating && lead.bbbRating !== 'N/A' && lead.bbbRating.trim() !== '') {
    const rating = lead.bbbRating.toUpperCase();
    if (rating === 'A+') {
      breakdown.bbbPoints = 20;
      breakdown.explanations.push(`+20: Excellent BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'A') {
      breakdown.bbbPoints = 18;
      breakdown.explanations.push(`+18: Strong BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'A-') {
      breakdown.bbbPoints = 16;
      breakdown.explanations.push(`+16: Good BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'B+') {
      breakdown.bbbPoints = 14;
      breakdown.explanations.push(`+14: BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'B') {
      breakdown.bbbPoints = 12;
      breakdown.explanations.push(`+12: BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'B-') {
      breakdown.bbbPoints = 10;
      breakdown.explanations.push(`+10: BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'C+') {
      breakdown.bbbPoints = 8;
      breakdown.explanations.push(`+8: Fair BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'C') {
      breakdown.bbbPoints = 6;
      breakdown.explanations.push(`+6: Fair BBB Rating (${lead.bbbRating})`);
    } else if (rating === 'C-') {
      breakdown.bbbPoints = 4;
      breakdown.explanations.push(`+4: Fair BBB Rating (${lead.bbbRating})`);
    }
    totalScore += breakdown.bbbPoints;
  }
  
  if (breakdown.explanations.length === 0) {
    breakdown.explanations.push("No specific scoring factors met.");
  }

  return {
    total: Math.min(totalScore, 100), // Cap score at 100
    breakdown,
  };
}
