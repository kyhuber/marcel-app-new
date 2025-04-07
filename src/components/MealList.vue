<template>
  <div class="meal-list">
    <div v-if="meals.length === 0" class="empty-state">
      <p>No meals recorded yet today</p>
      <button @click="$emit('add-meal')" class="add-meal-btn">Add a meal</button>
    </div>
    <div 
      v-else
      v-for="meal in meals" 
      :key="meal.id" 
      class="meal-item"
    >
      <div class="meal-icon" :style="{ backgroundColor: getMealColor(meal.mealType) }">
        {{ getMealIcon(meal.mealType) }}
      </div>
      <div class="meal-details">
        <div class="meal-header">
          <h3 class="meal-name">{{ meal.description || 'Unnamed meal' }}</h3>
          <span class="meal-time">{{ formatTime(meal.timestamp) }}</span>
        </div>
        <div class="meal-nutrients">
          <span class="calories">
            <Icon name="calories" class="icon-small" /> {{ meal.calories || 0 }} cal
          </span>
          <span class="protein">
            <Icon name="protein" class="icon-small" /> {{ meal.protein || 0 }}g
          </span>
          <span v-if="meal.carbs" class="carbs">
            <Icon name="carbs" class="icon-small" /> {{ meal.carbs }}g
          </span>
          <span v-if="meal.fat" class="fat">
            <Icon name="fat" class="icon-small" /> {{ meal.fat }}g
          </span>
        </div>
        <div v-if="hasFoodItems(meal)" class="food-items">
          {{ formatFoodItems(meal.foodItems) }}
        </div>
      </div>
      <div class="meal-actions">
        <button @click="$emit('edit-meal', meal.id)" class="action-btn edit-btn">
          <Icon name="edit" />
        </button>
        <button @click="confirmDelete(meal.id)" class="action-btn delete-btn">
          <Icon name="delete" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '@/components/IconsLibrary.vue'

const props = defineProps({
  meals: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit-meal', 'delete-meal', 'add-meal'])

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
  if (!mealType) return '#9e9e9e'
  
  switch(mealType.toLowerCase()) {
    case 'breakfast':
      return '#FBBC05'
    case 'lunch':
      return '#34A853'
    case 'dinner':
      return '#4285F4'
    case 'snack':
      return '#EA4335'
    default:
      return '#9e9e9e'
  }
}

const getMealIcon = (mealType) => {
  if (!mealType) return '🍽️'
  
  switch(mealType.toLowerCase()) {
    case 'breakfast':
      return '🍳'
    case 'lunch':
      return '🥗'
    case 'dinner':
      return '🍲'
    case 'snack':
      return '🍌'
    default:
      return '🍽️'
  }
}

// Check if meal has valid food items array
const hasFoodItems = (meal) => {
  return meal.foodItems && Array.isArray(meal.foodItems) && meal.foodItems.length > 0
}

// Safely format food items
const formatFoodItems = (foodItems) => {
  if (!Array.isArray(foodItems)) {
    return typeof foodItems === 'string' ? foodItems : 'Unknown food items'
  }
  
  return foodItems.map(item => {
    // Handle both string items and object items with a name property
    return typeof item === 'object' && item !== null ? (item.name || 'Unknown item') : item
  }).join(', ')
}

const confirmDelete = (mealId) => {
  if (confirm('Are you sure you want to delete this meal?')) {
    emit('delete-meal', mealId)
  }
}
</script>

<style scoped>
.meal-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #757575;
}

.add-meal-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  margin-top: 0.5rem;
  cursor: pointer;
}

.meal-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--border-radius);
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.meal-item:hover {
  transform: translateX(2px);
}

.meal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.25rem;
}

.meal-details {
  flex: 1;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.meal-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.meal-time {
  font-size: 0.75rem;
  color: #757575;
}

.meal-nutrients {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.calories, .protein, .carbs, .fat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #555;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.food-items {
  font-size: 0.8rem;
  color: #757575;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.meal-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  color: var(--primary-color);
  background-color: rgba(66, 133, 244, 0.1);
}

.delete-btn:hover {
  color: #d32f2f;
  background-color: rgba(211, 47, 47, 0.1);
}
</style>