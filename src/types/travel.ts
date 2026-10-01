export interface TravelFormData {
  travel_name: string;
  email: string;
  phone_number: string;
  number_of_travelers: number;
  From_Location: string;
  To_Location: string;
  Travel_date: string;
  return_date: string;
  budget: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedRoute?: {
    From_Location?: string;
    To_Location?: string;
    budget?: number;
    days?: number;
  };
  isError?: boolean;
  hint?: string;
}

export interface ChatConfig {
  webhookUrl: string;
  isTestMode: boolean;
  sessionId: string;
}

export interface SubmissionResponse {
  ok: boolean;
  status: number;
  targetUrl: string;
  bookingReference?: string;
  submittedAt?: string;
  data?: any;
  error?: string;
  details?: TravelFormData;
}

export interface CuratedDestination {
  id: string;
  title: string;
  destination: string;
  origin: string;
  tagline: string;
  durationDays: number;
  recommendedBudget: number;
  imageUrl: string;
  highlightTransport: string;
  bestSeason: string;
}
