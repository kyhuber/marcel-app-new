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
            <div class="form-group toggle-group">
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
            </div>
            
            <div class="form-group email-group">
              <label for="email">Email</label>
              <div class="input-with-icon">
                <span class="input-icon">✉️</span>
                <input 
                  type="email" 
                  id="email" 
                  v-model="user.email" 
                  disabled
                  class="settings-input"
                />
              </div>
              <span class="input-note">Your login email cannot be changed</span>
            </div>
          
          <div class="settings-section">
            <h3>Profile Information</h3>
            
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
                  <span class="unit-badge">kg</span>
                  Kilograms
                </button>
                <button 
                  @click="settings.weightUnit = 'lb'" 
                  :class="['unit-btn', settings.weightUnit === 'lb' ? 'active' : '']"
                >
                  <span class="unit-badge">lb</span>
                  Pounds
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
                  <span class="unit-badge">ml</span>
                  Milliliters
                </button>
                <button 
                  @click="settings.volumeUnit = 'oz'" 
                  :class="['unit-btn', settings.volumeUnit === 'oz' ? 'active' : '']"
                >
                  <span class="unit-badge">oz</span>
                  Fluid Ounces
                </button>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>App Preferences</h3>
            <div class="form-group toggle-group">
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

// This watch is critical for the dark mode toggle to work properly
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
}

/* Toggle Switch Styles */
.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
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
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Input Styles */
.settings-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--background-light);
  color: var(--text-dark);
}

.settings-input:disabled {
  background-color: #f2f2f2;
  color: #999;
  border: 1px solid #ddd;
  cursor: not-allowed;
}

.dark-theme .settings-input:disabled {
  background-color: #444;
  color: #aaa;
  border-color: #555;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.input-with-icon .settings-input {
  padding-left: 2rem;
}

.input-note {
  display: block;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}

/* Unit Selector Styles */
.unit-selector {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.unit-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit-btn:hover {
  background-color: #f5f5f5;
}

.unit-btn.active {
  background-color: rgba(66, 133, 244, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.unit-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: #eee;
  color: #333;
  font-size: 0.8rem;
  font-weight: 500;
}

.dark-theme .unit-badge {
  background-color: #555;
  color: #eee;
}

.unit-btn.active .unit-badge {
  background-color: var(--primary-color);
  color: white;
}

/* Button Improvements */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon {
  font-size: 1.1rem;
}

.primary-btn {
  background-color: var(--primary-color);
  color: white;
}

.primary-btn:hover {
  background-color: #3b77db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.2);
}

.secondary-btn {
  background-color: var(--background-light);
  color: var(--text-dark);
  border: 1px solid var(--border-color);
}

.secondary-btn:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.danger-btn {
  background-color: #f8d7da;
  color: #d32f2f;
  border: 1px solid rgba(211, 47, 47, 0.3);
}

.danger-btn:hover {
  background-color: #d32f2f;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.2);
}

.dark-theme .secondary-btn {
  background-color: #3a3a3a;
  border-color: #555;
}

.dark-theme .secondary-btn:hover {
  background-color: #4a4a4a;
}

.dark-theme .danger-btn {
  background-color: rgba(211, 47, 47, 0.2);
  color: #ff6b6b;
  border-color: rgba(211, 47, 47, 0.4);
}

/* Danger Zone Improvements */
.danger-zone {
  border: 1px dashed #d32f2f;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-top: 1rem;
  transition: background-color 0.2s ease;
}

.danger-zone:hover {
  background-color: rgba(211, 47, 47, 0.05);
}

.dark-theme .danger-zone {
  border-color: rgba(234, 67, 53, 0.5);
}

.dark-theme .danger-zone:hover {
  background-color: rgba(211, 47, 47, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .settings-main {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 70px; /* Space for bottom navigation */
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .toggle-group {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .toggle-group label {
    flex: 1;
    min-width: 0;
  }
  
  .unit-selector {
    flex-direction: column;
  }
}
</style>