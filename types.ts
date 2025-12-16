export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  isHealthy: boolean;
  notes?: string;
  timestamp: number;
}

export interface DailyLog {
  date: string; // ISO Date string YYYY-MM-DD
  waterIntake: number; // in glasses (250ml)
  supplements: {
    folicAcid: boolean;
    iron: boolean;
    calcium: boolean;
    vitaminD: boolean;
  };
  meals: Meal[];
}

export interface UserProfile {
  name: string;
  pregnancyStartDate: string; // YYYY-MM-DD (HPHT - Hari Pertama Haid Terakhir)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MealAnalysisResult {
  calories: number;
  protein: number;
  isPregnancySafe: boolean;
  nutritionalNotes: string;
}

export interface SupplementAnalysisResult {
  detected: Partial<DailyLog['supplements']>;
  feedback: string;
}

export type ViewState = 'dashboard' | 'meals' | 'chat' | 'history';