import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with the new Gemini API key
const genAI = new GoogleGenerativeAI("AIzaSyA9gMflnfM-uteYZiFIoTYefjPYh5VDQG0");
const API_NINJAS_KEY = "tgYEcDU8vMm/LDp2k/N77w==AZEJ0CFnkv6TiSwl";

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
  const results = [];
  
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
      const dishResults = data.recognition_results.map(item => ({
        name: item.name.toLowerCase(),
        display_name: item.name,
        prob: item.prob
      }));
      results.push(...dishResults);
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
      const segmentResults = data.segmentation_results
        .filter(item => item.recognition_results && item.recognition_results.length > 0)
        .map(item => ({
          name: item.recognition_results[0]?.name.toLowerCase() || 'unknown food',
          display_name: item.recognition_results[0]?.name || 'Unknown Food',
          prob: item.recognition_results[0]?.prob || 0.5
        }));
      
      // Add any new foods not already in results
      for (const food of segmentResults) {
        if (!results.some(r => r.name === food.name)) {
          results.push(food);
        }
      }
    }
  } catch (error) {
    console.error("LogMeal segmentation error:", error);
  }
  
  if (results.length === 0) {
    throw new Error("LogMeal API couldn't detect any food in the image");
  }
  
  return results;
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

// Function to analyze with Gemini API - prioritizing this method now
const analyzeWithGemini = async (imageBase64) => {
  // Initialize Gemini model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Identify all the foods visible in this image. Be very detailed and comprehensive in your analysis.
  Each food should be identified separately, even if they're part of the same dish.
  For each food item detected, provide:
  1. The exact name of the food
  2. An estimate of calories per serving
  3. The standard serving size

  Format your response exactly like this:
  Food: [food name], Calories: [number], Serving: [serving size]
  
  For example:
  Food: Apple, Calories: 95, Serving: 1 medium (182g)
  Food: White Rice, Calories: 205, Serving: 1 cup cooked (158g)
  Food: Grilled Chicken Breast, Calories: 165, Serving: 3 oz (85g)
  
  Be precise and detailed about each food item. If there are multiple food items, list each one separately.`;

  try {
    // Call Gemini API with image and prompt
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    const responseText = await result.response.text();
    console.log("Gemini API response:", responseText);

    // Parse the text response, fetch nutrition data
    const parsedFoods = parseGeminiResponse(responseText);
    
    if (parsedFoods.length === 0) {
      throw new Error("Gemini API couldn't identify any food in the image");
    }
    
    const enhancedFoods = await Promise.all(parsedFoods.map(async (food) => {
      try {
        const nutritionData = await fetchNutritionData(food.name);
        if (nutritionData && nutritionData.length > 0) {
          const nutrition = nutritionData[0];
          food.calories = Math.round(nutrition.calories || food.calories);
          food.nutrients.protein = Math.round(nutrition.protein_g || 0);
          food.nutrients.carbs = Math.round(nutrition.carbohydrates_total_g || 0);
          food.nutrients.fat = Math.round(nutrition.fat_total_g || 0);
          food.nutrients.fiber = Math.round(nutrition.fiber_g || 0);
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
    throw new Error("Gemini API failed: " + error.message);
  }
};

// Function to parse Gemini's text response - improved for better extraction
const parseGeminiResponse = (responseText) => {
  const detectedFoods = [];
  // Improved regex to better match Gemini's output format
  const foodRegex = /Food:\s*([\w\s\-,']+),\s*Calories:\s*(\d+),\s*Serving:\s*([\w\s\d.()]+)/gi;

  let match;
  while ((match = foodRegex.exec(responseText)) !== null) {
    detectedFoods.push({
      name: match[1].trim().toLowerCase(),
      confidence: 0.9,
      servingSize: match[3].trim(),
      calories: parseInt(match[2]),
      nutrients: { 
        protein: 0, 
        carbs: 0, 
        fat: 0, 
        fiber: 0 
      }
    });
  }

  if (detectedFoods.length === 0) {
    console.warn("No structured food data detected from Gemini API, trying fallback parsing");
    
    // Try a simpler regex as fallback
    const simpleRegex = /([\w\s\-,']+)[\s\-:]+(\d+)\s*calories/gi;
    while ((match = simpleRegex.exec(responseText)) !== null) {
      const foodName = match[1].trim();
      const calories = parseInt(match[2]);
      
      if (foodName && calories && !detectedFoods.some(f => f.name === foodName.toLowerCase())) {
        detectedFoods.push({
          name: foodName.toLowerCase(),
          confidence: 0.8,
          servingSize: "1 serving",
          calories: calories,
          nutrients: { 
            protein: 0, 
            carbs: 0, 
            fat: 0, 
            fiber: 0 
          }
        });
      }
    }
    
    // If still no foods detected, try extracting just the food names
    if (detectedFoods.length === 0) {
      const foodNameRegex = /\b(apple|banana|orange|chicken|beef|pork|fish|rice|potato|bread|pasta|pizza|burger|salad|sandwich|soup|steak|fries|vegetables|fruits|cake|cookie|ice cream|chocolate|coffee|tea|water|juice|soda|milk|cheese|yogurt|egg|bacon|sausage|cereal|pancake|waffle|donut|muffin|bagel|toast|taco|burrito|quesadilla|enchilada|noodles|curry|dal|roti|paratha|naan|dosa|idli|samosa|pakora|biryani|pulao|chips|nuts|popcorn|candy|pie|brownie|pudding)\b/gi;
      
      while ((match = foodNameRegex.exec(responseText)) !== null) {
        const foodName = match[1].trim().toLowerCase();
        if (!detectedFoods.some(f => f.name === foodName)) {
          detectedFoods.push({
            name: foodName,
            confidence: 0.7,
            servingSize: "1 serving",
            calories: 100, // Default calories
            nutrients: { 
              protein: 0, 
              carbs: 0, 
              fat: 0, 
              fiber: 0 
            }
          });
        }
      }
    }
  }

  return detectedFoods;
};
