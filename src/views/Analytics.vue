<template>
  <div class="analytics-container">
    <Sidebar />
    
    <main class="analytics-main">
      <header class="analytics-header">
        <h1>Nutrition Analytics</h1>
        <DateSelector 
          :selectedDate="selectedDate" 
          @update:date="updateSelectedDate"
        />
      </header>

      <section class="analytics-content">
        <div class="nutrition-overview">
          <div class="overview-cards">
            <NutritionCard 
              title="Total Calories" 
              :current="totalCalories" 
              :target="dailyGoals.calories" 
              unit="cal" 
              color="#4285F4"
              icon="calories"
            />
            <NutritionCard 
              title="Total Protein" 
              :current="totalProtein" 
              :target="dailyGoals.protein" 
              unit="g" 
              color="#34A853"
              icon="protein"
            />
            <NutritionCard 
              title="Total Carbs" 
              :current="totalCarbs" 
              :target="dailyGoals.carbs" 
              unit="g" 
              color="#FBBC05"
              icon="carbs"
            />
            <NutritionCard 
              title="Total Fat" 
              :current="totalFat" 
              :target="dailyGoals.fat" 
              unit="g" 
              color="#EA4335"
              icon="fat"
            />
          </div>
        </div>

        <div class="detailed-analytics">
          <div class="meal-breakdown-section">
            <MealTypeBreakdown 
              :mealTypeBreakdown="mealTypeBreakdown"
              :totalCalories="totalCalories"
            />
          </div>
          
          <div class="trend-section">
            <h2>Nutritional Trends</h2>
            <div class="chart-card">
              <h3>Weekly Overview</h3>
              <div class="chart-placeholder">
                <p>Weekly nutrition trends coming soon</p>
                <button class="cta-button">View Full History</button>
              </div>
            </div>
          </div>
        </div>

        <div class="recent-performance">
          <h2>Recent Performance</h2>
          <div class="performance-summary">
            <div class="performance-card">
              <h3>7-Day Average</h3>
              <div class="performance-details">
                <div class="performance-stat">
                  <span class="stat-label">Calories</span>
                  <span class="stat-value">{{ averageDailyCalories.toFixed(0) }} cal</span>
                  <span class="stat-percent" :class="getPercentClass(averageDailyCalories, dailyGoals.calories)">
                    {{ calculatePercentage(averageDailyCalories, dailyGoals.calories) }}%
                  </span>
                </div>
                <div class="performance-stat">
                  <span class="stat-label">Protein</span>
                  <span class="stat-value">{{ averageDailyProtein.toFixed(1) }}g</span>
                  <span class="stat-percent" :class="getPercentClass(averageDailyProtein, dailyGoals.protein)">
                    {{ calculatePercentage(averageDailyProtein, dailyGoals.protein) }}%
                  </span>
                </div>
                <div class="performance-stat">
                  <span class="stat-label">Goal Consistency</span>
                  <span class="stat-value">{{ goalComplianceRate.toFixed(0) }}%</span>
                </div>
              </div>
            </div>
            <div class="performance-card">
              <h3>Recommendations</h3>
              <div class="recommendations">
                <div v-if="mealTypeBreakdown.breakfast && mealTypeBreakdown.breakfast.count === 0" class="recommendation-item">
                  <span class="recommendation-icon">🍳</span>
                  <span class="recommendation-text">Try adding breakfast to your daily routine</span>
                </div>
                <div v-if="totalProtein < dailyGoals.protein * 0.8" class="recommendation-item">
                  <span class="recommendation-icon">💪</span>
                  <span class="recommendation-text">Increase protein intake to reach your goals</span>
                </div>
                <div v-if="totalCalories < dailyGoals.calories * 0.7" class="recommendation-item">
                  <span class="recommendation-icon">🔥</span>
                  <span class="recommendation-text">You're significantly under your calorie goal today</span>
                </div>
                <div v-if="Object.values(mealTypeBreakdown).every(m => m.count === 0)" class="recommendation-item">
                  <span class="recommendation-icon">📝</span>
                  <span class="recommendation-text">Start tracking meals to see insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase'

import Sidebar from '@/components/Sidebar.vue'
import DateSelector from '@/components/DateSelector.vue'
import NutritionCard from '@/components/NutritionCard.vue'
import MealTypeBreakdown from '@/components/MealTypeBreakdown.vue'

