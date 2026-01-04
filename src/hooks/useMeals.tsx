import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MealEntry, NutritionGoal } from "../types/user.types";
import { useNavigate } from "react-router-dom";

interface UserMealRow {
  id: string;
  user_id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_time: string;
  created_at: string;
  updated_at: string;
}

const mapDbMealToMealEntry = (dbMeal: UserMealRow): MealEntry => ({
  id: dbMeal.id,
  user_id: dbMeal.user_id,
  name: dbMeal.meal_name,
  time: new Date(dbMeal.meal_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  date: new Date(dbMeal.meal_time).toISOString().split('T')[0],
  calories: Number(dbMeal.calories),
  protein: Number(dbMeal.protein),
  carbs: Number(dbMeal.carbs),
  fat: Number(dbMeal.fat),
});

export const useMeals = (updateGoals?: (goals: NutritionGoal[]) => void, goals?: NutritionGoal[]) => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [allMeals, setAllMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodaysMeals();
    fetchAllMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodaysMeals = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('user_meals')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('meal_time', startOfDay.toISOString())
        .lte('meal_time', endOfDay.toISOString())
        .order('meal_time', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const mappedMeals = data.map(mapDbMealToMealEntry);
        setMeals(mappedMeals);
        updateNutritionTotals(mappedMeals);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load today\'s meals');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMeals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase
        .from('user_meals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('meal_time', { ascending: false })
        .limit(50);
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setAllMeals(data.map(mapDbMealToMealEntry));
      }
    } catch (error) {
      console.error('Error fetching all meals:', error);
    }
  };

  const updateNutritionTotals = (mealData: MealEntry[]) => {
    if (!goals || !updateGoals) return;
    
    const totalCalories = mealData.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = mealData.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = mealData.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFat = mealData.reduce((sum, meal) => sum + (meal.fat || 0), 0);
    
    const updatedGoals = goals.map(goal => {
      switch (goal.name) {
        case 'Calories':
          return { ...goal, current: totalCalories };
        case 'Protein':
          return { ...goal, current: totalProtein };
        case 'Carbs':
          return { ...goal, current: totalCarbs };
        case 'Fat':
          return { ...goal, current: totalFat };
        default:
          return goal;
      }
    });
    
    updateGoals(updatedGoals);
  };

  const saveMeal = async (meal: Omit<MealEntry, 'id' | 'user_id' | 'date'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to save meals');
        navigate('/auth');
        return null;
      }
      
      const newMeal = {
        user_id: session.user.id,
        meal_name: meal.name,
        calories: meal.calories,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        meal_time: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('user_meals')
        .insert(newMeal)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success('Meal saved successfully');
      
      const mappedMeal = mapDbMealToMealEntry(data);
      setMeals(prev => [...prev, mappedMeal]);
      setAllMeals(prev => [mappedMeal, ...prev]);
      updateNutritionTotals([...meals, mappedMeal]);
      
      return mappedMeal;
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
      return null;
    }
  };

  const deleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('user_meals')
        .delete()
        .eq('id', mealId);
        
      if (error) {
        throw error;
      }
      
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      setAllMeals(prev => prev.filter(meal => meal.id !== mealId));
      updateNutritionTotals(updatedMeals);
      
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const updateMeal = async (mealId: string, updates: Partial<MealEntry>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.meal_name = updates.name;
      if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
      if (updates.protein !== undefined) dbUpdates.protein = updates.protein;
      if (updates.carbs !== undefined) dbUpdates.carbs = updates.carbs;
      if (updates.fat !== undefined) dbUpdates.fat = updates.fat;

      const { data, error } = await supabase
        .from('user_meals')
        .update(dbUpdates)
        .eq('id', mealId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      const mappedMeal = mapDbMealToMealEntry(data);
      const updatedMeals = meals.map(meal => 
        meal.id === mealId ? mappedMeal : meal
      );
      
      setMeals(updatedMeals);
      setAllMeals(prev => prev.map(meal => meal.id === mealId ? mappedMeal : meal));
      updateNutritionTotals(updatedMeals);
      
      toast.success('Meal updated successfully');
    } catch (error) {
      console.error('Error updating meal:', error);
      toast.error('Failed to update meal');
    }
  };

  const goToUploadPage = () => {
    navigate('/upload');
  };

  return {
    meals,
    allMeals,
    loading,
    saveMeal,
    deleteMeal,
    updateMeal,
    fetchTodaysMeals,
    fetchAllMeals,
    goToUploadPage
  };
};
