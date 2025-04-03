// Ensure you're using a named export
export function getNutritionEstimate(foodItems) {
    return foodItems.reduce((total, item) => {
      const foodData = NUTRITION_DATABASE[item.toLowerCase()] || 
                       { calories: 50, protein: 2 }
      
      total.calories += foodData.calories
      total.protein += foodData.protein
      
      return total
    }, { calories: 0, protein: 0 })
  }
  
  // Add the database as a named export or default export
  export const NUTRITION_DATABASE = {
    'chicken': { calories: 165, protein: 31, per: '100g' },
    'rice': { calories: 130, protein: 2.7, per: '100g' },
    'salmon': { calories: 208, protein: 22, per: '100g' },
    'salad': { calories: 20, protein: 1, per: '100g' },
    'pasta': { calories: 131, protein: 5.5, per: '100g' },
    // Expand this database
  }