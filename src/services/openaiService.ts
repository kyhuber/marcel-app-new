interface NutritionEntry {
  calories: number;
  protein: number;
  per: string;
}

interface NutritionDatabase {
  [key: string]: NutritionEntry;
}

export const usageTracker = {
  trackUsage: (): void => {
    console.log('Usage tracking handled on server')
  }
};

export const NUTRITION_DATABASE: NutritionDatabase = {
  'beef': { calories: 250, protein: 26, per: '100g' },
  'fish': { calories: 120, protein: 20, per: '100g' },
  'vegetables': { calories: 50, protein: 3, per: '100g' }
};
