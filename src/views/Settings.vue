<!-- Settings.vue with Comprehensive Dark Mode Support -->
<template>
  <div class="settings-container">
    <Sidebar />
    
    <main class="settings-main">
      <header class="page-header">
        <h1>Settings</h1>
      </header>
      
      <section class="settings-content">
        <div class="settings-card">
          <h2>Account Settings</h2>
          
          <div class="settings-section">
            <h3>App Preferences</h3>
            <div class="form-group dark-mode-toggle">
              <label for="darkMode">Dark Mode</label>
              <div class="toggle-switch">
                <input 
                  type="checkbox" 
                  id="darkMode" 
                  v-model="settings.darkMode" 
                  @change="toggleDarkMode"
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
              </div>
            </div>
            
            <div class="form-group email-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="user.email" 
                disabled
                class="settings-input"
              />
            </div>
            
            <button @click="updateProfile" class="action-btn primary-btn">Update Profile</button>
          </div>
        </div>
        
        <div class="settings-card">
          <h2>App Settings</h2>
          
          <div class="settings-section">
            <h3>Units</h3>
            <div class="form-group">
              <label>Weight Units</label>
              <div class="unit-selector">
                <button 
                  @click="settings.weightUnit = 'kg'" 
                  :class="['unit-btn', settings.weightUnit === 'kg' ? 'active' : '']"
                >
                  Kilograms (kg)
                </button>
                <button 
                  @click="settings.weightUnit = 'lb'" 
                  :class="['unit-btn', settings.weightUnit === 'lb' ? 'active' : '']"
                >
                  Pounds (lb)
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>Volume Units</label>
              <div class="unit-selector">
                <button 
                  @click="settings.volumeUnit = 'ml'" 
                  :class="['unit-btn', settings.volumeUnit === 'ml' ? 'active' : '']"
                >
                  Milliliters (ml)
                </button>
                <button 
                  @click="settings.volumeUnit = 'oz'" 
                  :class="['unit-btn', settings.volumeUnit === 'oz' ? 'active' : '']"
                >
                  Fluid Ounces (oz)
                </button>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>App Preferences</h3>
            <div class="form-group dark-mode-toggle">
              <label for="autoSave">Auto-save voice recordings</label>
              <div class="toggle-switch">
                <input 
                  type="checkbox" 
                  id="autoSave" 
                  v-model="settings.autoSave" 
                  class="toggle-input"
                />
                <span class="toggle-slider"></span>
              </div>
            </div>
          </div>
          
          <button @click="saveSettings" class="action-btn primary-btn">Save Settings</button>
        </div>
        
        <div class="settings-card">
          <h2>Data Management</h2>
          
          <div class="settings-section">
            <h3>Export Data</h3>
            <p>Download all your meal data as a CSV file.</p>
            <button @click="exportData" class="action-btn secondary-btn">Export Data</button>
          </div>
          
          <div class="settings-section danger-zone">
            <h3>Danger Zone</h3>
            <p>Clear all your data from the app. This action cannot be undone.</p>
            <button @click="confirmClearData" class="action-btn danger-btn">Clear All Data</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { 
    getAuth, 
    updateProfile as firebaseUpdateProfile 
  } from 'firebase/auth'
  import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    deleteDoc 
  } from 'firebase/firestore'
  import { db } from '@/firebase'
  import Sidebar from '@/components/Sidebar.vue'
  
  const user = ref({
    displayName: '',
    email: ''
  })
  
  const settings = ref({
    weightUnit: 'kg',
    volumeUnit: 'ml',
    darkMode: false,
    autoSave: true
  })

  const toggleDarkMode = () => {
    const isDark = settings.value.darkMode
    document.documentElement.classList.toggle('dark-theme', isDark)
    localStorage.setItem('darkMode', isDark ? 'true' : 'false')
  }
  
  // Load user data and settings
  const loadUserData = () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (currentUser) {
      user.value.displayName = currentUser.displayName || ''
      user.value.email = currentUser.email || ''
    }
  }
  
  const loadSettings = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) return
    
    try {
      const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid))
      
      if (settingsDoc.exists()) {
        settings.value = {
          ...settings.value,
          ...settingsDoc.data()
        }
      }
      document.documentElement.classList.toggle('dark-theme', settings.value.darkMode)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }
  
  // Update profile information
  const updateProfile = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) return
    
    try {
      await firebaseUpdateProfile(currentUser, {
        displayName: user.value.displayName
      })
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    }
  }
  

  // Save app settings
  const saveSettings = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) return
    
    try {
      await setDoc(doc(db, 'userSettings', currentUser.uid), settings.value)
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    }
  }
  
  // Export user data
  const exportData = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) return
    
    try {
      const mealsQuery = query(
        collection(db, 'meals'),
        where('userId', '==', currentUser.uid)
      )
      
      const querySnapshot = await getDocs(mealsQuery)
      const mealsData = []
      
      querySnapshot.forEach(doc => {
        const meal = doc.data()
        mealsData.push({
          id: doc.id,
          description: meal.description || '',
          mealType: meal.mealType || '',
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          timestamp: meal.timestamp ? new Date(meal.timestamp.seconds * 1000).toISOString() : '',
          foodItems: meal.foodItems ? meal.foodItems.join(', ') : ''
        })
      })
      
      // Convert to CSV
      let csvContent = "data:text/csv;charset=utf-8,"
      
      // Add headers
      csvContent += "ID,Description,Meal Type,Calories,Protein,Carbs,Fat,Timestamp,Food Items\n"
      
      // Add data rows
      mealsData.forEach(meal => {
        csvContent += `${meal.id},${meal.description},${meal.mealType},${meal.calories},${meal.protein},${meal.carbs},${meal.fat},${meal.timestamp},${meal.foodItems}\n`
      })
      
      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "marcel_meal_data.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error exporting data. Please try again.')
    }
  }
  
  // Clear all user data
  const confirmClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      clearAllData()
    }
  }
  
  const clearAllData = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    
    if (!currentUser) return
    
    try {
      // Get all user's meals
      const mealsQuery = query(
        collection(db, 'meals'),
        where('userId', '==', currentUser.uid)
      )
      
      const querySnapshot = await getDocs(mealsQuery)
      
      // Delete each meal document
      const deletePromises = []
      querySnapshot.forEach(mealDoc => {
        deletePromises.push(deleteDoc(doc(db, 'meals', mealDoc.id)))
      })
      
      await Promise.all(deletePromises)
      
      alert('All data has been cleared successfully.')
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Error clearing data. Please try again.')
    }
  }
  
  onMounted(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    settings.value.darkMode = savedDarkMode === 'true'
    toggleDarkMode()
  }
    loadUserData()
    loadSettings()
  })

  watch(() => settings.value.darkMode, (isDark) => {
  document.documentElement.classList.toggle('dark-theme', isDark)
  localStorage.setItem('darkMode', isDark ? 'true' : 'false')
})
  </script>
  
  <style scoped>
  .settings-container {
    display: flex;
    min-height: 100vh;
    background-color: var(--background-light);
  }
  
  .settings-main {
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
  
  .settings-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .settings-card {
    background-color: var(--background-card);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: var(--card-shadow);
  }
  
  .settings-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .settings-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input[type="text"],
  .form-group input[type="email"] {
    width: 100%;
    padding: 0.75rem;
    border: var(--border-color);
    border-radius: var(--border-radius);
  }
  
  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .checkbox-group input {
    margin: 0;
  }

  /* Dark Mode Specific Variables */
:root {
  --toggle-bg-light: #e0e0e0;
  --toggle-bg-dark: #444;
  --toggle-slider-light: #ffffff;
  --toggle-slider-dark: #f0f0f0;
  --input-bg-light: #f0f2f5;
  --input-bg-dark: #2c2c2c;
  --input-text-light: #333;
  --input-text-dark: #e0e0e0;
  --input-border-light: #e0e0e0;
  --input-border-dark: #444;
}

/* Dark Theme Global Adjustments */
.dark-theme .settings-container {
  background-color: var(--background-light);
}

.dark-theme .settings-card {
  background-color: var(--background-card);
  color: var(--text-dark);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark-theme .page-header {
  background-color: var(--background-card);
  color: var(--text-dark);
}

/* Toggle Switch Styling */
.dark-mode-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-bg-light);
  transition: .4s;
  border-radius: 26px;
}

