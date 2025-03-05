// Food database with nutrition information
const foodDatabase = [
  { 
    name: 'apple', 
    calories: 95,
    servingSize: '1 medium (182g)',
    nutrients: { protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 }
  },
  { 
    name: 'banana', 
    calories: 105,
    servingSize: '1 medium (118g)',
    nutrients: { protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 }
  },
  { 
    name: 'orange', 
    calories: 62,
    servingSize: '1 medium (131g)',
    nutrients: { protein: 0.9, carbs: 15, fat: 0.1, fiber: 3.1 }
  },
  { 
    name: 'pizza', 
    calories: 285,
    servingSize: '1 slice (107g)',
    nutrients: { protein: 12, carbs: 33, fat: 10, fiber: 2.5 }
  },
  { 
    name: 'burger', 
    calories: 354,
    servingSize: '1 regular (170g)',
    nutrients: { protein: 20, carbs: 31, fat: 17, fiber: 1.3 }
  },
  { 
    name: 'salad', 
    calories: 152,
    servingSize: '1 bowl (150g)',
    nutrients: { protein: 3.7, carbs: 11, fat: 10, fiber: 4.2 }
  },
  { 
    name: 'rice', 
    calories: 206,
    servingSize: '1 cup cooked (158g)',
    nutrients: { protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6 }
  },
  { 
    name: 'pasta', 
    calories: 220,
    servingSize: '1 cup cooked (140g)',
    nutrients: { protein: 8.1, carbs: 43, fat: 1.1, fiber: 2.5 }
  },
  { 
    name: 'bread', 
    calories: 75,
    servingSize: '1 slice (25g)',
    nutrients: { protein: 3.6, carbs: 13, fat: 1, fiber: 1.1 }
  },
  { 
    name: 'chicken', 
    calories: 165,
    servingSize: '100g cooked',
    nutrients: { protein: 31, carbs: 0, fat: 3.6, fiber: 0 }
  },
  { 
    name: 'fish', 
    calories: 190,
    servingSize: '100g cooked',
    nutrients: { protein: 22, carbs: 0, fat: 10, fiber: 0 }
  },
  { 
    name: 'beef', 
    calories: 250,
    servingSize: '100g cooked',
    nutrients: { protein: 26, carbs: 0, fat: 17, fiber: 0 }
  },
  { 
    name: 'potato', 
    calories: 130,
    servingSize: '1 medium (173g)',
    nutrients: { protein: 2.5, carbs: 27, fat: 0.1, fiber: 2.5 }
  },
  { 
    name: 'donut', 
    calories: 195,
    servingSize: '1 regular (47g)',
    nutrients: { protein: 3.8, carbs: 22, fat: 12, fiber: 0.7 }
  },
  { 
    name: 'cake', 
    calories: 352,
    servingSize: '1 slice (80g)',
    nutrients: { protein: 5.2, carbs: 38, fat: 18, fiber: 0.4 }
  },
  { 
    name: 'ice cream', 
    calories: 273,
    servingSize: '1/2 cup (66g)',
    nutrients: { protein: 3.8, carbs: 31, fat: 14, fiber: 0.8 }
  },
  { 
    name: 'cookie', 
    calories: 148,
    servingSize: '1 medium (30g)',
    nutrients: { protein: 1.8, carbs: 18, fat: 7, fiber: 0.5 }
  },
  { 
    name: 'sandwich', 
    calories: 290,
    servingSize: '1 regular (150g)',
    nutrients: { protein: 15, carbs: 28, fat: 12, fiber: 2.8 }
  },
  { 
    name: 'eggs', 
    calories: 72,
    servingSize: '1 large (50g)',
    nutrients: { protein: 6.3, carbs: 0.4, fat: 5, fiber: 0 }
  },
  { 
    name: 'yogurt', 
    calories: 150,
    servingSize: '1 cup (245g)',
    nutrients: { protein: 8.5, carbs: 17, fat: 8, fiber: 0 }
  },
  { 
    name: 'cheese', 
    calories: 113,
    servingSize: '1 slice (28g)',
    nutrients: { protein: 7, carbs: 0.4, fat: 9, fiber: 0 }
  },
  { 
    name: 'chocolate', 
    calories: 155,
    servingSize: '1 bar (30g)',
    nutrients: { protein: 2.1, carbs: 17, fat: 9, fiber: 1.8 }
  },
  { 
    name: 'nuts', 
    calories: 170,
    servingSize: '1 oz (28g)',
    nutrients: { protein: 5, carbs: 6, fat: 16, fiber: 3 }
  },
  { 
    name: 'soup', 
    calories: 160,
    servingSize: '1 cup (240ml)',
    nutrients: { protein: 4, carbs: 15, fat: 7, fiber: 2.5 }
  }
];

