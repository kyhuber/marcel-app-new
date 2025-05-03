<template>
  <div class="meal-list">
    <div v-if="meals.length === 0" class="empty-state">
      <p>{{ t('emptyState.noMeals') }}</p>
      <button @click="$emit('log-meal')" class="log-meal-btn">{{ t('dashboard.logMeal') }}</button>
    </div>
    <div 
      v-else
      v-for="meal in meals" 
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
            <span class="nutrient-pill">{{ meal.calories || 0 }} {{ t('nutrition.units.calories') }}</span>
            <span class="nutrient-pill">{{ meal.protein || 0 }}{{ t('nutrition.units.grams') }} {{ t('nutrition.protein') }}</span>
            <span v-if="meal.carbs" class="nutrient-pill">{{ meal.carbs }}{{ t('nutrition.units.grams') }} {{ t('nutrition.carbs') }}</span>
            <span v-if="meal.fat" class="nutrient-pill">{{ meal.fat }}{{ t('nutrition.units.grams') }} {{ t('nutrition.fat') }}</span>
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
      
      <div class="meal-content">
        <div class="food-items-list">
          <div v-for="(item, index) in getFoodItemsArray(meal)" :key="index" class="food-item">
            <span class="food-item-name">{{ item }}</span>
          </div>
        </div>
        
        <div class="original-input">
          <button @click="toggleOriginalInput(meal.id)" class="toggle-input-btn">
            {{ isOriginalInputVisible(meal.id) ? t('common.close') : t('common.show') }}
          </button>
          <div v-if="isOriginalInputVisible(meal.id)" class="input-text">
            "{{ meal.description }}"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/IconsLibrary.vue'

const { t } = useI18n()

const props = defineProps({
  meals: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit-meal', 'delete-meal', 'log-meal'])

const visibleInputs = ref(new Set())

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

const formatMealType = (type) => {
  if (!type) return 'Meal'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const getFoodItemsArray = (meal) => {
  if (!meal.foodItems) return []
  if (Array.isArray(meal.foodItems)) return meal.foodItems
  if (typeof meal.foodItems === 'string') return [meal.foodItems]
  return []
}

const toggleOriginalInput = (mealId) => {
  if (visibleInputs.value.has(mealId)) {
    visibleInputs.value.delete(mealId)
  } else {
    visibleInputs.value.add(mealId)
  }
}

const isOriginalInputVisible = (mealId) => {
  return visibleInputs.value.has(mealId)
}

const confirmDelete = (mealId) => {
  if (confirm(t('common.delete') + '?')) {
    emit('delete-meal', mealId)
  }
}
</script>

<style scoped>
.meal-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #757575;
}

.log-meal-btn {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  margin-top: 0.5rem;
  cursor: pointer;
}

.meal-card {
  background-color: var(--background-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  overflow: hidden;
}

.meal-card:hover {
  transform: translateX(2px);
}

.meal-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
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
  min-width: 0;
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
  color: var(--text-light);
}

.meal-nutrients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nutrient-pill {
  background-color: var(--background-light);
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
  background-color: var(--background-light);
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
  color: var(--text-light);
  background-color: var(--background-light);
  font-size: 0.875rem;
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
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--background-light);
}

.action-btn.edit-btn:hover {
  color: var(--primary-color);
  background-color: rgba(66, 133, 244, 0.1);
}

.action-btn.delete-btn:hover {
  color: #d32f2f;
  background-color: rgba(211, 47, 47, 0.1);
}

@media (max-width: 768px) {
  .meal-header {
    flex-wrap: wrap;
  }
  
  .meal-info {
    width: calc(100% - 50px);
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