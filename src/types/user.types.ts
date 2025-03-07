
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at?: string;
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
  id?: string;
  user_id?: string;
  name: string;
  food_items: any[];
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time: string;
  date?: string;
  image_url?: string;
}
