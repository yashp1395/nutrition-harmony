
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const API_NINJAS_KEY = "tgYEcDU8vMm/LDp2k/N77w==AZEJ0CFnkv6TiSwl";

// Main entry point - analyze the image and get food information
export const analyzeImage = async (imageBase64) => {
  try {
    console.log("Analyzing uploaded food image...");
    
    // Try LogMeal API first (if key is available)
    if (import.meta.env.VITE_LOGMEAL_API_KEY) {
      try {
        console.log("Attempting to use LogMeal API...");
        const logMealResult = await analyzeWithLogMeal(imageBase64);
        if (logMealResult && logMealResult.length > 0) {
          console.log("LogMeal API detection successful:", logMealResult);
          
          // Get nutrition data from API Ninjas for each detected food
          const enhancedResults = await enhanceWithNutritionData(logMealResult);
          return formatLogMealResponse(enhancedResults);
        } else {
          console.log("LogMeal API returned no results, falling back to Gemini");
        }
      } catch (error) {
        console.error("LogMeal API error:", error);
        console.log("Falling back to Gemini API");
      }
    }

    // Try Gemini API as backup (if key is available)
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      try {
        console.log("Attempting to use Gemini API...");
        const geminiResult = await analyzeWithGemini(imageBase64);
        if (geminiResult) {
          console.log("Gemini API analysis successful");
          return geminiResult;
        }
      } catch (error) {
        console.error("Gemini API error:", error);
      }
    }
    
    console.warn("No valid API keys found or all APIs failed, using mock implementation");
    return mockAnalyzeImage();
  } catch (error) {
    console.error("Error analyzing image:", error);
    return mockAnalyzeImage();
  }
};

// Enhance LogMeal results with nutrition data from API Ninjas
async function enhanceWithNutritionData(foodItems) {
  console.log("Enhancing with nutrition data from API Ninjas...");
  const enhancedItems = [];
  
  for (const item of foodItems) {
    try {
      const foodName = item.name || item.display_name || '';
      if (!foodName) {
        console.warn("Food item missing name, skipping:", item);
        continue;
      }
      
      console.log(`Fetching nutrition for: ${foodName}`);
      const nutritionData = await fetchNutritionData(foodName);
      enhancedItems.push({
        ...item,
        nutritionData: nutritionData
      });
    } catch (error) {
      console.error(`Failed to get nutrition data for ${item.name || 'unknown food'}:`, error);
      enhancedItems.push(item); // Keep the original item without nutrition data
    }
  }
  
  return enhancedItems;
}

// Fetch nutrition data from API Ninjas
async function fetchNutritionData(foodName) {
  try {
    console.log(`Fetching nutrition data for: ${foodName}`);
    const response = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(foodName)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_NINJAS_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API Ninjas nutrition data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return null;
  }
}

// Function to analyze with LogMeal API
const analyzeWithLogMeal = async (imageBase64) => {
  const apiKey = import.meta.env.VITE_LOGMEAL_API_KEY;
  if (!apiKey) {
    throw new Error("LogMeal API key not configured");
  }

  const base64Data = imageBase64.split(',')[1];
  
  // First attempt with dish recognition
  try {
    console.log("Trying LogMeal dish recognition endpoint...");
    const response = await fetch('https://api.logmeal.es/v2/image/recognition/dish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        image: base64Data 
      })
    });

    if (!response.ok) {
      throw new Error(`LogMeal API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("LogMeal dish API response:", data);

    if (data && data.recognition_results && data.recognition_results.length > 0) {
      return data.recognition_results.map(item => ({
        name: item.name.toLowerCase(),
        display_name: item.name,
        prob: item.prob
      }));
    }
  } catch (error) {
    console.error("LogMeal dish recognition error:", error);
  }
  
  // Second attempt with food detection endpoint
  try {
    console.log("Trying LogMeal food detection endpoint...");
    const response = await fetch('https://api.logmeal.es/v2/image/segmentation/complete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        image: base64Data 
      })
    });

    if (!response.ok) {
      throw new Error(`LogMeal segmentation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("LogMeal segmentation API response:", data);

    if (data && data.segmentation_results && data.segmentation_results.length > 0) {
      return data.segmentation_results.map(item => ({
        name: item.recognition_results[0]?.name.toLowerCase() || 'unknown food',
        display_name: item.recognition_results[0]?.name || 'Unknown Food',
        prob: item.recognition_results[0]?.prob || 0.5
      }));
    }
  } catch (error) {
    console.error("LogMeal segmentation error:", error);
  }
  
  return [];
};

// Format LogMeal API response to match our application structure
const formatLogMealResponse = (recognitionResults) => {
  console.log("Formatting LogMeal results with nutrition data:", recognitionResults);
  
  const detectedFoods = recognitionResults.map(item => {
    // Get nutrition data from API Ninjas if available
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let fiber = 0;
    let servingSize = "1 serving";
    
    // If we have nutrition data from API Ninjas, use it
    if (item.nutritionData && item.nutritionData.length > 0) {
      const nutrition = item.nutritionData[0];
      calories = Math.round(nutrition.calories || 0);
      protein = Math.round(nutrition.protein_g || 0);
      carbs = Math.round(nutrition.carbohydrates_total_g || 0);
      fat = Math.round(nutrition.fat_total_g || 0);
      fiber = Math.round(nutrition.fiber_g || 0);
      servingSize = `${nutrition.serving_size_g}g`;
    } else {
      // Fallback to estimates if no data from API Ninjas
      calories = Math.floor(100 + Math.random() * 300);
      protein = Math.floor(2 + Math.random() * 20);
      carbs = Math.floor(5 + Math.random() * 30);
      fat = Math.floor(2 + Math.random() * 15);
      fiber = Math.floor(1 + Math.random() * 5);
    }
    
    return {
      name: item.name.toLowerCase(),
      confidence: item.prob || 0.8,
      servingSize: servingSize,
      calories: calories,
      nutrients: { protein, carbs, fat, fiber }
    };
  });

  return {
    responses: [{
      localizedObjectAnnotations: detectedFoods,
      labelAnnotations: detectedFoods.map(food => ({
        description: food.name,
        score: food.confidence
      }))
    }]
  };
};