const selectedDate = ref(new Date())
const meals = ref([])

// Nutritional goal defaults
const dailyGoals = ref({
  calories: 2000,
  protein: 100,
  carbs: 250,
  fat: 70
})

// Computed nutritional totals
const totalCalories = computed(() => 
  meals.value.reduce((sum, meal) => sum + (meal.calories || 0), 0)
)

const totalProtein = computed(() => 
  meals.value.reduce((sum, meal) => sum + (meal.protein || 0), 0)
)

const totalCarbs = computed(() => 
  meals.value.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
)

const totalFat = computed(() => 
  meals.value.reduce((sum, meal) => sum + (meal.fat || 0), 0)
)

// Meal type breakdown with expanded data
const mealTypeBreakdown = computed(() => {
  const breakdown = {
    breakfast: { count: 0, calories: 0, protein: 0 },
    lunch: { count: 0, calories: 0, protein: 0 },
    dinner: { count: 0, calories: 0, protein: 0 },
    snack: { count: 0, calories: 0, protein: 0 },
    dessert: { count: 0, calories: 0, protein: 0 }
  }

  meals.value.forEach(meal => {
    const type = meal.mealType?.toLowerCase() || 'unknown'
    if (breakdown[type]) {
      breakdown[type].count++
      breakdown[type].calories += meal.calories || 0
      breakdown[type].protein += meal.protein || 0
    }
  })

  return breakdown
})

// Performance metrics
const averageDailyCalories = computed(() => 
  meals.value.length 
    ? totalCalories.value / meals.value.length 
    : 0
)

const averageDailyProtein = computed(() => 
  meals.value.length 
    ? totalProtein.value / meals.value.length 
    : 0
)

const daysOnTarget = computed(() => {
  // Simple goal compliance calculation
  return meals.value.filter(meal => 
    meal.calories <= dailyGoals.value.calories
  ).length
})

const goalComplianceRate = computed(() => {
  return meals.value.length 
    ? (daysOnTarget.value / meals.value.length) * 100 
    : 0
})

// Helper for calculating percentage
const calculatePercentage = (current, target) => {
  if (!target) return 0
  return Math.round((current / target) * 100)
}

// Helper for determining percentage class
const getPercentClass = (current, target) => {
  const percent = calculatePercentage(current, target)
  if (percent >= 90 && percent <= 110) return 'percent-good'
  if (percent < 70 || percent > 130) return 'percent-bad'
  return 'percent-ok'
}

// Date update method
const updateSelectedDate = (newDate) => {
  selectedDate.value = newDate
  fetchMeals()
}

// Fetch meals for the selected date
const fetchMeals = async () => {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) return

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
    meals.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching meals:', error)
  }
}

onMounted(fetchMeals)
</script>

<style scoped>
.analytics-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-light);
}

.analytics-main {
  flex: 1;
  padding: 1.5rem;
  margin-left: 250px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background-color: var(--background-card);
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.nutrition-overview .overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.detailed-analytics {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-light);
}

.cta-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.recent-performance {
  margin-bottom: 2rem;
}

.performance-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.performance-card {
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.performance-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.performance-stat {
  display: flex;
  align-items: center;
}

.stat-label {
  flex: 1;
  color: var(--text-light);
}

.stat-value {
  font-weight: 600;
  margin-right: 1rem;
}

.stat-percent {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.percent-good {
  background-color: rgba(52, 168, 83, 0.1);
  color: #34A853;
}

.percent-ok {
  background-color: rgba(251, 188, 5, 0.1);
  color: #FBBC05;
}

.percent-bad {
  background-color: rgba(234, 67, 53, 0.1);
  color: #EA4335;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
}

.recommendation-icon {
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .detailed-analytics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analytics-main {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 70px; /* Space for bottom navigation */
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 0));
  }

  /* Additional height consideration for browser bottom UI */
  @media (max-height: 650px) {
    .analytics-main {
      padding-bottom: 0;
    }
  }

  .analytics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .detailed-analytics {
    grid-template-columns: 1fr;
  }

  .trend-charts {
    grid-template-columns: 1fr;
  }

  .performance-summary {
    grid-template-columns: 1fr;
  }
  
  .nutrition-overview .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>