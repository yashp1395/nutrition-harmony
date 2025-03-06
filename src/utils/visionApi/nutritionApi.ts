
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
