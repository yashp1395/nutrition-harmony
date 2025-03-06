import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Function to analyze the image and estimate calories
export const analyzeImage = async (imageBase64) => {
  try {
    console.log("Analyzing uploaded food image using Gemini API...");

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn("Gemini API key not found, using mock implementation");
      return mockAnalyzeImage();
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Identify the food in the image and estimate its calorie content. 
    If multiple foods are present, list each one with its approximate calorie count per serving. 
    Also, include the standard serving amount for each food.  
    Format the response as:  
    "Food: [name], Calories: [number], Serving: [amount]"`;

    // Call Gemini API with image and prompt
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    const responseText = await result.response.text();
    console.log("Gemini API response:", responseText);

    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return mockAnalyzeImage();
  }
};

// Function to parse Gemini's text response
const parseGeminiResponse = (responseText) => {
  const detectedFoods = [];
  const foodRegex = /Food:\s*([\w\s]+),\s*Calories:\s*(\d+),\s*Serving:\s*([\w\s\d]+)/gi;

  let match;
  while ((match = foodRegex.exec(responseText)) !== null) {
    detectedFoods.push({
      name: match[1].trim().toLowerCase(),
      confidence: 0.9, // Assume high confidence since Gemini identified it
      servingSize: match[3].trim(), // Extracted serving amount
      calories: parseInt(match[2]),
      nutrients: { protein: 2, carbs: 15, fat: 5, fiber: 1 }
    });
  }

  if (detectedFoods.length === 0) {
    console.warn("No structured food data detected, using mock implementation");
    return mockAnalyzeImage();
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

// Fallback function for mock analysis
const mockAnalyzeImage = async () => {
  console.log("Using mock food detection...");
  return {
    responses: [{
      localizedObjectAnnotations: [{
        name: "mock food",
        confidence: 0.85,
        servingSize: "1 cup",
        calories: 150,
      }],
    }],
  };
};
