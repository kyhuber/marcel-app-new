<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <main class="dashboard-main">
      <header class="dashboard-header">
        <h1>Nutrition Tracker</h1>
        <DateSelector :selectedDate="selectedDate" @update:date="updateSelectedDate" />
        <button @click="logout" class="logout-btn">
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </header>

      <section class="dashboard-content">
        <div class="nutrition-summary-section">
          <h2>Today's Nutrition</h2>
          <div class="nutrition-cards">
            <NutritionCard 
              title="Calories" 
              :current="totalCalories" 
              :target="2000" 
              unit="cal" 
              color="#4285F4" 
              icon="calories"
            />
            <NutritionCard 
              title="Protein" 
              :current="totalProtein" 
              :target="100" 
              unit="g" 
              color="#34A853" 
              icon="protein"
            />
            <NutritionCard 
              title="Carbs" 
              :current="totalCarbs" 
              :target="250" 
              unit="g" 
              color="#FBBC05" 
              icon="carbs"
            />
            <NutritionCard 
              title="Fat" 
              :current="totalFat" 
              :target="70" 
              unit="g" 
              color="#EA4335" 
              icon="fat"
            />
          </div>
        </div>

        <div class="record-meal-section">
          <button 
            @click="startVoiceRecording" 
            class="record-btn"
            :class="{ 'recording': isRecording }"
          >
            <MicIcon />
            <span>{{ isRecording ? 'Recording...' : 'Record Meal' }}</span>
          </button>
          <div v-if="transcription" class="transcription-display">
            "{{ transcription }}"
          </div>
          <div class="quick-add-options">
            <button 
              v-for="(meal, index) in quickAddMeals" 
              :key="index" 
              @click="quickAddMeal(meal)"
              class="quick-add-btn"
            >
              {{ meal.name }}
            </button>
          </div>
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
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
  limit,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'

import { db } from '@/firebase'
import MealList from '@/components/MealList.vue'
import Icon from '@/components/IconsLibrary.vue'
import Sidebar from '@/components/Sidebar.vue'
import DateSelector from '@/components/DateSelector.vue'
import { aiProcessMeal } from '@/utils/aiMealProcessor'
import { saveMealEntry } from '@/services/mealService'
import { useNutritionTracking } from '@/services/nutritionService'

const router = useRouter()
const totalCalories = ref(0)
const totalProtein = ref(0)
const totalCarbs = ref(0)
const totalFat = ref(0)
const recentMeals = ref([])
const isRecording = ref(false)
const transcription = ref('')
const selectedDate = ref(new Date())
const { dailyGoals } = useNutritionTracking()

const quickAddMeals = [
  { name: 'Protein Shake', calories: 200, protein: 25, carbs: 5, fat: 3 },
  { name: 'Chicken & Rice', calories: 350, protein: 30, carbs: 45, fat: 5 },
  { name: 'Greek Yogurt', calories: 150, protein: 15, carbs: 8, fat: 0 }
]

const logout = async () => {
  const auth = getAuth()
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout error', error)
  }
}

const updateSelectedDate = (date) => {
  selectedDate.value = date
  fetchDailyNutrition()
}

const startVoiceRecording = async () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isRecording.value = true
      transcription.value = ''
    }

    recognition.onend = () => {
      isRecording.value = false
    }

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      transcription.value = transcript
      await processMealInput(transcript)
    }

    recognition.start()
  } else {
    alert('Speech recognition is not supported in your browser')
  }
}

const processMealInput = async (transcript) => {
  try {
    const mealDetails = await aiProcessMeal(transcript)
    await saveMealEntry(mealDetails)
    await fetchDailyNutrition()
    transcription.value = ''
  } catch (error) {
    console.error('Error processing meal:', error)
  }
}

const quickAddMeal = async (meal) => {
  try {
    const mealEntry = {
      ...meal,
      description: meal.name,
      timestamp: new Date(),
    }
    await saveMealEntry(mealEntry)
    await fetchDailyNutrition()
  } catch (error) {
    console.error('Error adding quick meal:', error)
  }
}

const fetchDailyNutrition = async () => {
  const user = getAuth().currentUser
  if (!user) return

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
      
      // Add to recent meals
      recentMeals.value.push(meal)
    })
  } catch (error) {
    console.error('Error fetching nutrition data:', error)
  }
}

const editMeal = (mealId) => {
  // Implement edit functionality
  console.log('Edit meal:', mealId)
}

const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId))
    await fetchDailyNutrition()
  } catch (error) {
    console.error('Error deleting meal:', error)
  }
}

const showAllMeals = () => {
  router.push('/meals')
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

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: var(--text-dark);
  border: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #f5f5f5;
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

.record-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-btn:hover {
  background-color: #3b77db;
}

.record-btn.recording {
  background-color: #d32f2f;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.transcription-display {
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: var(--border-radius);
  font-style: italic;
}

.quick-add-options {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.quick-add-btn {
  background-color: #f0f2f5;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-add-btn:hover {
  background-color: #e0e0e0;
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
  }
  
  .nutrition-cards {
    grid-template-columns: 1fr 1fr;
  }
}
</style>