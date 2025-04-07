<template>
    <div class="edit-meal-container">
      <Sidebar />
      
      <main class="edit-meal-main">
        <header class="page-header">
          <div class="header-left">
            <button @click="goBack" class="back-btn">
              <Icon name="chevron-left" />
              <span>Back</span>
            </button>
            <h1>Edit Meal</h1>
          </div>
        </header>
        
        <section class="edit-meal-content">
          <div v-if="loading" class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading meal data...</p>
          </div>
          
          <div v-else-if="!mealData" class="error-message">
            <p>Meal not found or error loading meal data.</p>
            <button @click="goBack" class="btn-primary">Go Back</button>
          </div>
          
          <form v-else @submit.prevent="saveMeal" class="meal-form">
            <div class="form-group">
              <label for="description">Meal Description</label>
              <input 
                type="text" 
                id="description" 
                v-model="mealData.description" 
                placeholder="Describe your meal"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="mealType">Meal Type</label>
              <select id="mealType" v-model="mealData.mealType">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group half-width">
                <label for="calories">Calories</label>
                <input 
                  type="number" 
                  id="calories" 
                  v-model.number="mealData.calories"
                  step="0.1" 
                  min="0"
                  required
                />
              </div>
              
              <div class="form-group half-width">
                <label for="protein">Protein (g)</label>
                <input 
                  type="number" 
                  id="protein" 
                  v-model.number="mealData.protein" 
                  min="0"
                  step="0.1"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half-width">
                <label for="carbs">Carbs (g)</label>
                <input 
                  type="number" 
                  id="carbs" 
                  v-model.number="mealData.carbs" 
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div class="form-group half-width">
                <label for="fat">Fat (g)</label>
                <input 
                  type="number" 
                  id="fat" 
                  v-model.number="mealData.fat" 
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="foodItems">Food Items (comma separated)</label>
              <input 
                type="text" 
                id="foodItems" 
                v-model="foodItemsInput" 
                placeholder="e.g. chicken, rice, broccoli"
              />
            </div>

            <div class="form-group">
              <label>Meal Date & Time</label>
              <div class="datetime-inputs">
                <div class="date-picker-wrapper">
                  <DateSelector 
                    :selectedDate="mealDate" 
                    @update:date="updateMealDate"
                  />
                </div>
                <input 
                  type="time" 
                  v-model="mealTime" 
                  class="time-input"
                />
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="goBack" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Save Changes</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { 
    doc, 
    getDoc, 
    updateDoc, 
    Timestamp 
  } from 'firebase/firestore'
  import { db } from '@/firebase'
  import { getAuth } from 'firebase/auth'
  
  import Sidebar from '@/components/Sidebar.vue'
  import Icon from '@/components/IconsLibrary.vue'
  import DateSelector from '@/components/DateSelector.vue'
  
  const route = useRoute()
  const router = useRouter()
  const mealId = route.params.id
  const mealData = ref(null)
  const loading = ref(true)
  const foodItemsInput = ref('')
  const mealDate = ref(new Date())
  const mealTime = ref('12:00')
  
  // Convert foodItems array to comma-separated string and back
  const processFoodItems = () => {
    if (mealData.value && Array.isArray(mealData.value.foodItems)) {
      foodItemsInput.value = mealData.value.foodItems.join(', ')
    }
  }
  
  const parseFoodItems = () => {
    if (mealData.value) {
      mealData.value.foodItems = foodItemsInput.value
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '')
    }
  }

  const getMealTimestamp = () => {
    const date = new Date(mealDate.value)
    const [hours, minutes] = mealTime.value.split(':').map(Number)
    
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const updateMealDate = (date) => {
    mealDate.value = date
  }
  
  // Fetch meal data
  const fetchMeal = async () => {
    const auth = getAuth()
    if (!auth.currentUser) {
      router.push('/')
      return
    }
  
    try {
      const mealDocRef = doc(db, 'meals', mealId)
      const mealSnapshot = await getDoc(mealDocRef)
      
      if (mealSnapshot.exists()) {
        const data = mealSnapshot.data()
        
        // Check if this meal belongs to the current user
        if (data.userId !== auth.currentUser.uid) {
          console.error('Unauthorized access to meal')
          mealData.value = null
          loading.value = false
          return
        }
        
        mealData.value = {
          id: mealSnapshot.id,
          ...data,
          // Add default values for optional fields
          carbs: data.carbs || 0,
          fat: data.fat || 0
        }

        if (mealData.value && mealData.value.timestamp) {
          let timestamp
          
          if (mealData.value.timestamp instanceof Date) {
            timestamp = mealData.value.timestamp
          } else if (mealData.value.timestamp.seconds) {
            // Handle Firestore timestamp object
            timestamp = new Date(mealData.value.timestamp.seconds * 1000)
          } else {
            timestamp = new Date(mealData.value.timestamp)
          }
          
          mealDate.value = timestamp

          const hours = timestamp.getHours().toString().padStart(2, '0')
          const minutes = timestamp.getMinutes().toString().padStart(2, '0')
          mealTime.value = `${hours}:${minutes}`
        }
        
        processFoodItems()
      } else {
        console.error('Meal not found')
        mealData.value = null
      }
    } catch (error) {
      console.error('Error fetching meal:', error)
      mealData.value = null
    } finally {
      loading.value = false
    }
  }
  
  // Save meal changes
  const saveMeal = async () => {
  try {
    parseFoodItems()
    
    const mealDocRef = doc(db, 'meals', mealId)
    
    // Create the updated meal object
    const updatedMeal = {
      ...mealData.value,
      // Set the timestamp first
      timestamp: getMealTimestamp(),
      // Add updated timestamp
      updatedAt: new Date()
    }
    
    // Remove id field before saving to Firestore
    delete updatedMeal.id
    
    await updateDoc(mealDocRef, updatedMeal)
    
    alert('Meal updated successfully!')
    goBack()
  } catch (error) {
    console.error('Error updating meal:', error)
    alert('Error updating meal. Please try again.')
  }
}
  
  const goBack = () => {
    router.back()
  }
  
  onMounted(() => {
    fetchMeal()
  })
  </script>
  
  <style scoped>
  .edit-meal-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--background-light);
  }
  
  .edit-meal-main {
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
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-dark);
    cursor: pointer;
  }
  
  .edit-meal-content {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .meal-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .form-row {
    display: flex;
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .half-width {
    flex: 1;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-primary:hover {
    background-color: #3b77db;
  }
  
  .btn-secondary {
    background-color: transparent;
    border: 1px solid #e0e0e0;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-secondary:hover {
    background-color: #f5f5f5;
  }
  
  .loading-indicator, .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    gap: 1rem;
  }
  
  .spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 3px solid var(--primary-color);
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .datetime-inputs {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .date-picker-wrapper {
    flex: 1;
  }

  .time-input {
    width: 120px;
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: var(--border-radius);
  }

  @media (max-width: 768px) {
    .datetime-inputs {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .time-input {
      width: 100%;
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .edit-meal-main {
      margin-left: 0;
      padding: 1rem;
    }
    
    .form-row {
      flex-direction: column;
      gap: 1.25rem;
    }
  }
  </style>