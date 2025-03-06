
import { analyzeWithGemini } from "./geminiApi";
import { analyzeWithLogMeal, formatLogMealResponse } from "./logMealApi";
import { enhanceWithNutritionData } from "./nutritionApi";

// Main entry point - analyze the image and get food information
export const analyzeImage = async (imageBase64) => {
  try {
    console.log("Analyzing uploaded food image...");
    
    // Try LogMeal API first if key exists
    if (import.meta.env.VITE_LOGMEAL_API_KEY) {
      try {
        console.log("Using LogMeal API for food detection...");
        const logMealResult = await analyzeWithLogMeal(imageBase64);
        if (logMealResult && logMealResult.length > 0) {
          console.log("LogMeal API detection successful:", logMealResult);
          
          // Get nutrition data from API Ninjas for each detected food
          const enhancedResults = await enhanceWithNutritionData(logMealResult);
          return formatLogMealResponse(enhancedResults);
        } else {
          console.log("LogMeal API returned no results, trying Gemini");
          throw new Error("No foods detected with LogMeal API");
        }
      } catch (error) {
        console.error("LogMeal API error:", error);
        console.log("Trying Gemini API");
        
        // Use Gemini API as backup
        try {
          console.log("Using Gemini API...");
          const geminiResult = await analyzeWithGemini(imageBase64);
          if (geminiResult) {
            console.log("Gemini API analysis successful");
            return geminiResult;
          }
        } catch (error) {
          console.error("Gemini API error:", error);
          throw new Error("Both LogMeal and Gemini APIs failed to detect foods");
        }
      }
    } else {
      // If LogMeal API key is not available, use Gemini directly
      try {
        console.log("Using Gemini API as primary detection method...");
        const geminiResult = await analyzeWithGemini(imageBase64);
        if (geminiResult) {
          console.log("Gemini API analysis successful");
          return geminiResult;
        } else {
          throw new Error("Gemini API failed to detect foods");
        }
      } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Gemini API failed to analyze the image");
      }
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};
