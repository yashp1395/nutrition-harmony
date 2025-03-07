
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  is_premium?: boolean;
}

export interface NutritionGoal {
  id?: string;
  user_id?: string;
  name: string;
  current: number;
  target: number;
  unit: string;
}

export interface MealEntry {
  id: string;
  user_id?: string;
  name: string;
  time: string;
  date?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  food_items?: any[];
  image_url?: string;
}

export interface UserSettings {
  darkMode: boolean;
  emailNotifications: boolean;
  units: 'metric' | 'imperial';
}
