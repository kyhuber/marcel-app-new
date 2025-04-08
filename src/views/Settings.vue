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
              <h3>Profile Information</h3>
              <div class="form-group">
                <label for="displayName">Display Name</label>
                <input 
                  type="text" 
                  id="displayName" 
                  v-model="user.displayName" 
                  placeholder="Your name"
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="user.email" 
                  disabled
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
                <div class="option-buttons">
                  <button 
                    @click="settings.weightUnit = 'kg'" 
                    :class="['option-btn', settings.weightUnit === 'kg' ? 'active' : '']"
                  >
                    Kilograms (kg)
                  </button>
                  <button 
                    @click="settings.weightUnit = 'lb'" 
                    :class="['option-btn', settings.weightUnit === 'lb' ? 'active' : '']"
                  >
                    Pounds (lb)
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Volume Units</label>
                <div class="option-buttons">
                  <button 
                    @click="settings.volumeUnit = 'ml'" 
                    :class="['option-btn', settings.volumeUnit === 'ml' ? 'active' : '']"
                  >
                    Milliliters (ml)
                  </button>
                  <button 
                    @click="settings.volumeUnit = 'oz'" 
                    :class="['option-btn', settings.volumeUnit === 'oz' ? 'active' : '']"
                  >
                    Fluid Ounces (oz)
                  </button>
                </div>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>App Preferences</h3>
              <div class="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="darkMode" 
                  v-model="settings.darkMode" 
                />
                <label for="darkMode">Dark Mode (Coming Soon)</label>
              </div>
              
              <div class="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="autoSave" 
                  v-model="settings.autoSave" 
                />
                <label for="autoSave">Auto-save voice recordings</label>
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
  import { ref, onMounted } from 'vue'
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
    loadUserData()
    loadSettings()
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
    background-color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .settings-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .settings-card {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
    border: 1px solid #e0e0e0;
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
  
  .option-buttons {
    display: flex;
    gap: 0.75rem;
  }
  
  .option-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: var(--border-radius);
    background-color: white;
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
    background-color: #e0e0e0;
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
}
  </style>