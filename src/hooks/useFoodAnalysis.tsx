import { useState } from "react";
import { analyzeImage } from "../utils/visionApi";
import { getFoodItems } from "../lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { FoodItem } from "../types/database.types";

interface DetectedFood {
  name: string;
  confidence: number;
  nutrition?: FoodItem;
  servingSize?: string;
  isManualEntry?: boolean;
}

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

  const createEstimatedNutrition = (foodName: string, calories: number, nutrients: any) => {
    return {
      id: `api-${foodName}`,
      name: foodName,
      category: 'detected',
      calories: calories || 100,
      protein: nutrients?.protein || 2,
      carbs: nutrients?.carbs || 15,
      fat: nutrients?.fat || 5,
      fiber: nutrients?.fiber || 1,
      is_indian_cuisine: false
    };
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

      console.log("Starting image analysis with LogMeal and API Ninjas...");
      
      // Analyze image using API
      const visionResult = await analyzeImage(imageDataUrl);
      
      if (!visionResult || !visionResult.responses || visionResult.responses.length === 0) {
        throw new Error("Failed to get a valid response from the image analysis API");
      }
      
      // Extract detected objects
      const detectedItems: {[key: string]: any} = {};
      
      console.log("API result:", visionResult);
      
      // Add objects with their details
      if (visionResult.responses[0].localizedObjectAnnotations) {
        visionResult.responses[0].localizedObjectAnnotations.forEach((obj: any) => {
          detectedItems[obj.name] = {
            name: obj.name,
            confidence: obj.confidence || 0.8,
            servingSize: obj.servingSize || 'Standard serving',
            calories: obj.calories,
            nutrients: obj.nutrients
          };
        });
      }

      if (Object.keys(detectedItems).length === 0) {
        throw new Error("No food items detected in the image");
      }

      console.log("Detected food items:", Object.keys(detectedItems));

      // Match with database or use API nutrition data
      const foodPromises = Object.values(detectedItems).map(async (item: any) => {
        // Try to match with our database first
        const dbNutrition = await matchFoodWithDatabase(item.name);
        
        // If found in database, use that data
        if (dbNutrition) {
          return {
            name: item.name,
            confidence: item.confidence,
            servingSize: item.servingSize,
            nutrition: dbNutrition
          };
        }
        
        // Otherwise use the nutrition data from API Ninjas
        return {
          name: item.name,
          confidence: item.confidence,
          servingSize: item.servingSize,
          nutrition: createEstimatedNutrition(
            item.name, 
            item.calories, 
            item.nutrients
          )
        };
      });

      const foods = await Promise.all(foodPromises);
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
    const nutrition = await matchFoodWithDatabase(foodName);
    if (nutrition) {
      setDetectedFoods([...detectedFoods, {
        name: foodName,
        confidence: 1,
        nutrition,
        isManualEntry: true
      }]);
      toast({
        title: "Food Added",
        description: `${foodName} has been added to the list`,
      });
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Food Not Found",
        description: "This food item was not found in our database",
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
