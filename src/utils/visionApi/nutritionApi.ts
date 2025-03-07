
// API Ninjas API key
const API_NINJAS_KEY = "tgYEcDU8vMm/LDp2k/N77w==AZEJ0CFnkv6TiSwl";

// Enhance LogMeal results with nutrition data from API Ninjas
export async function enhanceWithNutritionData(foodItems) {
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
      
      // Improved calorie calculation with correction factors based on food type
      let calculatedCalories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      
      if (nutritionData && nutritionData.length > 0) {
        // Get primary nutrition data from API Ninjas
        const primaryItem = nutritionData[0];
        
        // Apply correction factors for more accurate calorie estimation
        calculatedCalories = Math.round(primaryItem.calories || 0);
        protein = Math.round(primaryItem.protein || 0);
        carbs = Math.round(primaryItem.carbohydrates_total_g || 0);
        fat = Math.round(primaryItem.fat_total_g || 0);
        
        // Apply known correction factors for common undercounted foods
        if (foodName.toLowerCase().includes('rice') || 
            foodName.toLowerCase().includes('pasta') || 
            foodName.toLowerCase().includes('bread')) {
          // Starchy foods are often undercounted
          calculatedCalories = Math.round(calculatedCalories * 1.15);
        } else if (foodName.toLowerCase().includes('cake') || 
                  foodName.toLowerCase().includes('dessert') || 
                  foodName.toLowerCase().includes('sweet')) {
          // Desserts are often undercounted
          calculatedCalories = Math.round(calculatedCalories * 1.2);
        } else if (foodName.toLowerCase().includes('curry') || 
                  foodName.toLowerCase().includes('gravy') || 
                  foodName.toLowerCase().includes('sauce')) {
          // Dishes with sauces/oils can be undercounted
          calculatedCalories = Math.round(calculatedCalories * 1.18);
        }
        
        // Verify calorie value with macronutrient formula as a fallback check
        // 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat
        const calculatedFromMacros = (protein * 4) + (carbs * 4) + (fat * 9);
        
        // If there's a significant discrepancy, use the higher value
        if (calculatedFromMacros > calculatedCalories * 1.3) {
          console.log(`Calorie correction applied for ${foodName}: API reported ${calculatedCalories}, calculated from macros: ${calculatedFromMacros}`);
          calculatedCalories = Math.round(calculatedFromMacros);
        }
      } else {
        // Fallback estimation based on food type with improved accuracy
        calculatedCalories = estimateCaloriesByFoodType(foodName);
        
        // Estimate macros based on food type
        if (isProteinRich(foodName)) {
          protein = Math.round(calculatedCalories * 0.3 / 4); // 30% from protein
          fat = Math.round(calculatedCalories * 0.4 / 9);     // 40% from fat
          carbs = Math.round(calculatedCalories * 0.3 / 4);   // 30% from carbs
        } else if (isCarbRich(foodName)) {
          protein = Math.round(calculatedCalories * 0.12 / 4); // 12% from protein
          fat = Math.round(calculatedCalories * 0.25 / 9);     // 25% from fat
          carbs = Math.round(calculatedCalories * 0.63 / 4);   // 63% from carbs
        } else {
          // Default balanced macros
          protein = Math.round(calculatedCalories * 0.2 / 4);  // 20% from protein
          fat = Math.round(calculatedCalories * 0.3 / 9);      // 30% from fat
          carbs = Math.round(calculatedCalories * 0.5 / 4);    // 50% from carbs
        }
      }
      
      // Create enhanced food item with corrected nutrition values
      enhancedItems.push({
        ...item,
        calories: calculatedCalories,
        nutritionData: nutritionData || [],
        nutrition: {
          id: `api-${foodName}`,
          name: foodName,
          category: item.category || 'detected',
          calories: calculatedCalories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          fiber: nutritionData?.[0]?.fiber_g || 1,
          is_indian_cuisine: isIndianFood(foodName)
        }
      });
    } catch (error) {
      console.error(`Failed to get nutrition data for ${item.name || 'unknown food'}:`, error);
      
      // Even if API failed, add item with estimated calories
      const estimatedCalories = estimateCaloriesByFoodType(item.name || '');
      enhancedItems.push({
        ...item,
        calories: estimatedCalories,
        nutrition: {
          id: `api-${item.name || 'unknown'}`,
          name: item.name || 'Unknown food',
          category: 'detected',
          calories: estimatedCalories,
          protein: Math.round(estimatedCalories * 0.2 / 4), // 20% from protein
          carbs: Math.round(estimatedCalories * 0.5 / 4),   // 50% from carbs
          fat: Math.round(estimatedCalories * 0.3 / 9),     // 30% from fat
          fiber: 1,
          is_indian_cuisine: isIndianFood(item.name || '')
        }
      });
    }
  }
  
  return enhancedItems;
}

