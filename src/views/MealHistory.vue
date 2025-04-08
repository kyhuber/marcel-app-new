<template>
  <div class="meal-history-container">
    <Sidebar />
    
    <main class="meal-history-main">
      <header class="page-header">
        <h1>Meal History</h1>
        <DateRangePicker 
          :startDate="startDate" 
          :endDate="endDate"
          @update:dateRange="updateDateRange" 
        />
      </header>

      <section class="history-content">
        <div class="filters">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search meals..." 
              @input="handleSearch"
            />
            <Icon name="search" />
          </div>
          
          <div class="filter-options">
            <select v-model="selectedMealType" @change="applyFilters">
              <option value="">All Meal Types</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            
            <select v-model="sortBy" @change="applyFilters">
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="calories-desc">Highest Calories</option>
              <option value="calories-asc">Lowest Calories</option>
              <option value="protein-desc">Highest Protein</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading meals...</p>
        </div>
        
        <div v-else-if="filteredMeals.length === 0" class="empty-state">
          <p>No meals found for the selected period.</p>
          <button @click="goToRecordMeal" class="btn btn-primary">Record a Meal</button>
        </div>
        
        <div v-else>
          <div class="meal-groups">
            <div v-for="(group, date) in groupedMeals" :key="date" class="meal-day-group">
              <div class="date-header">
                <h3>{{ formatDateHeader(date) }}</h3>
                <div class="day-summary">
                  <span class="day-total">{{ getDayTotal(group, 'calories') }} cal</span>
                  <span class="day-total">{{ getDayTotal(group, 'protein') }}g protein</span>
                </div>
              </div>
              
              <!-- Meal cards -->
              <div 
                v-for="meal in group" 
                :key="meal.id" 
                class="meal-card"
              >
                <div class="meal-header">
                  <div class="meal-type-indicator" :style="{ backgroundColor: getMealColor(meal.mealType) }">
                    {{ getMealIcon(meal.mealType) }}
                  </div>
                  <div class="meal-info">
                    <div class="meal-type-time">
                      <h3 class="meal-type">{{ formatMealType(meal.mealType) }}</h3>
                      <span class="meal-time">{{ formatTime(meal.timestamp) }}</span>
                    </div>
                    <div class="meal-nutrients">
                      <span class="nutrient-pill">{{ meal.calories || 0 }} cal</span>
                      <span class="nutrient-pill">{{ meal.protein || 0 }}g protein</span>
                      <span v-if="meal.carbs" class="nutrient-pill">{{ meal.carbs }}g carbs</span>
                      <span v-if="meal.fat" class="nutrient-pill">{{ meal.fat }}g fat</span>
                    </div>
                  </div>
                  <div class="meal-actions">
                    <button @click="editMeal(meal.id)" class="action-btn edit-btn">
                      <Icon name="edit" />
                    </button>
                    <button @click="confirmDelete(meal.id)" class="action-btn delete-btn">
                      <Icon name="delete" />
                    </button>
                  </div>
                </div>
                
                <div class="meal-content">
                  <div class="food-items-list">
                    <div v-for="(item, index) in getFoodItemsArray(meal)" :key="index" class="food-item">
                      <span class="food-item-name">{{ item }}</span>
                    </div>
                  </div>
                  
                  <div class="original-input">
                    <button @click="toggleOriginalInput(meal.id)" class="toggle-input-btn">
                      {{ isOriginalInputVisible(meal.id) ? 'Hide original input' : 'Show original input' }}
                    </button>
                    <div v-if="isOriginalInputVisible(meal.id)" class="input-text">
                      "{{ meal.description }}"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination" v-if="totalPages > 1">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              <Icon name="chevron-left" />
            </button>
            
            <span class="page-indicator">{{ currentPage }} of {{ totalPages }}</span>
            
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc,
  deleteDoc
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase'

import Sidebar from '@/components/Sidebar.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import Icon from '@/components/IconsLibrary.vue'

const router = useRouter()
const meals = ref([])
const filteredMeals = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedMealType = ref('')
const sortBy = ref('date-desc')
const currentPage = ref(1)
const mealsPerPage = 20
const totalPages = ref(1)
const visibleInputs = ref(new Set())

// Date range for filtering
const startDate = ref(new Date())
startDate.value.setDate(startDate.value.getDate() - 7) // Default to last 7 days
startDate.value.setHours(0, 0, 0, 0)

const endDate = ref(new Date())
endDate.value.setHours(23, 59, 59, 999)

