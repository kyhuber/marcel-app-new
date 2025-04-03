import { openai } from '@/config/openai'
import { getNutritionEstimate } from './nutritionDatabase'
import { usageTracker } from '@/services/openaiService'

export async function aiProcessMeal(transcript) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a precise nutritional analysis AI. 
          For any meal description, provide:
          - Exact food items
          - Portion sizes
          - Precise calorie count
          - Protein grams
          - Meal type (breakfast/lunch/dinner/snack)

          Response Format:
          {
            "foodItems": ["item1", "item2"],
            "portionSizes": ["1 cup", "3 oz"],
            "calories": 350,
            "protein": 25,
            "mealType": "lunch"
          }`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    })

    // Track OpenAI usage
    usageTracker.trackUsage(response.usage.total_tokens)

    const mealData = JSON.parse(response.choices[0].message.content)
    
    // Fallback nutrition estimation
    const nutritionEstimate = getNutritionEstimate(mealData.foodItems)

    return {
      description: transcript,
      ...mealData,
      calories: mealData.calories || nutritionEstimate.calories,
      protein: mealData.protein || nutritionEstimate.protein,
      timestamp: new Date()
    }
  } catch (error) {
    // Delegate to error handler
    return handleOpenAIError(error, transcript)
  }
}

function handleOpenAIError(error, transcript) {
  console.error("Meal processing error:", error)
  
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