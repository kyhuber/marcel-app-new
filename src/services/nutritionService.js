import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export function useNutritionTracking() {
  // This ref is shared across all components that use this composable
  const dailyGoals = ref({
    calories: 2000,
    protein: 100,
    carbs: 250,
    fat: 70
  })

  // Load goals from Firestore
  const loadGoals = async () => {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) return

    try {
      const goalsDoc = await getDoc(doc(db, 'userGoals', user.uid))
      
      if (goalsDoc.exists()) {
        dailyGoals.value = {
          ...dailyGoals.value,
          ...goalsDoc.data()
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  // Load goals when the service is initialized
  loadGoals()

  const calculateNutrientPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100)
  }

  const analyzeNutrition = (meals) => {
    const totals = meals.reduce((acc, meal) => {
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
    loadGoals // Export the loadGoals function so components can refresh goals
  }
}