import { getNutritionEstimate } from './nutritionDatabase';

// Define interfaces for our data structures
interface MealData {
  description: string;
  foodItems: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  timestamp: Date;
  processingError?: string;
  isFallbackData?: boolean;
  error?: boolean;
  errorDetails?: string;
}

interface NutritionEstimate {
  calories: number;
  protein: number;
}

export async function aiProcessMeal(transcript: string): Promise<MealData> {
  try {
    console.log('Processing meal with transcript:', transcript);
    
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${apiUrl}/analyze-meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text(); // Use text() instead of json() for error responses
      console.error('API error response:', errorText);
      throw new Error(errorText || `Error processing meal (Status ${response.status})`);
    }

    // Get response as text first to validate it
    const responseText = await response.text();
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from meal analysis service');
    }
    
    // Try to parse the response as JSON
    let mealData: MealData;
    try {
      mealData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError, 'Response text:', responseText);
      throw new Error('Invalid response format from meal analysis service');
    }
    
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
    
    // If the error is a timeout or network error, provide a more specific message
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return createFallbackData(transcript, "The request timed out. Please try again.");
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return createFallbackData(transcript, "Network connection issue. Please check your internet connection.");
      }
      
      // Return a fallback with error information
      return createFallbackData(transcript, error.message);
    }
    
    // Handle unknown error types
    return createFallbackData(transcript, "An unknown error occurred");
  }
}

// Helper function to create consistent fallback data
function createFallbackData(transcript: string, errorMessage: string): MealData {
  // Use local database as fallback
  const foodItems = transcript.split(/and|,/).map(item => item.trim()).filter(Boolean);
  let fallbackData: MealData = {
    description: transcript,
    foodItems: foodItems.length > 0 ? foodItems : [transcript],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealType: 'unknown',
    timestamp: new Date(),
    processingError: errorMessage,
    isFallbackData: true  // Flag to clearly identify this as fallback data
  };
  
  // Try to estimate nutrition from local database
  try {
    const estimate: NutritionEstimate = getNutritionEstimate(foodItems);
    fallbackData.calories = estimate.calories;
    fallbackData.protein = estimate.protein;
  } catch (err) {
    console.error("Error using local nutrition database:", err);
  }
  
  return fallbackData;
} 