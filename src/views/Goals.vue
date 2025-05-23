<template>
    <div class="goals-container">
      <Sidebar />
      
      <main class="goals-main">
        <header class="page-header">
          <h1>{{ $t('goals.title') }}</h1>
        </header>
        
        <section class="goals-content">
          <div class="goals-card">
            <h2>{{ $t('goals.dailyTargets') }}</h2>
            <p class="goals-description">{{ $t('goals.targetsDescription') }}</p>
            
            <div class="goals-form">
              <div class="form-group">
                <label for="calories">{{ $t('goals.dailyCalories') }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="calories" 
                    v-model="goals.calories" 
                    @change="saveGoals"
                  />
                  <span class="unit">{{ $t('nutrition.units.calories') }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="protein">{{ $t('goals.dailyProtein') }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="protein" 
                    v-model="goals.protein" 
                    @change="saveGoals"
                  />
                  <span class="unit">{{ $t('nutrition.units.grams') }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="carbs">{{ $t('goals.dailyCarbs') }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="carbs" 
                    v-model="goals.carbs" 
                    @change="saveGoals"
                  />
                  <span class="unit">{{ $t('nutrition.units.grams') }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="fat">{{ $t('goals.dailyFat') }}</label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="fat" 
                    v-model="goals.fat" 
                    @change="saveGoals"
                  />
                  <span class="unit">{{ $t('nutrition.units.grams') }}</span>
                </div>
              </div>
            </div>
            
            <div class="goals-actions">
              <button @click="resetToDefaults" class="reset-btn">{{ $t('goals.resetToDefaults') }}</button>
              <button @click="saveGoals" class="save-btn">{{ $t('common.save') }}</button>
            </div>
          </div>
          
          <div class="goals-card">
            <h2>{{ $t('goals.notifications') }}</h2>
            <p class="goals-description">{{ $t('goals.notificationsDescription') }}</p>
            
            <div class="goals-form">
              <div class="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="enableReminders" 
                  v-model="goals.enableReminders" 
                  @change="saveGoals"
                />
                <label for="enableReminders">{{ $t('goals.enableReminders') }}</label>
              </div>
              
              <div class="form-group" v-if="goals.enableReminders">
                <label for="reminderTime">{{ $t('goals.reminderTime') }}</label>
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
  import { useI18n } from 'vue-i18n'
  import { getAuth } from 'firebase/auth'
  import { doc, getDoc, setDoc } from 'firebase/firestore'
  import { db } from '@/firebase'
  import Sidebar from '@/components/Sidebar.vue'
  
  const { t } = useI18n()
  
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
      console.log('Saving goals for user:', user.uid)
      console.log('Goals data:', {
        calories: goals.value.calories,
        protein: goals.value.protein,
        carbs: goals.value.carbs,
        fat: goals.value.fat
      })

      await setDoc(doc(db, 'userGoals', user.uid), goals.value)
      alert(t('goals.saveSuccess'))
    } catch (error) {
      console.error('Detailed error saving goals:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      })
      alert(t('errors.saveFailed'))
    }
  }
  
  // Reset goals to default values
  const resetToDefaults = () => {
    if (confirm(t('goals.resetConfirm'))) {
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
    background-color: var(--background-card);
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--card-shadow);
  }
  
  .goals-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .goals-card {
    background-color: var(--background-card);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: var(--card-shadow);
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
    border: var(--border-color);
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
    padding-bottom: 70px; /* Space for bottom navigation */
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 0));
  }

  /* Additional height consideration for browser bottom UI */
  @media (max-height: 650px) {
    .goals-main {
      padding-bottom: 0;
    }
  }
  
  .goals-form {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .goals-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .save-btn, .reset-btn {
    width: 100%;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap; /* Allow wrapping on small screens */
    word-break: break-word; /* Break long words if needed */
  }

  .checkbox-group input {
    margin: 0;
    flex-shrink: 0; /* Prevent checkbox from shrinking */
  }

  .checkbox-group label {
    flex: 1; /* Allow label to take available space */
    min-width: 0; /* Prevent overflow */
    word-wrap: break-word; /* Ensure long words break */
  }
}
  </style>