
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
      id: `estimated-${foodName}`,
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
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 200);

      console.log("Starting image analysis...");
      
      // Analyze image using API
      const visionResult = await analyzeImage(imageDataUrl);
      
      if (!visionResult || !visionResult.responses || visionResult.responses.length === 0) {
        throw new Error("Failed to get a valid response from the image analysis API");
      }
      
      // Process detected objects and labels
      const detectedItems = new Set<string>();
      const detectedDetails: {[key: string]: any} = {};
      
      console.log("Vision API result:", visionResult);
      
      // Add objects with their details
      if (visionResult.responses[0].localizedObjectAnnotations) {
        visionResult.responses[0].localizedObjectAnnotations.forEach((obj: any) => {
          const name = obj.name.toLowerCase();
          detectedItems.add(name);
          detectedDetails[name] = {
            confidence: obj.confidence,
            servingSize: obj.servingSize,
            calories: obj.calories,
            nutrients: obj.nutrients
          };
        });
      }
      
      // Add any additional labels if they're food related (fallback detection)
      if (visionResult.responses[0].labelAnnotations) {
        visionResult.responses[0].labelAnnotations.forEach((label: any) => {
          const description = label.description.toLowerCase();
          if (!detectedItems.has(description) && 
              (description.includes('food') || 
               description.includes('dish') ||
               description.includes('meal') ||
               description.includes('fruit') ||
               description.includes('vegetable'))) {
            detectedItems.add(description);
          }
        });
      }

      console.log("Detected food items:", Array.from(detectedItems));
      console.log("Detected details:", detectedDetails);

      if (detectedItems.size === 0) {
        throw new Error("No food items detected in the image");
      }

      // Match with database and set nutrition info
      const foodPromises = Array.from(detectedItems).map(async (item) => {
        const dbNutrition = await matchFoodWithDatabase(item);
        const details = detectedDetails[item] || {};
        
        return {
          name: item,
          confidence: details.confidence || 0.8,
          servingSize: details.servingSize || 'Standard serving',
          nutrition: dbNutrition || createEstimatedNutrition(
            item, 
            details.calories, 
            details.nutrients
          ),
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
