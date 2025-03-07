
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with the Gemini API key
const genAI = new GoogleGenerativeAI("AIzaSyA9gMflnfM-uteYZiFIoTYefjPYh5VDQG0");

export interface NutritionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  micronutrients?: {
    [key: string]: string;
  };
}

export const searchFoodWithGemini = async (query: string): Promise<NutritionResult[]> => {
  try {
    // Initialize Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Provide detailed nutrition information for: ${query}
    
    Return the information in this exact JSON format:
    {
      "results": [
        {
          "name": "Food name",
          "servingSize": "Standard serving size (e.g., 100g, 1 cup)",
          "calories": number,
          "protein": number in grams,
          "carbs": number in grams,
          "fat": number in grams,
          "fiber": number in grams,
          "micronutrients": {
            "vitamin A": "amount with unit",
            "vitamin C": "amount with unit",
            "calcium": "amount with unit",
            "iron": "amount with unit"
            // Include other relevant micronutrients
          }
        }
      ]
    }
    
    If the query is for a general food category, return multiple specific food items within that category.
    If the exact food cannot be found, return the closest matches.
    All numerical values should be numbers only, without units in the value.
    Make sure to include both common and cuisine-specific foods like Indian dishes.`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log("Gemini food search response:", responseText);
    
    // Extract the JSON part from the response
    try {
      // Find JSON content in the response - handling potential text before/after JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        
        if (jsonData.results && Array.isArray(jsonData.results)) {
          return jsonData.results.map((item: any) => ({
            name: item.name,
            calories: Number(item.calories),
            protein: Number(item.protein),
            carbs: Number(item.carbs),
            fat: Number(item.fat),
            fiber: Number(item.fiber) || 0,
            servingSize: item.servingSize,
            micronutrients: item.micronutrients
          }));
        }
      }
      
      throw new Error("Failed to parse nutrition data from response");
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      throw new Error("Failed to parse nutrition data");
    }
  } catch (error) {
    console.error("Error searching food with Gemini:", error);
    throw error;
  }
};