.dark-theme .toggle-slider {
  background-color: var(--toggle-bg-dark);
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: var(--toggle-slider-light);
  transition: .4s;
  border-radius: 50%;
}

.dark-theme .toggle-slider::before {
  background-color: var(--toggle-slider-dark);
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

/* Input Styling */
.dark-theme .settings-input {
  background-color: var(--input-bg-dark);
  color: var(--input-text-dark);
  border-color: var(--input-border-dark);
}

.dark-theme .settings-input:disabled {
  opacity: 0.6;
  background-color: #3a3a3a;
}

/* Unit Selector Styling */
.unit-selector {
  display: flex;
  gap: 0.5rem;
}

.unit-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: var(--input-bg-light);
  color: var(--input-text-light);
  border: 1px solid var(--input-border-light);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.dark-theme .unit-btn {
  background-color: var(--input-bg-dark);
  color: var(--input-text-dark);
  border-color: var(--input-border-dark);
}

.unit-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Danger Zone Styling */
.danger-zone {
  border: 1px dashed #d32f2f;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-top: 1rem;
}

.dark-theme .danger-zone {
  border-color: rgba(234, 67, 53, 0.5);
}

.danger-btn {
  background-color: #d32f2f;
  color: white;
}

.dark-theme .danger-btn {
  background-color: #b71c1c;
}

.dark-theme .primary-btn {
  background-color: var(--primary-color);
  color: white;
}

.dark-theme .secondary-btn {
  background-color: #3a3a3a;
  color: var(--text-dark);
}
  
  .option-buttons {
    display: flex;
    gap: 0.75rem;
  }
  
  .option-btn {
    padding: 0.5rem 1rem;
    border: var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-card);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .option-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  .action-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .primary-btn {
    background-color: var(--primary-color);
    color: white;
  }
  
  .primary-btn:hover {
    background-color: #3b77db;
  }
  
  .secondary-btn {
    background-color: #f5f5f5;
    color: var(--text-dark);
  }
  
  .secondary-btn:hover {
    background-color: var(--background-card)
  }
  
  .danger-zone {
    border: 1px dashed #d32f2f;
    padding: 1rem;
    border-radius: var(--border-radius);
    margin-top: 1rem;
  }
  
  .danger-btn {
    background-color: #d32f2f;
    color: white;
  }
  
  .danger-btn:hover {
    background-color: #b71c1c;
  }

  .form-group.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-group input[type="checkbox"] {
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"]::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: var(--text-light);
  border-radius: 50%;
  top: 1px;
  left: 2px;
  transition: all 0.3s ease;
}

.checkbox-group input[type="checkbox"]:checked {
  background-color: var(--primary-color);
}

.checkbox-group input[type="checkbox"]:checked::before {
  transform: translateX(18px);
  background-color: var(--background-card);
}
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
  .settings-main {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 70px; /* Space for bottom navigation */
  }

  @media (max-width: 768px) {
  .unit-selector {
    flex-direction: column;
  }
  
  .unit-btn {
    width: 100%;
  }
}
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .option-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .option-btn {
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .danger-zone {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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