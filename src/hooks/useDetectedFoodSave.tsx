
import { useState } from "react";
import { useMeals } from "./useMeals";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { DetectedFood } from "../types/database.types";

export const useDetectedFoodSave = () => {
  const [saving, setSaving] = useState(false);
  const { saveMeal } = useMeals();
  const navigate = useNavigate();

  const saveDetectedFoods = async (detectedFoods: DetectedFood[], mealType: string = "Snack") => {
    if (detectedFoods.length === 0) {
      toast.error("No foods detected to save");
      return false;
    }

    try {
      setSaving(true);

      // Calculate total nutrition values with improved accuracy
      const totalCalories = detectedFoods.reduce((sum, food) => 
        sum + (food.nutrition?.calories || 0), 0);
      const totalProtein = detectedFoods.reduce((sum, food) => 
        sum + (food.nutrition?.protein || 0), 0);
      const totalCarbs = detectedFoods.reduce((sum, food) => 
        sum + (food.nutrition?.carbs || 0), 0);
      const totalFat = detectedFoods.reduce((sum, food) => 
        sum + (food.nutrition?.fat || 0), 0);

      // Create meal entry
      const currentTime = new Date();
      const meal = {
        name: mealType,
        food_items: detectedFoods,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        time: currentTime.toISOString()
      };

      const savedMeal = await saveMeal(meal);
      
      if (savedMeal) {
        toast.success("Meal saved successfully!");
        return true;
      } else {
        toast.error("Failed to save meal");
        return false;
      }
    } catch (error) {
      console.error("Error saving detected foods:", error);
      toast.error("Error saving detected foods");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return {
    saving,
    saveDetectedFoods,
    goToProfile
  };
};
