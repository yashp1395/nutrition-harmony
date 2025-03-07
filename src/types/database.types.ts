
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image_url?: string;
  description?: string;
  is_indian_cuisine: boolean;
}

export interface UserMeal {
  id: string;
  user_id: string;
  food_id: string;
  date: string;
  portion_size: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// Type for adding a food item to a meal
export interface AddToMealRequest {
  foodItem: FoodItem;
  mealType: string;
  date?: string;
  quantity?: number;
}
