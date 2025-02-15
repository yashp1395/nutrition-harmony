
import { createClient } from '@supabase/supabase-js';
import type { UserMeal } from '../types/database.types';

const supabaseUrl = 'https://njasjoepdafcpjicrfud.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qYXNqb2VwZGFmY3BqaWNyZnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NTE0MDYsImV4cCI6MjA1NDIyNzQwNn0.oBIOYkKJGozaYJEnDsfSmDA5YBqmK7Gl_fKFANetma8';

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Debug helper for auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});

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
