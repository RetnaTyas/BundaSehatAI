
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

export interface NotificationConfig {
  enabled: boolean;
  waterReminder: boolean;
  waterInterval: number; // in minutes (e.g., every 60 mins)
  mealReminder: boolean;
  mealTimes: {
    breakfast: string; // "07:00"
    lunch: string; // "12:00"
    dinner: string; // "19:00"
  };
  supplementReminder: boolean;
  supplementTime: string; // "08:00"
}

export interface UserProfile {
  name: string;
  pregnancyStartDate: string; // YYYY-MM-DD (HPHT - Hari Pertama Haid Terakhir)
  notifications: NotificationConfig;
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

export interface MenuRecommendationItem {
  name: string;
  description: string;
  estimatedCalories: number;
  estimatedProtein: number;
}

export interface DailyMenuPlan {
  breakfast: MenuRecommendationItem;
  lunch: MenuRecommendationItem;
  dinner: MenuRecommendationItem;
  snack: MenuRecommendationItem;
  nutritionalReasoning: string; // Why this menu was chosen based on user stats
  cookingTip: string; // Safety or cooking tip for pregnancy
}

export type ViewState = 'dashboard' | 'meals' | 'chat' | 'history';
