
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

    // Transform LogMeal response to match our expected format
    return {
      responses: [{
        localizedObjectAnnotations: data.recognition_results.map((item: any) => ({
          name: item.name.toLowerCase(),
          confidence: item.prob
        })),
        labelAnnotations: data.recognition_results.map((item: any) => ({
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
