
export const analyzeImage = async (imageBase64: string) => {
  const API_KEY = 'd1f2f9ee30c9e007787a232c60cb4d93eeba05a0';
  const API_ENDPOINT = 'https://api.logmeal.es/v2/image/recognition/complete';
  
  // Convert base64 to blob
  const base64Response = await fetch(imageBase64);
  const blob = await base64Response.blob();

  // Create form data
  const formData = new FormData();
  formData.append('image', blob);

  try {
    console.log('Sending image to LogMeal API...');
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LogMeal API error:', errorData);
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    console.log('LogMeal API response:', data);

    // Extract nutritional information if available
    const nutritionalInfo = data.foodType?.nutrition || {};
    const foodItems = data.recognition_results || [];

    // Transform LogMeal response to match our expected format with enhanced detection
    return {
      responses: [{
        localizedObjectAnnotations: foodItems.map((item: any) => ({
          name: item.name.toLowerCase(),
          confidence: item.prob,
          servingSize: nutritionalInfo.servingSize || 'Standard serving',
          calories: nutritionalInfo.calories || calculateEstimatedCalories(item.name),
          nutrients: {
            protein: nutritionalInfo.protein || estimateNutrient(item.name, 'protein'),
            carbs: nutritionalInfo.carbs || estimateNutrient(item.name, 'carbs'),
            fat: nutritionalInfo.fat || estimateNutrient(item.name, 'fat'),
            fiber: nutritionalInfo.fiber || estimateNutrient(item.name, 'fiber')
          }
        })),
        labelAnnotations: foodItems.map((item: any) => ({
          description: item.name.toLowerCase(),
          score: item.prob
        }))
      }]
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

// Fallback function to estimate calories if the API doesn't provide them
const calculateEstimatedCalories = (foodName: string): number => {
  // Simple mapping of common foods to approximate calories
  const calorieMap: {[key: string]: number} = {
    'apple': 95,
    'banana': 105,
    'orange': 62,
    'pizza': 285,
    'burger': 354,
    'salad': 152,
    'rice': 206,
    'pasta': 220,
    'bread': 75,
    'chicken': 165,
    'fish': 190,
    'beef': 250,
    'potato': 130,
    'donut': 195,
    'cake': 352,
    'ice cream': 273
  };
  
  // Try to match the food name with our simple database
  const matchedFood = Object.keys(calorieMap).find(food => 
    foodName.toLowerCase().includes(food.toLowerCase())
  );
  
  return matchedFood ? calorieMap[matchedFood] : 100; // Default to 100 calories if unknown
};

// Estimate nutrient values for common foods
const estimateNutrient = (foodName: string, nutrient: string): number => {
  const nutrientMaps: {[key: string]: {[key: string]: number}} = {
    'protein': {
      'apple': 0.5,
      'banana': 1.3,
      'orange': 0.9,
      'pizza': 12,
      'burger': 20,
      'salad': 3.7,
      'rice': 4.3,
      'pasta': 8.1,
      'bread': 3.6,
      'chicken': 31,
      'fish': 22,
      'beef': 26,
      'potato': 2.5,
      'donut': 3.8,
      'cake': 5.2,
      'ice cream': 3.8
    },
    'carbs': {
      'apple': 25,
      'banana': 27,
      'orange': 15,
      'pizza': 33,
      'burger': 31,
      'salad': 11,
      'rice': 45,
      'pasta': 43,
      'bread': 13,
      'chicken': 0,
      'fish': 0,
      'beef': 0,
      'potato': 27,
      'donut': 22,
      'cake': 38,
      'ice cream': 31
    },
    'fat': {
      'apple': 0.3,
      'banana': 0.4,
      'orange': 0.1,
      'pizza': 10,
      'burger': 17,
      'salad': 10,
      'rice': 0.4,
      'pasta': 1.1,
      'bread': 1,
      'chicken': 3.6,
      'fish': 10,
      'beef': 17,
      'potato': 0.1,
      'donut': 12,
      'cake': 18,
      'ice cream': 14
    },
    'fiber': {
      'apple': 4.4,
      'banana': 3.1,
      'orange': 3.1,
      'pizza': 2.5,
      'burger': 1.3,
      'salad': 4.2,
      'rice': 0.6,
      'pasta': 2.5,
      'bread': 1.1,
      'chicken': 0,
      'fish': 0,
      'beef': 0,
      'potato': 2.5,
      'donut': 0.7,
      'cake': 0.4,
      'ice cream': 0.8
    }
  };
  
  // Try to match the food name with our simple database
  const matchedFood = Object.keys(nutrientMaps[nutrient]).find(food => 
    foodName.toLowerCase().includes(food.toLowerCase())
  );
  
  // Return the nutrient value or a default
  return matchedFood ? nutrientMaps[nutrient][matchedFood] : 
    (nutrient === 'protein' ? 2 : 
     nutrient === 'carbs' ? 15 : 
     nutrient === 'fat' ? 5 : 1); // Default values
};
