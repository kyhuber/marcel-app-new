// api/analyze-meal.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize OpenAI with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // This is NOT prefixed with VITE_
    });

    // Extract transcript from request body
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    const prompt = `
You are an assistant that processes meal descriptions to extract food items and estimate nutritional content. Given the following transcribed text, please:
1. Identify each food item mentioned.
2. Estimate the portion size if it is specified.
3. Estimate the protein content in grams and calories for each food item.
4. Assign a confidence level ("high", "medium", or "low") to each estimation.
5. Extract the meal time if mentioned (e.g., breakfast, lunch, dinner, or snack).
6. Return the output as valid JSON with the following structure:

{
  "mealTime": "<meal time if detected, otherwise null>",
  "foodItems": [
    {
      "name": "<food name>",
      "estimatedAmount": "<portion details if available, otherwise null>",
      "protein": <estimated protein in grams as a number>,
      "calories": <estimated calories as a number>,
      "confidence": "<confidence level>"
    }
  ],
  "totalProtein": <sum of protein values as a number>,
  "totalCalories": <sum of calories values as a number>
}

Here is the transcribed text:
"${transcript}"
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Process the response
    const mealData = JSON.parse(response.choices[0].message.content);
    
    // Extract simple food item names for display
    const foodItemNames = mealData.foodItems.map(item => item.name);
    
    // Create the final meal data object
    const finalMealData = {
      description: transcript,
      mealType: mealData.mealTime || 'unspecified',
      foodItems: foodItemNames,
      calories: mealData.totalCalories || 0,
      protein: mealData.totalProtein || 0,
      timestamp: new Date(),
      rawAnalysis: mealData // Store the full analysis for reference
    };

    // Return the processed data
    return res.status(200).json(finalMealData);
  } catch (error) {
    console.error('Error processing meal:', error);
    return res.status(500).json({ 
      error: 'Error processing meal', 
      message: error.message 
    });
  }
}