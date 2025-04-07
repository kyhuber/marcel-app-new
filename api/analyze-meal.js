// api/analyze-meal.js
import OpenAI from 'openai';
import { getMealAnalysisPrompt } from '../src/config/prompts/mealAnalysisPrompt.js';

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

    // Get the prompt from the configuration file
    const prompt = getMealAnalysisPrompt(transcript);

    console.log('Sending request to OpenAI with prompt:', prompt);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.3, // Add temperature parameter for more consistent results
      response_format: { type: "json_object" }
    });

    console.log('Received raw response from OpenAI:', response.choices[0].message.content);

    // Process the response
    const mealData = JSON.parse(response.choices[0].message.content);
    
    console.log('Parsed meal data:', mealData);
    console.log('Carbs value from response:', mealData.totalCarbs);
    console.log('Fat value from response:', mealData.totalFat);
    
    // Extract simple food item names for display
    const foodItemNames = mealData.foodItems.map(item => item.name);
    
    // Create the final meal data object with explicit null checks for each field
    const finalMealData = {
      description: transcript,
      mealType: mealData.mealTime || 'unspecified',
      foodItems: foodItemNames,
      calories: mealData.totalCalories || 0,
      protein: mealData.totalProtein || 0,
      carbs: mealData.totalCarbs || 0, // Ensure this is explicitly set
      fat: mealData.totalFat || 0, // Ensure this is explicitly set
      timestamp: new Date(),
      rawAnalysis: mealData // Store the full analysis for reference
    };

    console.log('Final meal data being returned:', finalMealData);

    // Return the processed data
    return res.status(200).json(finalMealData);
  } catch (error) {
    console.error('Error processing meal:', error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('OpenAI API Error Response:', error.response.data);
    }
    
    // Simple fallback for troubleshooting
    const fallbackData = {
      description: req.body.transcript || 'Unknown meal',
      mealType: 'unknown',
      foodItems: [req.body.transcript || 'Unknown food'],
      calories: 100, // Default fallback values
      protein: 5,
      carbs: 15, // Default carbs value
      fat: 5, // Default fat value
      timestamp: new Date(),
      processingError: error.message
    };
    
    console.log('Returning fallback data due to error:', fallbackData);
    return res.status(200).json(fallbackData);
  }
}