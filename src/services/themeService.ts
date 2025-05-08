// src/services/themeService.js
import { ref } from 'vue'

// Create a reactive state for theme
const isDarkTheme = ref(false)

export function useThemeManager() {
  // Initialize theme from localStorage
  const initTheme = () => {
    const savedTheme = localStorage.getItem('darkMode')
    isDarkTheme.value = savedTheme === 'true'
    applyTheme(isDarkTheme.value)
  }
  
  // Apply theme to document
  const applyTheme = (isDark: boolean) => {
    document.documentElement.classList.toggle('dark-theme', isDark)
  }
  
  // Toggle theme
  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value
    applyTheme(isDarkTheme.value)
    localStorage.setItem('darkMode', isDarkTheme.value ? 'true' : 'false')
    return isDarkTheme.value
  }
  
  // Set theme explicitly
  const setTheme = (isDark: boolean) => {
    isDarkTheme.value = isDark
    applyTheme(isDarkTheme.value)
    localStorage.setItem('darkMode', isDarkTheme.value ? 'true' : 'false')
  }
  
  return {
    isDarkTheme,
    initTheme,
    toggleTheme,
    setTheme
  }
}