// src/utils/aiMealProcessor.js
import { getNutritionEstimate } from './nutritionDatabase';

export async function aiProcessMeal(transcript) {
  try {
    console.log('Processing meal with transcript:', transcript);
    
    // Call our secure serverless function instead of OpenAI directly
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error processing meal');
    }

    // Parse the JSON response
    const mealData = await response.json();
    
    // Log the response for debugging
    console.log('Processed meal data:', mealData);
    
    // Check if the API returned an error in the data
    if (mealData.error) {
      throw new Error(mealData.errorDetails || 'Error in meal analysis');
    }
    
    // Check for presence of required nutrition data
    if (!mealData.calories && !mealData.protein) {
      console.warn('Missing nutrition data in API response:', mealData);
      throw new Error('The meal analysis returned incomplete nutrition data');
    }
    
    return mealData;
    
  } catch (error) {
    console.error("Error in aiProcessMeal:", error);
    
    // Return a fallback with error information
    // This helps the component distinguish between real data and fallback data
    return {
      description: transcript,
      foodItems: [transcript],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealType: 'unknown',
      timestamp: new Date(),
      processingError: error.message,
      isFallbackData: true  // Flag to clearly identify this as fallback data
    };
  }
}