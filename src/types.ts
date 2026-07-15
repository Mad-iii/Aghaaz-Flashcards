export interface CardOption {
  id: string; // A, B, C
  text: string;
  nextCardId: string | null; // ID of the next card in the flow, or null if it terminates
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select';
  placeholder?: string;
  required?: boolean;
}

export interface Card {
  id: string;
  title: string;
  phase: string; // e.g. "Phase One: Inquiry"
  type: 'choice' | 'form' | 'end';
  description?: string; // Small print at bottom
  options?: CardOption[];
  formFields?: FormField[];
  submitButtonText?: string;
  nextCardId?: string | null; // ID of the next card, or null if it terminates
}

export interface ChoiceRecord {
  cardId: string;
  question: string;
  answer: string;
}

export interface Chain {
  id: string;
  name: string;
  cards: Card[];
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  choices: ChoiceRecord[];
  score: number; // calculated momentum score
  status: 'Finished' | 'Abandoned' | 'In Progress';
  timestamp: string; // human readable like "2m ago" or full date
  createdTime: string; // ISO string for sorting
}

export interface AgencySettings {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  salesforceActive: boolean;
  mailchimpActive: boolean;
  slackActive: boolean;
  emailAlerts: boolean;
  dailySummary: boolean;
  smsAlerts: boolean;
  assignmentAlerts: boolean;
}
