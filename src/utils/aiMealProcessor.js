import { openai } from '@/config/openai'
import { getNutritionEstimate } from './nutritionDatabase'
import { usageTracker } from '@/services/openaiService'

export async function aiProcessMeal(transcript) {
  try {
    console.log('Processing meal with transcript:', transcript)
    
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
`

    console.log('Sending request to OpenAI')
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })

    console.log('Received response from OpenAI')
    
    // Track OpenAI usage if the tracker is available
    if (usageTracker && response.usage) {
      usageTracker.trackUsage(response.usage.total_tokens)
    }

    let mealData
    try {
      mealData = JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      console.log('Raw response:', response.choices[0].message.content)
      throw new Error('Invalid response format from OpenAI')
    }
    
    // Extract simple food item names for display
    const foodItemNames = mealData.foodItems.map(item => item.name)
    
    // Create the final meal data object
    const finalMealData = {
      description: transcript,
      mealType: mealData.mealTime || 'unspecified',
      foodItems: foodItemNames,
      calories: mealData.totalCalories || 0,
      protein: mealData.totalProtein || 0,
      timestamp: new Date(),
      rawAnalysis: mealData // Store the full analysis for reference
    }
    
    console.log('Processed meal data:', finalMealData)
    return finalMealData
    
  } catch (error) {
    console.error("Error in aiProcessMeal:", error)
    
    // Use fallback nutrition estimation
    const fallbackEstimate = getNutritionEstimate([transcript])
    
    return {
      description: transcript,
      foodItems: [transcript],
      calories: fallbackEstimate.calories,
      protein: fallbackEstimate.protein,
      mealType: 'unknown',
      timestamp: new Date(),
      processingError: error.message
    }
  }
}