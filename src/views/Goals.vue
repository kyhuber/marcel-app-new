<template>
    <div class="goals-container">
      <Sidebar />
      
      <main class="goals-main">
        <header class="page-header">
          <h1>Nutrition Goals</h1>
        </header>
        
        <section class="goals-content">
          <div class="goals-card">
            <h2>Daily Nutrition Targets</h2>
            <p class="goals-description">Set your daily nutrition targets to track your progress effectively.</p>
            
            <div class="goals-form">
              <div class="form-group">
                <label for="calories">Daily Calories</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="calories" 
                    v-model="goals.calories" 
                    @change="saveGoals"
                  />
                  <span class="unit">cal</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="protein">Daily Protein</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="protein" 
                    v-model="goals.protein" 
                    @change="saveGoals"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="carbs">Daily Carbohydrates</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="carbs" 
                    v-model="goals.carbs" 
                    @change="saveGoals"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="fat">Daily Fat</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="fat" 
                    v-model="goals.fat" 
                    @change="saveGoals"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
            </div>
            
            <div class="goals-actions">
              <button @click="resetToDefaults" class="reset-btn">Reset to Defaults</button>
              <button @click="saveGoals" class="save-btn">Save Goals</button>
            </div>
          </div>
          
          <div class="goals-card">
            <h2>Weekly Targets</h2>
            <p class="goals-description">Set weekly targets to maintain consistency in your nutrition.</p>
            
            <div class="goals-form">
              <div class="form-group">
                <label for="weeklyProtein">Weekly Protein Target</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="weeklyProtein" 
                    v-model="goals.weeklyProtein" 
                    @change="saveGoals"
                  />
                  <span class="unit">g</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="workoutDays">Workout Days per Week</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="workoutDays" 
                    v-model="goals.workoutDays" 
                    min="0"
                    max="7"
                    @change="saveGoals"
                  />
                  <span class="unit">days</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="goals-card">
            <h2>Notifications</h2>
            <p class="goals-description">Set reminders to help you stay on track with your goals.</p>
            
            <div class="goals-form">
              <div class="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="enableReminders" 
                  v-model="goals.enableReminders" 
                  @change="saveGoals"
                />
                <label for="enableReminders">Enable Daily Reminders</label>
              </div>
              
              <div class="form-group" v-if="goals.enableReminders">
                <label for="reminderTime">Reminder Time</label>
                <input 
                  type="time" 
                  id="reminderTime" 
                  v-model="goals.reminderTime" 
                  @change="saveGoals"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getAuth } from 'firebase/auth'
  import { doc, getDoc, setDoc } from 'firebase/firestore'
  import { db } from '@/firebase'
  import Sidebar from '@/components/Sidebar.vue'
  
  // Default goals
  const defaultGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
    weeklyProtein: 1050,
    workoutDays: 5,
    enableReminders: false,
    reminderTime: '18:00'
  }
  
  const goals = ref({ ...defaultGoals })
  
  // Load user goals from Firestore
  const loadGoals = async () => {
    const auth = getAuth()
    const user = auth.currentUser
  
    if (!user) return
  
    try {
      const goalsDoc = await getDoc(doc(db, 'userGoals', user.uid))
      
      if (goalsDoc.exists()) {
        goals.value = {
          ...defaultGoals,
          ...goalsDoc.data()
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }
  
  // Save goals to Firestore
  const saveGoals = async () => {
    const auth = getAuth()
    const user = auth.currentUser
  
    if (!user) return
  
    try {
      await setDoc(doc(db, 'userGoals', user.uid), goals.value)
      alert('Goals saved successfully!')
    } catch (error) {
      console.error('Error saving goals:', error)
      alert('Error saving goals. Please try again.')
    }
  }
  
  // Reset goals to default values
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all goals to default values?')) {
      goals.value = { ...defaultGoals }
      saveGoals()
    }
  }
  
  onMounted(() => {
    loadGoals()
  })
  </script>
  
  <style scoped>
  .goals-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--background-light);
  }
  
  .goals-main {
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
  
  .goals-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .goals-card {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .goals-description {
    color: var(--text-light);
    margin-bottom: 1.5rem;
  }
  
  .goals-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .checkbox-group {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }
  
  .input-with-unit {
    display: flex;
    align-items: center;
  }
  
  .input-with-unit input {
    flex: 1;
  }
  
  .unit {
    padding: 0 0.75rem;
    color: var(--text-light);
    font-size: 0.9rem;
  }
  
  .goals-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .save-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .save-btn:hover {
    background-color: #3b77db;
  }
  
  .reset-btn {
    background-color: transparent;
    border: 1px solid #e0e0e0;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .reset-btn:hover {
    background-color: #f5f5f5;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .goals-main {
      margin-left: 0;
      padding: 1rem;
    }
    
    .goals-form {
      grid-template-columns: 1fr;
    }
  }
  </style>