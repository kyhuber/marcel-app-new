<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1>{{ $t('dashboard.title') }}</h1>
        <DateSelector :selectedDate="selectedDate" @update:date="updateSelectedDate" />
      </header>

      <section class="dashboard-content">
        <!-- Empty state handling -->
        <EmptyState 
          v-if="showEmptyState"
          :isFirstTimeUser="isFirstTimeUser" 
          :dailyGoals="dailyGoals" 
        />

        <!-- Only show nutrition summary when we have meals -->
        <div v-if="!showEmptyState" class="nutrition-summary-section">
          <h2>{{ $t('dashboard.todayNutrition') }}</h2>
          <div class="nutrition-cards">
            <NutritionCard 
              :title="$t('nutrition.calories')" 
              :current="totalCalories" 
              :target="dailyGoals.calories" 
              :unit="$t('nutrition.units.calories')" 
              color="#4285F4" 
              icon="calories"
            />
            <NutritionCard 
              :title="$t('nutrition.protein')" 
              :current="totalProtein" 
              :target="dailyGoals.protein" 
              :unit="$t('nutrition.units.grams')" 
              color="#34A853" 
              icon="protein"
            />
            <NutritionCard 
              :title="$t('nutrition.carbs')" 
              :current="totalCarbs" 
              :target="dailyGoals.carbs" 
              :unit="$t('nutrition.units.grams')" 
              color="#FBBC05" 
              icon="carbs"
            />
            <NutritionCard 
              :title="$t('nutrition.fat')" 
              :current="totalFat" 
              :target="dailyGoals.fat" 
              :unit="$t('nutrition.units.grams')" 
              color="#EA4335" 
              icon="fat"
            />
          </div>
        </div>

        <div class="record-meal-section">
          <h2>{{ $t('dashboard.logMeal') }}</h2>
          <p class="voice-instructions">
            {{ $t('dashboard.voiceInstructions') }}
          </p>
          <VoiceRecorder @meal-saved="handleMealSaved" />
        </div>

        <div class="recent-meals-section">
          <div class="section-header">
            <h2>{{ $t('dashboard.recentMeals') }}</h2>
            <button v-if="recentMeals.length > 0" @click="showAllMeals" class="view-all-btn">{{ $t('dashboard.viewAll') }}</button>
          </div>
          <MealList 
            :meals="recentMeals" 
            @edit-meal="editMeal" 
            @delete-meal="deleteMeal"
            @log-meal="goToRecordMeal"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  limit
} from 'firebase/firestore'

import { db } from '@/firebase'
import MealList from '@/components/MealList.vue'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import NutritionCard from '@/components/NutritionCard.vue'
import DateSelector from '@/components/DateSelector.vue'
import Sidebar from '@/components/Sidebar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useNutritionTracking } from '@/services/nutritionService'

const { t } = useI18n()
const router = useRouter()
const totalCalories = ref(0)
const totalProtein = ref(0)
const totalCarbs = ref(0)
const totalFat = ref(0)
const recentMeals = ref([])
const selectedDate = ref(new Date())
const isFirstTimeUser = ref(false)
const { dailyGoals } = useNutritionTracking()

// Computed property to determine if we should show empty state
const showEmptyState = computed(() => {
  // Show empty state if we have no meals
  return recentMeals.value.length === 0;
})

const updateSelectedDate = (date) => {
  selectedDate.value = date
  fetchDailyNutrition()
}

const editMeal = (mealId) => {
  router.push(`/meals/edit/${mealId}`)
}

const handleMealSaved = async (meal) => {
  // When a meal is saved, refresh the daily nutrition and set firstTimeUser to false
  isFirstTimeUser.value = false
  await fetchDailyNutrition()
}

const fetchDailyNutrition = async () => {
  const auth = getAuth()
  const user = auth.currentUser

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
    alert(t('errors.saveFailed'))
  }
}

const checkFirstTimeUser = async () => {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) return

  try {
    // Query for any meals by this user
    const allMealsQuery = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      limit(1)
    )
    
    const querySnapshot = await getDocs(allMealsQuery)
    
    // If no meals at all, this is a first-time user
    isFirstTimeUser.value = querySnapshot.empty
  } catch (error) {
    console.error('Error checking first-time user:', error)
    // Default to false if there's an error
    isFirstTimeUser.value = false
  }
}

const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId))
    await fetchDailyNutrition()
  } catch (error) {
    console.error('Error deleting meal:', error)
    alert(t('errors.saveFailed'))
  }
}

const showAllMeals = () => {
  router.push('/mealhistory')
}

const goToRecordMeal = () => {
  // This function scrolls to the record meal section
  const mealSection = document.querySelector('.record-meal-section')
  if (mealSection) {
    mealSection.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  await checkFirstTimeUser()
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
  background-color: var(--background-card);
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.nutrition-summary-section, 
.record-meal-section, 
.recent-meals-section {
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
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