// LogMeal API implementation for food detection
export const analyzeImage = async (imageBase64: string) => {
  try {
    console.log('Analyzing uploaded food image...');
    
    // Get API key from environment variable (stored in Supabase project settings)
    const apiKey = import.meta.env.VITE_LOGMEAL_API_KEY;
    
    if (!apiKey) {
      console.warn('LogMeal API key not found, using mock implementation');
      return mockAnalyzeImage(imageBase64);
    }
    
    // Extract base64 data - remove prefix like "data:image/jpeg;base64,"
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;
    
    // Call the LogMeal API
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
      console.error('LogMeal API error:', response.status, response.statusText);
      // Fall back to mock implementation if API fails
      return mockAnalyzeImage(imageBase64);
    }
    
    const data = await response.json();
    console.log('LogMeal API response:', data);
    
    // Map LogMeal API response to our expected format
    // The response structure may need to be adjusted based on actual LogMeal API response
    const detectedFoods = data.recognition_results.map((result: any) => {
      const foodName = result.name.toLowerCase();
      
      // Try to find matching food in our database for nutrition info
      const matchedFood = foodDatabase.find(item => 
        item.name.toLowerCase().includes(foodName) || 
        foodName.includes(item.name.toLowerCase())
      );
      
      return {
        name: foodName,
        confidence: result.prob,
        servingSize: matchedFood?.servingSize || 'Standard serving',
        calories: matchedFood?.calories || result.nutrition?.calories || 100,
        nutrients: matchedFood?.nutrients || {
          protein: result.nutrition?.protein || 2,
          carbs: result.nutrition?.carbs || 15,
          fat: result.nutrition?.fat || 5,
          fiber: result.nutrition?.fiber || 1
        }
      };
    });
    
    // Format response to match the structure expected by our application
    return {
      responses: [{
        localizedObjectAnnotations: detectedFoods,
        labelAnnotations: detectedFoods.map(food => ({
          description: food.name,
          score: food.confidence
        }))
      }]
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    // Fall back to mock implementation if any error occurs
    return mockAnalyzeImage(imageBase64);
  }
};

// Renamed the original mock implementation so we can fall back to it if needed
const mockAnalyzeImage = async (imageBase64: string) => {
  try {
    console.log('Using mock food detection...');
    
    // We'll extract some data from the base64 image to simulate food detection
    const imageHash = hashImageData(imageBase64);
    const detectedFoods = detectFoodsFromHash(imageHash);
    
    console.log('Mock detected foods:', detectedFoods);
    
    // Format response to match the structure expected by our application
    return {
      responses: [{
        localizedObjectAnnotations: detectedFoods.map(food => ({
          name: food.name,
          confidence: randomConfidence(),
          servingSize: food.servingSize,
          calories: food.calories,
          nutrients: food.nutrients
        })),
        labelAnnotations: detectedFoods.map(food => ({
          description: food.name,
          score: randomConfidence()
        }))
      }]
    };
  } catch (error) {
    console.error('Error in mock analysis:', error);
    throw error;
  }
};

// Generate a simple hash from the image data to create reproducible "random" results
function hashImageData(imageData: string): number {
  let hash = 0;
  
  // Use a portion of the base64 data for the hash
  const sampleData = imageData.slice(imageData.length / 2, imageData.length / 2 + 100);
  
  for (let i = 0; i < sampleData.length; i++) {
    hash = ((hash << 5) - hash) + sampleData.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

// "Detect" foods based on the image hash
function detectFoodsFromHash(hash: number): typeof foodDatabase {
  // Number of foods to detect (1-3)
  const numFoods = (hash % 3) + 1;
  
  // Select random foods from the database based on the hash
  const selectedFoods = [];
  const availableFoods = [...foodDatabase];
  
  for (let i = 0; i < numFoods; i++) {
    const index = (hash + i * 17) % availableFoods.length;
    selectedFoods.push(availableFoods[index]);
    // Remove the selected food to avoid duplicates
    availableFoods.splice(index, 1);
    if (availableFoods.length === 0) break;
  }
  
  return selectedFoods;
}

// Generate a random confidence score between 0.7 and 0.98
function randomConfidence(): number {
  return 0.7 + Math.random() * 0.28;
}
