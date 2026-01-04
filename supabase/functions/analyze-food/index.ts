import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing food image with Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert AI that analyzes food images. When given an image of food, identify all food items visible and provide detailed nutritional information for a standard serving of each item.

For each food item detected, provide:
- name: The name of the food
- servingSize: A typical serving size description (e.g., "1 cup", "100g", "1 medium")
- calories: Estimated calories per serving (number)
- protein: Grams of protein (number)
- carbs: Grams of carbohydrates (number)
- fat: Grams of fat (number)
- fiber: Grams of fiber (number)
- confidence: Your confidence in the detection (0.0 to 1.0)

Respond ONLY with a valid JSON object in this exact format:
{
  "foods": [
    {
      "name": "Food Name",
      "servingSize": "serving description",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 8,
      "fiber": 3,
      "confidence": 0.95
    }
  ]
}

If you cannot identify any food in the image, respond with:
{
  "foods": [],
  "error": "No food items detected in the image"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this food image and identify all food items with their nutritional information. Provide accurate calorie and macro estimates for standard serving sizes."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from AI");
    }

    // Parse the JSON response from the AI
    let parsedResult;
    try {
      // Handle markdown code blocks if present
      let jsonContent = content;
      if (content.includes("```json")) {
        jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (content.includes("```")) {
        jsonContent = content.replace(/```\n?/g, "");
      }
      parsedResult = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse nutrition data from AI response");
    }

    console.log("Parsed result:", parsedResult);

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-food error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