// Group meals by date
const groupedMeals = computed(() => {
  const groups = {}
  
  filteredMeals.value.forEach(meal => {
    let date
    if (meal.timestamp instanceof Date) {
      date = meal.timestamp
    } else if (meal.timestamp && meal.timestamp.seconds) {
      date = new Date(meal.timestamp.seconds * 1000)
    } else {
      date = new Date(meal.timestamp)
    }
    
    const dateString = date.toISOString().split('T')[0]
    
    if (!groups[dateString]) {
      groups[dateString] = []
    }
    
    groups[dateString].push(meal)
  })
  
  // Sort meals within each day
  for (const date in groups) {
    groups[date].sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp.seconds * 1000)
      const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp.seconds * 1000)
      return timeB - timeA // Sort by time descending (most recent first)
    })
  }
  
  return groups
})

// Get total calories/protein for a day
const getDayTotal = (dayMeals, nutrient) => {
  return dayMeals.reduce((total, meal) => {
    return total + (meal[nutrient] || 0)
  }, 0)
}

// Format date header
const formatDateHeader = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateString === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  let date
  if (timestamp instanceof Date) {
    date = timestamp
  } else if (timestamp.seconds) {
    // Handle Firestore timestamp
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp)
  }
  
  return date.toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit'
  })
}

const getMealColor = (mealType) => {
  switch(mealType.toLowerCase()) {
    case 'breakfast':
      return '#FBBC05' // Yellow
    case 'lunch':
      return '#34A853' // Green
    case 'dinner':
      return '#4285F4' // Blue
    case 'snack':
      return '#EA4335' // Red
    case 'dessert':
      return '#9C27B0' // Purple
    default:
      return '#9e9e9e' // Gray
  }
}

const getMealIcon = (mealType) => {
  switch(mealType.toLowerCase()) {
    case 'breakfast':
      return '🍳'
    case 'lunch':
      return '🥗'
    case 'dinner':
      return '🍲'
    case 'snack':
      return '🍌'
    case 'dessert':
      return '🍨'
    default:
      return '🍽️'
  }
}

// Toggle original input visibility
const toggleOriginalInput = (mealId) => {
  if (visibleInputs.value.has(mealId)) {
    visibleInputs.value.delete(mealId)
  } else {
    visibleInputs.value.add(mealId)
  }
}

// Check if original input is visible
const isOriginalInputVisible = (mealId) => {
  return visibleInputs.value.has(mealId)
}

// Get food items as array
const getFoodItemsArray = (meal) => {
  if (!meal.foodItems) return []
  if (Array.isArray(meal.foodItems)) return meal.foodItems
  if (typeof meal.foodItems === 'string') return [meal.foodItems]
  return []
}

// Format meal type
const formatMealType = (type) => {
  if (!type) return 'Meal'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Confirm meal deletion
const confirmDelete = (mealId) => {
  if (confirm('Are you sure you want to delete this meal?')) {
    deleteMeal(mealId)
  }
}

// Update date range
const updateDateRange = ({ start, end }) => {
  startDate.value = start
  endDate.value = end
  currentPage.value = 1
  fetchMeals()
}

// Handle search
const handleSearch = () => {
  applyFilters()
}

// Apply filters and sorting
const applyFilters = () => {
  let result = [...meals.value]
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(meal => 
      (meal.description && meal.description.toLowerCase().includes(query)) ||
      (meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.some(item => 
        (typeof item === 'string' && item.toLowerCase().includes(query)) ||
        (typeof item === 'object' && item.name && item.name.toLowerCase().includes(query))
      ))
    )
  }
  
  // Apply meal type filter
  if (selectedMealType.value) {
    result = result.filter(meal => 
      meal.mealType && meal.mealType.toLowerCase() === selectedMealType.value
    )
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let timestampA, timestampB;
    
    if (a.timestamp instanceof Date) {
      timestampA = a.timestamp;
    } else if (a.timestamp && a.timestamp.seconds) {
      timestampA = new Date(a.timestamp.seconds * 1000);
    } else {
      timestampA = new Date(a.timestamp);
    }
    
    if (b.timestamp instanceof Date) {
      timestampB = b.timestamp;
    } else if (b.timestamp && b.timestamp.seconds) {
      timestampB = new Date(b.timestamp.seconds * 1000);
    } else {
      timestampB = new Date(b.timestamp);
    }
    
    switch (sortBy.value) {
      case 'date-asc':
        return timestampA - timestampB;
      case 'calories-desc':
        return (b.calories || 0) - (a.calories || 0);
      case 'calories-asc':
        return (a.calories || 0) - (b.calories || 0);
      case 'protein-desc':
        return (b.protein || 0) - (a.protein || 0);
      case 'date-desc':
      default:
        return timestampB - timestampA;
    }
  })
  
  // Update total pages
  totalPages.value = Math.ceil(result.length / mealsPerPage)
  
  // Paginate
  const startIndex = (currentPage.value - 1) * mealsPerPage
  const endIndex = startIndex + mealsPerPage
  filteredMeals.value = result.slice(startIndex, endIndex)
}

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    applyFilters()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    applyFilters()
  }
}

