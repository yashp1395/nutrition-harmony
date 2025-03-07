
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { MealEntry, NutritionGoal } from "../types/user.types";
import { useNavigate } from "react-router-dom";

export const useMeals = (updateGoals?: (goals: NutritionGoal[]) => void, goals?: NutritionGoal[]) => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTodaysMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodaysMeals = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .order('time', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setMeals(data);
        updateNutritionTotals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load today\'s meals');
    } finally {
      setLoading(false);
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
        return null;
      }
      
      const newMeal = {
        ...meal,
        user_id: session.user.id,
        date: today
      };
      
      const { data, error } = await supabase
        .from('meals')
        .insert(newMeal)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success('Meal saved successfully');
      
      // Update meals list and nutrition totals
      setMeals(prev => [...prev, data]);
      updateNutritionTotals([...meals, data]);
      
      return data;
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
      return null;
    }
  };

  const deleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);
        
      if (error) {
        throw error;
      }
      
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      updateNutritionTotals(updatedMeals);
      
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const updateMeal = async (mealId: string, updates: Partial<MealEntry>) => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', mealId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      const updatedMeals = meals.map(meal => 
        meal.id === mealId ? { ...meal, ...data } : meal
      );
      
      setMeals(updatedMeals);
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
    loading,
    saveMeal,
    deleteMeal,
    updateMeal,
    fetchTodaysMeals,
    goToUploadPage
  };
};
