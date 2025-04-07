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
                Icon name="calories"
              />
              <NutritionCard 
                title="Total Protein" 
                :current="totalProtein" 
                :target="dailyGoals.protein" 
                unit="g" 
                color="#34A853"
                Icon name="protein"
              />
              <NutritionCard 
                title="Total Carbs" 
                :current="totalCarbs" 
                :target="dailyGoals.carbs" 
                unit="g" 
                color="#FBBC05"
                Icon name="carbs"
              />
              <NutritionCard 
                title="Total Fat" 
                :current="totalFat" 
                :target="dailyGoals.fat" 
                unit="g" 
                color="#EA4335"
                Icon name="fat"
              />
            </div>
          </div>
  
          <div class="detailed-analytics">
            <div class="trend-section">
              <h2>Nutritional Trends</h2>
              <div class="trend-charts">
                <div class="chart-card">
                  <h3>Calories Over Time</h3>
                  <!-- Placeholder for chart -->
                  <div class="chart-placeholder">
                    <p>Calorie Trend Chart Coming Soon</p>
                  </div>
                </div>
                <div class="chart-card">
                  <h3>Protein Intake</h3>
                  <!-- Placeholder for chart -->
                  <div class="chart-placeholder">
                    <p>Protein Intake Chart Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="meal-type-breakdown">
              <h2>Meal Type Breakdown</h2>
              <div class="meal-type-stats">
                <div 
                  v-for="(stat, mealType) in mealTypeBreakdown" 
                  :key="mealType" 
                  class="meal-type-item"
                >
                  <span class="meal-type-label">{{ mealType }}</span>
                  <div class="meal-type-details">
                    <span>{{ stat.count }} meals</span>
                    <span>{{ stat.calories }} cal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="recent-performance">
            <h2>Recent Performance</h2>
            <div class="performance-summary">
              <div class="performance-card">
                <h3>Average Daily Intake</h3>
                <div class="performance-details">
                  <p>Calories: {{ averageDailyCalories.toFixed(0) }} cal</p>
                  <p>Protein: {{ averageDailyProtein.toFixed(1) }}g</p>
                </div>
              </div>
              <div class="performance-card">
                <h3>Goal Consistency</h3>
                <div class="performance-details">
                  <p>Days on Target: {{ daysOnTarget }}</p>
                  <p>Compliance Rate: {{ goalComplianceRate.toFixed(1) }}%</p>
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
  
  // Meal type breakdown
  const mealTypeBreakdown = computed(() => {
    const breakdown = {
      breakfast: { count: 0, calories: 0 },
      lunch: { count: 0, calories: 0 },
      dinner: { count: 0, calories: 0 },
      snack: { count: 0, calories: 0 }
    }
  
    meals.value.forEach(meal => {
      const type = meal.mealType?.toLowerCase() || 'unknown'
      if (breakdown[type]) {
        breakdown[type].count++
        breakdown[type].calories += meal.calories || 0
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
    background-color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .nutrition-overview .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .detailed-analytics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .trend-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .chart-card, .performance-card, .meal-type-stats {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .chart-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: var(--text-light);
  }
  
  .meal-type-breakdown .meal-type-stats {
    display: grid;
    gap: 0.75rem;
  }
  
  .meal-type-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .recent-performance {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .performance-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .analytics-main {
      margin-left: 0;
      padding: 1rem;
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
  }
  </style>