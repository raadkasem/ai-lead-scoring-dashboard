export interface Lead {
  id: number;
  name: string;
  lastName: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  priceEstimation: number;
  status: string;
  transcript: string;
  callSuccessful: boolean;
  photoUrl?: string;
}

export interface ExtractedInsights {
  asking_price: number | null;
  willingness_to_negotiate: 'high' | 'medium' | 'low' | 'unclear';
  handover_date: 'immediate' | '1-2 weeks' | '2-4 weeks' | 'flexible' | 'unclear';
  car_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'unclear';
  num_owners: number | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  call_outcome: 'qualified' | 'callback_requested' | 'not_interested' | 'voicemail' | 'failed';
  key_notes: string;
}

export interface ScoredLead extends Lead {
  insights: ExtractedInsights;
  score: number;
  isHot: boolean;
}
