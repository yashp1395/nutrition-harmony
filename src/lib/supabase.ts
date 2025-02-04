import { createClient } from '@supabase/supabase-js';
import type { UserMeal } from '../types/database.types';

// Ensure environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getFoodItems = async (query: string = '') => {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');
    
  if (error) throw error;
  return data;
};

export const getIndianFoodItems = async (query: string = '') => {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('is_indian_cuisine', true)
    .ilike('name', `%${query}%`)
    .order('name');
    
  if (error) throw error;
  return data;
};

export const addUserMeal = async (meal: Omit<UserMeal, 'id'>) => {
  const { data, error } = await supabase
    .from('user_meals')
    .insert(meal)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};