<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1>Nutrition Tracker</h1>
        <DateSelector :selectedDate="selectedDate" @update:date="updateSelectedDate" />
      </header>

      <section class="dashboard-content">
        <div class="nutrition-summary-section">
          <h2>Today's Nutrition</h2>
          <div class="nutrition-cards">
            <NutritionCard 
              title="Calories" 
              :current="totalCalories" 
              :target="dailyGoals.calories" 
              unit="cal" 
              color="#4285F4" 
              icon="calories"
            />
            <NutritionCard 
              title="Protein" 
              :current="totalProtein" 
              :target="dailyGoals.protein" 
              unit="g" 
              color="#34A853" 
              icon="protein"
            />
            <NutritionCard 
              title="Carbs" 
              :current="totalCarbs" 
              :target="dailyGoals.carbs" 
              unit="g" 
              color="#FBBC05" 
              icon="carbs"
            />
            <NutritionCard 
              title="Fat" 
              :current="totalFat" 
              :target="dailyGoals.fat" 
              unit="g" 
              color="#EA4335" 
              icon="fat"
            />
          </div>
        </div>

        <div class="record-meal-section">
          <h2>Record Your Meal</h2>
          <p class="voice-instructions">Either tap the button and speak your meal, or type what you ate, like "I had a chicken salad with olive oil for lunch"</p>
          <VoiceRecorder @meal-saved="handleMealSaved" />
        </div>

        <div class="recent-meals-section">
          <div class="section-header">
            <h2>Recent Meals</h2>
            <button @click="showAllMeals" class="view-all-btn">View All</button>
          </div>
          <MealList 
            :meals="recentMeals" 
            @edit-meal="editMeal" 
            @delete-meal="deleteMeal"
            @add-meal="goToRecordMeal"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore'

import { db } from '@/firebase'
import MealList from '@/components/MealList.vue'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import NutritionCard from '@/components/NutritionCard.vue'
import DateSelector from '@/components/DateSelector.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useNutritionTracking } from '@/services/nutritionService'

const router = useRouter()
const totalCalories = ref(0)
const totalProtein = ref(0)
const totalCarbs = ref(0)
const totalFat = ref(0)
const recentMeals = ref([])
const selectedDate = ref(new Date())
const { dailyGoals } = useNutritionTracking()

const updateSelectedDate = (date) => {
  selectedDate.value = date
  fetchDailyNutrition()
}

const editMeal = (mealId) => {
  router.push(`/meals/edit/${mealId}`)
}

const handleMealSaved = async (meal) => {
  await fetchDailyNutrition()
}

const fetchDailyNutrition = async () => {
  const auth = getAuth()
  const user = auth.currentUser

  // Redirect to login if no

  // Redirect to login if no user is authenticated
  if (!user) {
    router.push('/')
    return
  }

  // Set start and end of the selected day
  const startDate = new Date(selectedDate.value)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(selectedDate.value)
  endDate.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, 'meals'),
    where('userId', '==', user.uid),
    where('timestamp', '>=', startDate),
    where('timestamp', '<=', endDate),
    orderBy('timestamp', 'desc')
  )

  try {
    const querySnapshot = await getDocs(q)

    // Reset values
    totalCalories.value = 0
    totalProtein.value = 0
    totalCarbs.value = 0
    totalFat.value = 0
    recentMeals.value = []

    querySnapshot.forEach((doc) => {
      const meal = {
        id: doc.id,
        ...doc.data(),
      }
      
      totalCalories.value += meal.calories || 0
      totalProtein.value += meal.protein || 0
      totalCarbs.value += meal.carbs || 0
      totalFat.value += meal.fat || 0
      
      recentMeals.value.push(meal)
    })
  } catch (error) {
    console.error('Error fetching meals:', error)
    alert(`Failed to fetch meals: ${error.message}`)
  }
}

const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId))
    await fetchDailyNutrition()
  } catch (error) {
    console.error('Error deleting meal:', error)
    alert('Failed to delete meal. Please try again.')
  }
}

const showAllMeals = () => {
  router.push('/mealhistory')
}

const goToRecordMeal = () => {
  router.push('/dashboard')
}

onMounted(async () => {
  await fetchDailyNutrition()
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-light);
}

.dashboard-main {
  flex: 1;
  padding: 1.5rem;
  margin-left: 250px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.nutrition-summary-section, 
.record-meal-section, 
.recent-meals-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nutrition-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.voice-instructions {
  margin-bottom: 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-all-btn {
  font-size: 0.875rem;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 70px; /* Make room for bottom navigation */
  }
  
  .nutrition-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  /* Stack sections vertically */
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>