// Edit meal
const editMeal = (mealId) => {
  router.push(`/meals/edit/${mealId}`)
}

// Delete meal
const deleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'meals', mealId))
    meals.value = meals.value.filter(meal => meal.id !== mealId)
    applyFilters()
  } catch (error) {
    console.error('Error deleting meal:', error)
  }
}

// Fetch meals from Firestore
const fetchMeals = async () => {
  const auth = getAuth()
  const user = auth.currentUser
  
  if (!user) return
  
  loading.value = true
  
  try {
    const mealsQuery = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      where('timestamp', '>=', startDate.value),
      where('timestamp', '<=', endDate.value),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(mealsQuery)
    meals.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    applyFilters()
  } catch (error) {
    console.error('Error fetching meals:', error)
  } finally {
    loading.value = false
  }
}

// Navigation to dashboard to record a meal
const goToRecordMeal = () => {
  router.push('/dashboard')
}

onMounted(() => {
  fetchMeals()
})

// Watch for filter changes
watch([searchQuery, selectedMealType, sortBy], () => {
  currentPage.value = 1
  applyFilters()
})
</script>
  
<style scoped>
.meal-history-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-light);
}

.meal-history-main {
  flex: 1;
  padding: 1.5rem;
  margin-left: 250px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.history-content {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  padding-right: 2.5rem;
}

.search-box svg {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
}

.filter-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-options select {
  min-width: 150px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-light);
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-light);
}

.empty-state button {
  margin-top: 1rem;
}

.meal-day-group {
  margin-bottom: 2rem;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.day-summary {
  display: flex;
  gap: 1rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

/* New meal card styles */
.meal-card {
  background-color: white;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.meal-card:hover {
  transform: translateX(2px);
}

.meal-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.meal-type-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.meal-info {
  flex: 1;
  min-width: 0; /* Prevent flex item from overflowing */
}

.meal-type-time {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.meal-type {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  margin-right: 0.75rem;
}

.meal-time {
  font-size: 0.75rem;
  color: #757575;
}

.meal-nutrients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nutrient-pill {
  background-color: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.meal-content {
  padding: 1rem;
}

.food-items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.food-item {
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.original-input {
  margin-top: 0.5rem;
  border-top: 1px dashed #eee;
  padding-top: 0.5rem;
}

.toggle-input-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-text {
  margin-top: 0.5rem;
  font-style: italic;
  color: #757575;
  font-size: 0.875rem;
  background-color: #f9f9f9;
  padding: 0.75rem;
  border-radius: var(--border-radius);
}

.meal-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.action-btn.edit-btn:hover {
  color: var(--primary-color);
  background-color: rgba(66, 133, 244, 0.1);
}

.action-btn.delete-btn:hover {
  color: #d32f2f;
  background-color: rgba(211, 47, 47, 0.1);
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #f0f2f5;
  color: var(--text-dark);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .meal-history-main {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 70px; /* Space for bottom navigation */
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .search-box {
    width: 100%;
  }
  
  .filter-options {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-options select {
    width: 100%;
  }
  
  .meal-day-group .date-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .pagination {
    margin-bottom: 5rem; /* Ensure content doesn't get hidden behind bottom nav */
  }
  
  /* Mobile adaptations for meal cards */
  .meal-header {
    flex-wrap: wrap;
  }
  
  .meal-info {
    width: calc(100% - 50px); /* Account for meal-type-indicator */
    margin-bottom: 0.5rem;
  }
  
  .meal-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
  
  .meal-nutrients {
    margin-bottom: 0.5rem;
  }
  
  .food-items-list {
    flex-direction: column;
    gap: 0.35rem;
  }
  
  .food-item {
    width: 100%;
  }
}
</style>