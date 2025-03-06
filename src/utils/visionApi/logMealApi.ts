
// Function to analyze with LogMeal API
export const analyzeWithLogMeal = async (imageBase64) => {
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
export const formatLogMealResponse = (recognitionResults) => {
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