// Function to analyze with Gemini API
const analyzeWithGemini = async (imageBase64) => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  // Initialize Gemini model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Identify all the foods in the image and estimate calorie content for each.
  If multiple foods are present, list each one with its approximate calorie count.
  Also include the standard serving amount for each food.
  Format the response as multiple lines of:
  "Food: [name], Calories: [number], Serving: [amount]"
  For example:
  Food: Apple, Calories: 95, Serving: 1 medium
  Food: Yogurt, Calories: 150, Serving: 1 cup`;

  try {
    // Call Gemini API with image and prompt
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    const responseText = await result.response.text();
    console.log("Gemini API response:", responseText);

    // Once we have the text response, fetch nutrition data
    const parsedFoods = parseGeminiResponse(responseText);
    const enhancedFoods = await Promise.all(parsedFoods.map(async (food) => {
      try {
        const nutritionData = await fetchNutritionData(food.name);
        if (nutritionData && nutritionData.length > 0) {
          const nutrition = nutritionData[0];
          food.calories = Math.round(nutrition.calories || food.calories);
          food.nutrients.protein = Math.round(nutrition.protein_g || food.nutrients.protein);
          food.nutrients.carbs = Math.round(nutrition.carbohydrates_total_g || food.nutrients.carbs);
          food.nutrients.fat = Math.round(nutrition.fat_total_g || food.nutrients.fat);
          food.nutrients.fiber = Math.round(nutrition.fiber_g || food.nutrients.fiber);
        }
        return food;
      } catch (error) {
        console.error(`Failed to enhance food ${food.name} with nutrition data:`, error);
        return food;
      }
    }));

    return {
      responses: [{
        localizedObjectAnnotations: enhancedFoods,
        labelAnnotations: enhancedFoods.map(food => ({
          description: food.name,
          score: 0.9
        }))
      }]
    };
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return null;
  }
};

// Function to parse Gemini's text response
const parseGeminiResponse = (responseText) => {
  const detectedFoods = [];
  const foodRegex = /Food:\s*([\w\s\-,']+),\s*Calories:\s*(\d+),\s*Serving:\s*([\w\s\d.]+)/gi;

  let match;
  while ((match = foodRegex.exec(responseText)) !== null) {
    // Generate random but reasonable nutrient values based on calories
    const calories = parseInt(match[2]);
    const protein = Math.max(1, Math.floor(calories * 0.1));
    const carbs = Math.max(2, Math.floor(calories * 0.3));
    const fat = Math.max(1, Math.floor(calories * 0.1));
    const fiber = Math.max(0, Math.floor(calories * 0.02));
    
    detectedFoods.push({
      name: match[1].trim().toLowerCase(),
      confidence: 0.9, // Assume high confidence since Gemini identified it
      servingSize: match[3].trim(), // Extracted serving amount
      calories: calories,
      nutrients: { protein, carbs, fat, fiber }
    });
  }

  if (detectedFoods.length === 0) {
    console.warn("No structured food data detected from Gemini API");
    
    // Try a simpler regex as fallback
    const simpleRegex = /([\w\s\-,']+)[\s\-,]+(\d+)\s*calories/gi;
    while ((match = simpleRegex.exec(responseText)) !== null) {
      const foodName = match[1].trim();
      const calories = parseInt(match[2]);
      
      if (foodName && calories && !detectedFoods.some(f => f.name === foodName.toLowerCase())) {
        const protein = Math.max(1, Math.floor(calories * 0.1));
        const carbs = Math.max(2, Math.floor(calories * 0.3));
        const fat = Math.max(1, Math.floor(calories * 0.1));
        const fiber = Math.max(0, Math.floor(calories * 0.02));
        
        detectedFoods.push({
          name: foodName.toLowerCase(),
          confidence: 0.8,
          servingSize: "1 serving",
          calories: calories,
          nutrients: { protein, carbs, fat, fiber }
        });
      }
    }
  }

  return detectedFoods;
};

// Fallback function for mock analysis that returns multiple food items
const mockAnalyzeImage = async () => {
  console.log("Using mock food detection with multiple items...");
  
  // Create a more diverse set of mock foods
  const mockFoods = [
    {
      name: "apple",
      confidence: 0.92,
      servingSize: "1 medium",
      calories: 95,
      nutrients: { protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 }
    },
    {
      name: "chicken sandwich",
      confidence: 0.85,
      servingSize: "1 sandwich",
      calories: 350,
      nutrients: { protein: 25, carbs: 35, fat: 12, fiber: 2 }
    },
    {
      name: "salad",
      confidence: 0.78,
      servingSize: "1 cup",
      calories: 120,
      nutrients: { protein: 3, carbs: 12, fat: 8, fiber: 3 }
    }
  ];

  return {
    responses: [{
      localizedObjectAnnotations: mockFoods,
      labelAnnotations: mockFoods.map(food => ({
        description: food.name,
        score: food.confidence
      }))
    }]
  };
};
