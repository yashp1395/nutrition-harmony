import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getFoodItems } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { searchFoodWithGemini } from "../utils/gemini/foodSearch";
import type { FoodItem, DetectedFood } from "../types/database.types";

const ANALYZE_FOOD_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-food`;

export const useFoodAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const { toast } = useToast();

  const matchFoodWithDatabase = async (foodName: string) => {
    try {
      const items = await getFoodItems(foodName);
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('Error matching food:', error);
      return null;
    }
  };

  const analyzeFood = async (imageDataUrl: string) => {
    setAnalyzing(true);
    setProgress(0);
    setDetectedFoods([]);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 200);

      console.log("Starting image analysis with Lovable AI...");
      
      // Call the edge function
      const response = await fetch(ANALYZE_FOOD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ imageBase64: imageDataUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add credits to continue using AI analysis.");
        }
        
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.foods || result.foods.length === 0) {
        throw new Error("No food items detected in the image. Please try with a clearer image.");
      }

      console.log("AI detected foods:", result.foods);

      // Process detected items
      const foods: DetectedFood[] = result.foods.map((item: any) => ({
        name: item.name,
        confidence: item.confidence || 0.9,
        servingSize: item.servingSize || 'Standard serving',
        nutrition: {
          id: `ai-${item.name}-${Date.now()}`,
          name: item.name,
          category: 'detected',
          calories: item.calories || 100,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0,
          is_indian_cuisine: false,
        }
      }));

      setDetectedFoods(foods);
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Detected ${foods.length} food item${foods.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image. Please try again.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const addManualFood = async (foodName: string) => {
    try {
      // First try to find in database
      const dbNutrition = await matchFoodWithDatabase(foodName);
      
      if (dbNutrition) {
        setDetectedFoods([...detectedFoods, {
          name: foodName,
          confidence: 1,
          nutrition: dbNutrition,
          isManualEntry: true
        }]);
        
        toast({
          title: "Food Added",
          description: `${foodName} has been added to the list`,
        });
        return true;
      } else {
        // If not in database, search with Gemini
        const geminiResults = await searchFoodWithGemini(foodName);
        
        if (geminiResults && geminiResults.length > 0) {
          const geminiNutrition = geminiResults[0];
          const calories = geminiNutrition.calories || 100;
          
          setDetectedFoods([...detectedFoods, {
            name: geminiNutrition.name,
            confidence: 1,
            nutrition: {
              id: `gemini-${geminiNutrition.name}`,
              name: geminiNutrition.name,
              category: 'detected',
              calories: calories,
              protein: geminiNutrition.protein || 0,
              carbs: geminiNutrition.carbs || 0,
              fat: geminiNutrition.fat || 0,
              fiber: geminiNutrition.fiber || 1,
              is_indian_cuisine: false,
              servingSize: geminiNutrition.servingSize
            },
            servingSize: geminiNutrition.servingSize,
            isManualEntry: true
          }]);
          
          toast({
            title: "Food Added",
            description: `${geminiNutrition.name} has been added to the list`,
          });
          return true;
        } else {
          toast({
            variant: "destructive",
            title: "Food Not Found",
            description: "This food item was not found. Please try a different name.",
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Error adding manual food:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add food. Please try again.",
      });
      return false;
    }
  };

  const removeFood = (index: number) => {
    setDetectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  return {
    analyzing,
    progress,
    detectedFoods,
    analyzeFood,
    addManualFood,
    removeFood
  };
};