// Fetch nutrition data from API Ninjas
export async function fetchNutritionData(foodName) {
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

// Helper function to detect if food is Indian cuisine
function isIndianFood(foodName) {
  const indianFoods = [
    'naan', 'curry', 'tikka', 'masala', 'biryani', 'samosa', 'paneer',
    'dal', 'chutney', 'dosa', 'chapati', 'roti', 'idli', 'pakora',
    'tandoori', 'raita', 'korma', 'vindaloo', 'lassi', 'paratha'
  ];
  
  const lowerName = foodName.toLowerCase();
  return indianFoods.some(food => lowerName.includes(food));
}

// Helper function to identify protein-rich foods
function isProteinRich(foodName) {
  const proteinFoods = [
    'chicken', 'beef', 'pork', 'fish', 'turkey', 'egg', 'tofu', 'tempeh',
    'seitan', 'steak', 'meat', 'protein', 'whey', 'paneer', 'cheese',
    'cottage cheese', 'greek yogurt', 'seafood', 'shrimp', 'lamb'
  ];
  
  const lowerName = foodName.toLowerCase();
  return proteinFoods.some(food => lowerName.includes(food));
}

// Helper function to identify carb-rich foods
function isCarbRich(foodName) {
  const carbFoods = [
    'rice', 'pasta', 'bread', 'potato', 'noodle', 'cereal', 'oats',
    'grain', 'wheat', 'corn', 'tortilla', 'pancake', 'waffle', 'muffin',
    'donut', 'bagel', 'bun', 'cake', 'cookie', 'pastry', 'sweet'
  ];
  
  const lowerName = foodName.toLowerCase();
  return carbFoods.some(food => lowerName.includes(food));
}

// Improved fallback function to estimate calories based on food type
function estimateCaloriesByFoodType(foodName) {
  // Extended and more accurate calorie database for common food types
  const foodTypes = {
    // Proteins
    "chicken breast": 165,
    "chicken thigh": 210,
    "chicken wing": 90,
    "beef steak": 250,
    "ground beef": 235,
    "pork chop": 225,
    "bacon": 130,
    "fish fillet": 140,
    "salmon": 175,
    "tuna": 130,
    "shrimp": 90,
    "egg": 70,
    "tofu": 85,
    
    // Dairy
    "milk": 120,
    "cheese": 110,
    "cheddar cheese": 120,
    "yogurt": 150,
    "greek yogurt": 130,
    "ice cream": 270,
    
    // Grains
    "rice": 210,
    "white rice": 200,
    "brown rice": 220,
    "bread slice": 80,
    "white bread": 75,
    "whole wheat bread": 85,
    "pasta": 200,
    "noodles": 190,
    "cereal": 120,
    "oats": 150,
    "granola": 230,
    
    // Vegetables
    "potato": 130,
    "sweet potato": 120,
    "carrot": 50,
    "broccoli": 55,
    "spinach": 25,
    "lettuce": 15,
    "tomato": 35,
    "cucumber": 30,
    "onion": 40,
    "corn": 95,
    
    // Fruits
    "apple": 95,
    "banana": 105,
    "orange": 65,
    "grape": 70,
    "strawberry": 45,
    "blueberry": 85,
    "watermelon": 50,
    
    // Fast food
    "pizza slice": 280,
    "hamburger": 350,
    "cheeseburger": 400,
    "french fries": 365,
    "fried chicken": 300,
    "hotdog": 250,
    "sandwich": 350,
    
    // Snacks
    "chips": 150,
    "popcorn": 120,
    "pretzel": 110,
    "chocolate bar": 225,
    "candy": 180,
    "cookie": 150,
    "donut": 260,
    "muffin": 250,
    
    // Beverages
    "soda": 150,
    "coffee": 5,
    "tea": 2,
    "juice": 120,
    "smoothie": 220,
    "milkshake": 350,
    "beer": 150,
    "wine": 120,
    "cocktail": 200,
    
    // Indian foods
    "naan": 300,
    "roti": 120,
    "chapati": 70,
    "dosa": 120,
    "idli": 40,
    "samosa": 260,
    "pakora": 175,
    "curry": 350,
    "dal": 130,
    "paneer": 265,
    "biryani": 400,
    "tandoori chicken": 300,
    "butter chicken": 490,
    "tikka masala": 400,
    "raita": 60,
    "chutney": 40,
    "lassi": 230,
    "gulab jamun": 150,
    "jalebi": 140
  };

  // Convert to lowercase for comparison
  const foodLower = foodName.toLowerCase();
  
  // Try to find an exact match in our database
  if (foodTypes[foodLower]) {
    return foodTypes[foodLower];
  }
  
  // Try to find a partial match in our database
  for (const [type, calories] of Object.entries(foodTypes)) {
    if (foodLower.includes(type)) {
      return calories;
    }
  }
  
  // If no specific match, try to identify food category and provide an educated estimate
  if (foodLower.includes("salad")) {
    return 150;  // Default for salads
  } else if (foodLower.includes("soup")) {
    return 180;  // Default for soups
  } else if (foodLower.includes("sandwich") || foodLower.includes("wrap")) {
    return 350;  // Default for sandwiches
  } else if (foodLower.includes("curry") || foodLower.includes("masala")) {
    return 400;  // Default for Indian curries
  } else if (foodLower.includes("fried") || foodLower.includes("battered")) {
    return 320;  // Default for fried foods
  } else if (foodLower.includes("cake") || foodLower.includes("dessert") || foodLower.includes("sweet")) {
    return 300;  // Default for desserts
  } else if (foodLower.includes("protein") || foodLower.includes("meat") || foodLower.includes("chicken") || 
             foodLower.includes("beef") || foodLower.includes("pork") || foodLower.includes("fish")) {
    return 250;  // Default for protein-based dishes
  } else if (foodLower.includes("vegetable") || foodLower.includes("veggie")) {
    return 100;  // Default for vegetable dishes
  } else if (foodLower.includes("fruit")) {
    return 80;   // Default for fruit dishes
  } else if (foodLower.includes("snack") || foodLower.includes("chips")) {
    return 150;  // Default for snacks
  } else if (foodLower.includes("drink") || foodLower.includes("beverage")) {
    return 120;  // Default for beverages
  } else if (foodLower.includes("breakfast")) {
    return 350;  // Default for breakfast items
  } else if (foodLower.includes("lunch") || foodLower.includes("dinner")) {
    return 500;  // Default for full meals
  }

  // Default fallback value
  return 200; // A moderate default for unidentified foods
}
