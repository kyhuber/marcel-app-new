<template>
    <div class="meal-list">
      <div 
        v-for="meal in meals" 
        :key="meal.id" 
        class="meal-item"
      >
        <div class="meal-details">
          <span class="meal-description">
            {{ meal.description }}
          </span>
          <div class="meal-nutrients">
            <span class="calories">
              {{ meal.calories || 0 }} cal
            </span>
            <span class="protein">
              {{ meal.protein || 0 }}g protein
            </span>
          </div>
        </div>
        <span class="meal-time">
          {{ formatTime(meal.timestamp) }}
        </span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  defineProps({
    meals: {
      type: Array,
      default: () => []
    }
  })
  
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : new Date(timestamp.seconds * 1000)
    
    return date.toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    })
  }
  </script>
  
  <style scoped>
  .meal-list {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .meal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .meal-item:last-child {
    border-bottom: none;
  }
  
  .meal-details {
    flex-grow: 1;
  }
  
  .meal-description {
    font-weight: 500;
  }
  
  .meal-nutrients {
    display: flex;
    gap: 10px;
    color: #666;
    font-size: 0.875rem;
  }
  
  .meal-time {
    color: #888;
    font-size: 0.75rem;
  }
  </style>