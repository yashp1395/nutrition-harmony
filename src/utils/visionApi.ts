
export const analyzeImage = async (imageBase64: string) => {
  const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Vision API key is not configured');
  }
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64.split(',')[1],
            },
            features: [
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 10,
              },
              {
                type: 'LABEL_DETECTION',
                maxResults: 10,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Vision API error:', errorData);
    throw new Error('Failed to analyze image');
  }

  const data = await response.json();
  console.log('Vision API response:', data);
  return data;
};
