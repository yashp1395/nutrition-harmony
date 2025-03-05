
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

  const analyzeFood = async (imageDataUrl: string) => {
    setAnalyzing(true);
    setProgress(0);
    setDetectedFoods([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Analyze image using Vision API
      const visionResult = await analyzeImage(imageDataUrl);
      
      // Process detected objects and labels
      const detectedItems = new Set<string>();
      const detectedDetails: {[key: string]: any} = {};
      
      // Add objects with their details
      visionResult.responses[0].localizedObjectAnnotations?.forEach((obj: any) => {
        const name = obj.name.toLowerCase();
        detectedItems.add(name);
        detectedDetails[name] = {
          confidence: obj.confidence,
          servingSize: obj.servingSize,
          calories: obj.calories,
          nutrients: obj.nutrients
        };
      });
      
      // Add labels
      visionResult.responses[0].labelAnnotations?.forEach((label: any) => {
        if (label.description.toLowerCase().includes('food') || 
            label.description.toLowerCase().includes('dish') ||
            label.description.toLowerCase().includes('meal')) {
          detectedItems.add(label.description.toLowerCase());
        }
      });

      // Match with database and set nutrition info
      const foodPromises = Array.from(detectedItems).map(async (item) => {
        const nutrition = await matchFoodWithDatabase(item);
        const details = detectedDetails[item] || {};
        
        return {
          name: item,
          confidence: details.confidence || 0.8,
          servingSize: details.servingSize || 'Standard serving',
          nutrition: nutrition || {
            id: `estimated-${item}`,
            name: item,
            category: 'detected',
            calories: details.calories || 100,
            protein: details.nutrients?.protein || 2,
            carbs: details.nutrients?.carbs || 15,
            fat: details.nutrients?.fat || 5,
            fiber: details.nutrients?.fiber || 1,
            is_indian_cuisine: false
          },
        };
      });

      const foods = await Promise.all(foodPromises);
      setDetectedFoods(foods);

      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Detected ${foods.length} food items`,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze image. Please try again.",
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
