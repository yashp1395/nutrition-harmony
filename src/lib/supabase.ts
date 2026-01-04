// Re-export the supabase client from integrations
import { supabase } from '@/integrations/supabase/client';
import type { UserMeal, FoodItem } from '../types/database.types';

export { supabase };

// Note: food_items table may not exist in your database yet
// These functions will return empty arrays if the table doesn't exist
export const getFoodItems = async (query: string = ''): Promise<FoodItem[]> => {
  try {
    const { data, error } = await supabase
      .from('food_items' as any)
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');
      
    if (error) {
      console.warn('food_items table may not exist:', error.message);
      return [];
    }
    return (data as unknown as FoodItem[]) || [];
  } catch (error) {
    console.warn('Error fetching food items:', error);
    return [];
  }
};

export const getIndianFoodItems = async (query: string = ''): Promise<FoodItem[]> => {
  try {
    const { data, error } = await supabase
      .from('food_items' as any)
      .select('*')
      .eq('is_indian_cuisine', true)
      .ilike('name', `%${query}%`)
      .order('name');
      
    if (error) {
      console.warn('food_items table may not exist:', error.message);
      return [];
    }
    return (data as unknown as FoodItem[]) || [];
  } catch (error) {
    console.warn('Error fetching Indian food items:', error);
    return [];
  }
};

export const addUserMeal = async (meal: Omit<UserMeal, 'id'>) => {
  const { data, error } = await supabase
    .from('user_meals')
    .insert(meal as any)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
