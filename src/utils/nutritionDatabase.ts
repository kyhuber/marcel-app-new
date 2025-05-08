// Define interfaces for our data structures
interface NutritionData {
  calories: number;
  protein: number;
  per: string;
}

interface NutritionEstimate {
  calories: number;
  protein: number;
}

interface NutritionDatabase {
  [key: string]: NutritionData;
}

// Ensure you're using a named export
export function getNutritionEstimate(foodItems: string[]): NutritionEstimate {
  return foodItems.reduce((total, item) => {
    const foodData = NUTRITION_DATABASE[item.toLowerCase()] || 
                     { calories: 50, protein: 2, per: '100g' };
    
    total.calories += foodData.calories;
    total.protein += foodData.protein;
    
    return total;
  }, { calories: 0, protein: 0 });
}

// Add the database as a named export
export const NUTRITION_DATABASE: NutritionDatabase = {
  'chicken': { calories: 165, protein: 31, per: '100g' },
  'rice': { calories: 130, protein: 2.7, per: '100g' },
  'salmon': { calories: 208, protein: 22, per: '100g' },
  'salad': { calories: 20, protein: 1, per: '100g' },
  'pasta': { calories: 131, protein: 5.5, per: '100g' },
  // Expand this database
}; 