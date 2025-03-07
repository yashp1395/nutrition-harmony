import { useState } from "react";
import { analyzeImage } from "../utils/visionApi";
import { getFoodItems } from "../lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { searchFoodWithGemini } from "../utils/gemini/foodSearch";
import type { FoodItem, DetectedFood } from "../types/database.types";

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

  const correctCaloriesWithGemini = async (foodName: string, currentCalories: number): Promise<number> => {
    try {
      console.log(`Getting corrected calories for ${foodName} from Gemini...`);
      const results = await searchFoodWithGemini(foodName);
      
      if (results && results.length > 0) {
        const geminiCalories = results[0].calories;
        console.log(`Gemini calories for ${foodName}: ${geminiCalories}, API Ninjas calories: ${currentCalories}`);
        return geminiCalories || currentCalories;
      }
      
      return currentCalories;
    } catch (error) {
      console.error(`Failed to get corrected calories from Gemini for ${foodName}:`, error);
      return currentCalories;
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

      console.log("Starting image analysis with API Ninjas and Gemini correction...");
      
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

      // Match with database or use API nutrition data with Gemini calorie correction
      const foodPromises = Object.values(detectedItems).map(async (item: any) => {
        // Try to match with our database first
        const dbNutrition = await matchFoodWithDatabase(item.name);
        
        let nutritionData;
        
        // If found in database, use that data
        if (dbNutrition) {
          // Correct calories with Gemini
          const correctedCalories = await correctCaloriesWithGemini(item.name, dbNutrition.calories);
          
          nutritionData = {
            ...dbNutrition,
            calories: correctedCalories
          };
        } else {
          // Otherwise use the enhanced nutrition data with Gemini calorie correction
          const apiCalories = item.calories || 100;
          const correctedCalories = await correctCaloriesWithGemini(item.name, apiCalories);
          
          nutritionData = createEstimatedNutrition(
            item.name, 
            correctedCalories, 
            item.nutrients
          );
        }
        
        return {
          name: item.name,
          confidence: item.confidence,
          servingSize: item.servingSize,
          nutrition: nutritionData
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
    try {
      // First try to find in database
      const dbNutrition = await matchFoodWithDatabase(foodName);
      
      if (dbNutrition) {
        // Use database nutrition data with Gemini calorie correction
        const correctedCalories = await correctCaloriesWithGemini(foodName, dbNutrition.calories);
        
        setDetectedFoods([...detectedFoods, {
          name: foodName,
          confidence: 1,
          nutrition: {
            ...dbNutrition,
            calories: correctedCalories
          },
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
          
          setDetectedFoods([...detectedFoods, {
            name: geminiNutrition.name,
            confidence: 1,
            nutrition: {
              id: `gemini-${geminiNutrition.name}`,
              name: geminiNutrition.name,
              category: 'detected',
              calories: geminiNutrition.calories,
              protein: geminiNutrition.protein,
              carbs: geminiNutrition.carbs,
              fat: geminiNutrition.fat,
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
            description: "This food item was not found in our database or Gemini API",
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
