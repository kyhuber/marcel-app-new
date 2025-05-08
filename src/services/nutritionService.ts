import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

// Define interfaces for our data structures
interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionAnalysis {
  totals: NutritionTotals;
  percentages: NutritionTotals;
}

export function useNutritionTracking() {
  const dailyGoals = ref<DailyGoals>({
    calories: 2000,
    protein: 100,
    carbs: 250,
    fat: 70
  })

  const loadGoals = async (): Promise<void> => {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) return

    try {
      const goalsDoc = await getDoc(doc(db, 'userGoals', user.uid))
      
      if (goalsDoc.exists()) {
        dailyGoals.value = {
          ...dailyGoals.value,
          ...goalsDoc.data() as DailyGoals
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  loadGoals()

  const calculateNutrientPercentage = (current: number, goal: number): number => {
    return Math.min((current / goal) * 100, 100)
  }

  const analyzeNutrition = (meals: Meal[]): NutritionAnalysis => {
    const totals = meals.reduce((acc: NutritionTotals, meal: Meal) => {
      acc.calories += meal.calories || 0
      acc.protein += meal.protein || 0
      acc.carbs += meal.carbs || 0
      acc.fat += meal.fat || 0
      return acc
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    })

    return {
      totals,
      percentages: {
        calories: calculateNutrientPercentage(totals.calories, dailyGoals.value.calories),
        protein: calculateNutrientPercentage(totals.protein, dailyGoals.value.protein),
        carbs: calculateNutrientPercentage(totals.carbs, dailyGoals.value.carbs),
        fat: calculateNutrientPercentage(totals.fat, dailyGoals.value.fat)
      }
    }
  }

  return {
    dailyGoals,
    analyzeNutrition,
    loadGoals
  }
}
