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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error processing meal');
    }

    const mealData = await response.json();
    console.log('Processed meal data:', mealData);
    return mealData;
    
  } catch (error) {
    console.error("Error in aiProcessMeal:", error);
    
    // Use fallback nutrition estimation
    const fallbackEstimate = getNutritionEstimate([transcript]);
    
    return {
      description: transcript,
      foodItems: [transcript],
      calories: fallbackEstimate.calories,
      protein: fallbackEstimate.protein,
      mealType: 'unknown',
      timestamp: new Date(),
      processingError: error.message
    };
  }
}