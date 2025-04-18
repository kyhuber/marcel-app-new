export function getMealAnalysisPrompt(transcript) {
  return `
You are an assistant that processes meal descriptions to extract food items and estimate nutritional content. Given the following transcribed text, please:
1. Identify each food item mentioned.
2. Estimate the portion size if it is specified.
3. Estimate the protein content in grams, calories, carbohydrates in grams, and fat in grams for each food item.
4. Assign a confidence level ("high", "medium", or "low") to each estimation.
5. Extract the meal time if mentioned (e.g., breakfast, lunch, dinner, snack, or dessert).
   IMPORTANT: mealTime MUST be one of: "breakfast", "lunch", "dinner", "snack", "dessert" only.
   If a specific meal type is not clearly stated, use the most appropriate option based on:
   - Breakfast: morning meals
   - Lunch: midday meals
   - Dinner: evening meals
   - Snack: small meals between main meals
   - Dessert: sweet treats typically after meals
   Do NOT include time references like "yesterday" or "2 days ago" as the meal type.
6. Return the output as valid JSON with the following structure:

{
  "mealTime": "<must be one of: breakfast, lunch, dinner, snack, or dessert>",
  "foodItems": [
    {
      "name": "<food name>",
      "estimatedAmount": "<portion details if available, otherwise null>",
      "protein": <estimated protein in grams as a number>,
      "calories": <estimated calories as a number>,
      "carbs": <estimated carbohydrates in grams as a number>,
      "fat": <estimated fat in grams as a number>,
      "confidence": "<confidence level>"
    }
  ],
  "totalProtein": <sum of protein values as a number>,
  "totalCalories": <sum of calories values as a number>,
  "totalCarbs": <sum of carbohydrate values as a number>,
  "totalFat": <sum of fat values as a number>
}

This is important: your response must be valid JSON only. Include carbs and fat values for every food item.

Here is the transcribed text:
"${transcript}"
`;
}