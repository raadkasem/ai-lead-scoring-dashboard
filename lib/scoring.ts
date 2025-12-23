import { ExtractedInsights, Lead } from './types';

interface ScoreBreakdown {
  urgency: number;
  negotiation: number;
  condition: number;
  owners: number;
  sentiment: number;
  priceGap: number;
  total: number;
}

// Scoring weights based on deal attractiveness
const WEIGHTS = {
  urgency: 25,      // Quick handover = higher priority
  negotiation: 20,  // Willingness to negotiate = easier deal
  condition: 20,    // Better condition = more valuable
  owners: 10,       // Fewer owners = cleaner history
  sentiment: 10,    // Positive sentiment = easier conversation
  priceGap: 15,     // Realistic price = more likely to close
};

export function calculateScore(
  insights: ExtractedInsights,
  priceEstimation: number
): ScoreBreakdown {
  // Urgency score (25 max)
  const urgencyMap: Record<string, number> = {
    'immediate': 25,
    '1-2 weeks': 20,
    'flexible': 15,
    '2-4 weeks': 10,
    'unclear': 5,
  };
  const urgency = urgencyMap[insights.handover_date] || 5;

  // Negotiation willingness score (20 max)
  const negotiationMap: Record<string, number> = {
    'high': 20,
    'medium': 15,
    'unclear': 10,
    'low': 5,
  };
  const negotiation = negotiationMap[insights.willingness_to_negotiate] || 10;

  // Car condition score (20 max)
  const conditionMap: Record<string, number> = {
    'excellent': 20,
    'good': 15,
    'fair': 10,
    'unclear': 8,
    'poor': 5,
  };
  const condition = conditionMap[insights.car_condition] || 8;

  // Number of owners score (10 max)
  let owners = 3; // default for unclear
  if (insights.num_owners !== null) {
    if (insights.num_owners === 1) owners = 10;
    else if (insights.num_owners === 2) owners = 7;
    else owners = 5;
  }

  // Sentiment score (10 max)
  const sentimentMap: Record<string, number> = {
    'positive': 10,
    'neutral': 5,
    'negative': 0,
  };
  const sentiment = sentimentMap[insights.sentiment] || 5;

  // Price gap score (15 max)
  let priceGap = 5; // default for unclear
  if (insights.asking_price !== null && priceEstimation > 0) {
    const ratio = insights.asking_price / priceEstimation;
    if (ratio <= 1) {
      priceGap = 15; // Asking at or below estimation
    } else if (ratio <= 1.1) {
      priceGap = 10; // Within 10% above estimation
    } else {
      priceGap = 5; // More than 10% above
    }
  }

  const total = urgency + negotiation + condition + owners + sentiment + priceGap;

  return {
    urgency,
    negotiation,
    condition,
    owners,
    sentiment,
    priceGap,
    total,
  };
}

export function isHotLead(score: number): boolean {
  return score >= 70;
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Hot';
  if (score >= 40) return 'Warm';
  return 'Cold';
}
