<template>
    <div class="meal-type-breakdown">
      <h2>Meal Type Breakdown</h2>
      <div class="breakdown-content">
        <!-- Visual distribution chart -->
        <div class="distribution-chart">
          <div 
            v-for="(stat, mealType) in mealTypeBreakdown" 
            :key="mealType"
            class="chart-bar"
            :style="{ 
              width: `${getPercentage(stat.calories)}%`,
              backgroundColor: getMealColor(mealType)
            }"
          >
            <span class="meal-icon">{{ getMealIcon(mealType) }}</span>
            <span class="meal-label">{{ formatMealType(mealType) }}</span>
            <span class="meal-percentage">{{ getPercentage(stat.calories) }}%</span>
          </div>
        </div>
        
        <!-- Detailed stats cards -->
        <div class="meal-stats-grid">
          <div 
            v-for="(stat, mealType) in mealTypeBreakdown" 
            :key="mealType" 
            class="meal-stat-card"
            :style="{ borderLeftColor: getMealColor(mealType) }"
          >
            <div class="stat-header">
              <span class="meal-icon">{{ getMealIcon(mealType) }}</span>
              <h3>{{ formatMealType(mealType) }}</h3>
            </div>
            <div class="stat-details">
              <div class="stat-item">
                <span class="stat-label">Meals</span>
                <span class="stat-value">{{ stat.count }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Calories</span>
                <span class="stat-value">{{ stat.calories }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Protein</span>
                <span class="stat-value">{{ stat.protein || 0 }}g</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg. Per Meal</span>
                <span class="stat-value">{{ calculateAverage(stat.calories, stat.count) }} cal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Import required functions
  import { computed } from 'vue'
  
  const props = defineProps({
    mealTypeBreakdown: {
      type: Object,
      required: true
    },
    totalCalories: {
      type: Number,
      default: 0
    }
  })
  
  // Format meal type with proper capitalization
  const formatMealType = (mealType) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1)
  }
  
  // Calculate percentage of total calories
  const getPercentage = (calories) => {
    if (!props.totalCalories) return 0
    return Math.round((calories / props.totalCalories) * 100) || 0
  }
  
  // Calculate average calories per meal
  const calculateAverage = (calories, count) => {
    if (!count) return 0
    return Math.round(calories / count)
  }
  
  // Get color based on meal type
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
  </script>
  
  <style scoped>
  .meal-type-breakdown {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .breakdown-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
  }
  
  .distribution-chart {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .chart-bar {
    display: flex;
    align-items: center;
    min-width: 40px;
    height: 40px;
    padding: 0 1rem;
    border-radius: 20px;
    color: white;
    font-weight: 500;
    transition: width 0.5s ease;
  }
  
  .meal-icon {
    margin-right: 0.5rem;
    font-size: 1.25rem;
  }
  
  .meal-label {
    margin-right: auto;
  }
  
  .meal-percentage {
    font-weight: 600;
  }
  
  .meal-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .meal-stat-card {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: var(--border-radius);
    border-left: 4px solid;
    transition: transform 0.2s ease;
  }
  
  .meal-stat-card:hover {
    transform: translateY(-2px);
  }
  
  .stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .stat-header h3 {
    margin: 0;
    font-size: 1rem;
  }
  
  .stat-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: var(--text-light);
  }
  
  .stat-value {
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .meal-stats-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .stat-details {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .meal-stats-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>