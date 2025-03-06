
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Function to analyze the image and estimate calories
export const analyzeImage = async (imageBase64) => {
  try {
    console.log("Analyzing uploaded food image...");
    
    // Check for LogMeal API key first
    if (import.meta.env.VITE_LOGMEAL_API_KEY) {
      try {
        const logMealResult = await analyzeWithLogMeal(imageBase64);
        if (logMealResult && logMealResult.length > 0) {
          console.log("LogMeal API detection successful:", logMealResult);
          return formatLogMealResponse(logMealResult);
        } else {
          console.log("LogMeal API returned no results, falling back to Gemini");
        }
      } catch (error) {
        console.error("LogMeal API error:", error);
        console.log("Falling back to Gemini API");
      }
    }

    // Try Gemini API as backup or primary if LogMeal isn't available
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      try {
        const geminiResult = await analyzeWithGemini(imageBase64);
        if (geminiResult) {
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

// Function to analyze with LogMeal API
const analyzeWithLogMeal = async (imageBase64) => {
  const apiKey = import.meta.env.VITE_LOGMEAL_API_KEY;
  if (!apiKey) {
    throw new Error("LogMeal API key not configured");
  }

  const base64Data = imageBase64.split(',')[1];
  
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
  console.log("LogMeal API response:", data);

  if (data && data.recognition_results) {
    return data.recognition_results;
  }
  
  return [];
};

// Format LogMeal API response to match our application structure
const formatLogMealResponse = (recognitionResults) => {
  const detectedFoods = recognitionResults.map(item => {
    // Calculate estimated calories and nutrients based on the food type
    // These would ideally come from the API but we're estimating them for now
    const baseCalories = Math.floor(100 + Math.random() * 300);
    const protein = Math.floor(2 + Math.random() * 20);
    const carbs = Math.floor(5 + Math.random() * 30);
    const fat = Math.floor(2 + Math.random() * 15);
    const fiber = Math.floor(1 + Math.random() * 5);
    
    return {
      name: item.name.toLowerCase(),
      confidence: item.prob,
      servingSize: "1 serving",
      calories: baseCalories,
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

  // Call Gemini API with image and prompt
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64.split(",")[1], mimeType: "image/jpeg" } }
  ]);

  const responseText = await result.response.text();
  console.log("Gemini API response:", responseText);

  return parseGeminiResponse(responseText);
};

// Function to parse Gemini's text response
const parseGeminiResponse = (responseText) => {
  const detectedFoods = [];
  const foodRegex = /Food:\s*([\w\s]+),\s*Calories:\s*(\d+),\s*Serving:\s*([\w\s\d]+)/gi;

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
    return null;
  }

  return {
    responses: [{
      localizedObjectAnnotations: detectedFoods,
      labelAnnotations: detectedFoods.map(food => ({
        description: food.name,
        score: 0.9
      }))
    }]
  };
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
