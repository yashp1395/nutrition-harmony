
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with the Gemini API key
const genAI = new GoogleGenerativeAI("AIzaSyA9gMflnfM-uteYZiFIoTYefjPYh5VDQG0");

// Function to analyze with Gemini API
export const analyzeWithGemini = async (imageBase64) => {
  // Initialize Gemini model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Identify all the foods visible in this image. Be very detailed and comprehensive in your analysis.
  Each food should be identified separately, even if they're part of the same dish.
  For each food item detected, provide:
  1. The exact name of the food
  2. An estimate of calories per serving
  3. The standard serving size
  4. Estimated macronutrients (protein, carbs, fat, fiber) in grams

  Format your response exactly like this:
  Food: [food name], Calories: [number], Serving: [serving size], Protein: [number]g, Carbs: [number]g, Fat: [number]g, Fiber: [number]g
  
  For example:
  Food: Apple, Calories: 95, Serving: 1 medium (182g), Protein: 0.5g, Carbs: 25g, Fat: 0.3g, Fiber: 4.4g
  Food: White Rice, Calories: 205, Serving: 1 cup cooked (158g), Protein: 4.3g, Carbs: 45g, Fat: 0.4g, Fiber: 0.6g
  Food: Grilled Chicken Breast, Calories: 165, Serving: 3 oz (85g), Protein: 31g, Carbs: 0g, Fat: 3.6g, Fiber: 0g
  
  Be precise and detailed about each food item. If there are multiple food items, list each one separately.`;

  try {
    // Call Gemini API with image and prompt
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    const responseText = await result.response.text();
    console.log("API response:", responseText);

    // Parse the text response
    const parsedFoods = parseGeminiResponse(responseText);
    
    if (parsedFoods.length === 0) {
      throw new Error("API couldn't identify any food in the image");
    }

    return {
      responses: [{
        localizedObjectAnnotations: parsedFoods,
        labelAnnotations: parsedFoods.map(food => ({
          description: food.name,
          score: 0.9
        }))
      }]
    };
  } catch (error) {
    console.error("Error calling API:", error);
    throw new Error("API failed: " + error.message);
  }
};

// Function to parse Gemini's text response
export const parseGeminiResponse = (responseText) => {
  const detectedFoods = [];
  // Improved regex to match Gemini's output format including macronutrients
  const foodRegex = /Food:\s*([\w\s\-,']+),\s*Calories:\s*(\d+),\s*Serving:\s*([\w\s\d.()]+)(?:,\s*Protein:\s*([\d.]+)g)?(?:,\s*Carbs:\s*([\d.]+)g)?(?:,\s*Fat:\s*([\d.]+)g)?(?:,\s*Fiber:\s*([\d.]+)g)?/gi;

  let match;
  while ((match = foodRegex.exec(responseText)) !== null) {
    detectedFoods.push({
      name: match[1].trim().toLowerCase(),
      confidence: 0.9,
      servingSize: match[3].trim(),
      calories: parseInt(match[2]),
      nutrients: { 
        protein: match[4] ? parseFloat(match[4]) : 0, 
        carbs: match[5] ? parseFloat(match[5]) : 0, 
        fat: match[6] ? parseFloat(match[6]) : 0, 
        fiber: match[7] ? parseFloat(match[7]) : 0 
      }
    });
  }

  if (detectedFoods.length === 0) {
    console.warn("No structured food data detected from API, trying fallback parsing");
    
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
