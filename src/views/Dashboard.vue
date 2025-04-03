<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Nutrition Tracker</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </header>

    <section class="nutrition-summary">
      <div class="summary-card">
        <h2>Today's Intake</h2>
        <div class="nutrition-stats">
          <div class="stat-item">
            <span class="stat-label">Calories</span>
            <span class="stat-value">{{ totalCalories }} cal</span>
            <ProgressBar 
              :value="totalCalories" 
              :max="2000" 
              color="#4285F4"
            />
          </div>
          <div class="stat-item">
            <span class="stat-label">Protein</span>
            <span class="stat-value">{{ totalProtein }}g</span>
            <ProgressBar 
              :value="totalProtein" 
              :max="100" 
              color="#34A853"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="voice-input">
      <button 
        @click="startVoiceRecording" 
        class="record-btn"
      >
        <MicIcon />
        Record Meal
      </button>
    </section>

    <section class="recent-meals">
      <h2>Recent Meals</h2>
      <MealList :meals="recentMeals" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getAuth, 
  signOut 
} from 'firebase/auth'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore'

import { db } from '@/firebase'
import ProgressBar from '@/components/ProgressBar.vue'
import MealList from '@/components/MealList.vue'
import MicIcon from '@/components/icons/MicIcon.vue'
import { aiProcessMeal } from '@/utils/aiMealProcessor'
import { saveMealEntry } from '@/services/mealService'

const router = useRouter()
const totalCalories = ref(0)
const totalProtein = ref(0)
const recentMeals = ref([])

const logout = async () => {
  const auth = getAuth()
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout error', error)
  }
}

const startVoiceRecording = async () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      await processMealInput(transcript)
    }

    recognition.start()
  } else {
    alert('Speech recognition not supported')
  }
}

const processMealInput = async (transcript) => {
  // AI-powered meal processing logic
  // This would integrate with OpenAI/Claude API
  const mealDetails = await aiProcessMeal(transcript)
  
  // Save to Firestore
  await saveMealEntry(mealDetails)
}

const fetchDailyNutrition = async () => {
  const user = getAuth().currentUser
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const q = query(
    collection(db, 'meals'),
    where('userId', '==', user.uid),
    where('timestamp', '>=', today),
    orderBy('timestamp', 'desc')
  )

  const querySnapshot = await getDocs(q)
  
  totalCalories.value = 0
  totalProtein.value = 0

  querySnapshot.forEach((doc) => {
    const meal = doc.data()
    totalCalories.value += meal.calories
    totalProtein.value += meal.protein
  })
}

onMounted(async () => {
  await fetchDailyNutrition()
})
</script>

<style scoped>
.dashboard-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nutrition-summary {
  margin-bottom: 1.5rem;
}

.nutrition-stats {
  display: flex;
  justify-content: space-between;
}

.record-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>