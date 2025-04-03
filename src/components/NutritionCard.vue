<template>
    <div class="nutrition-card">
      <div class="card-icon" :style="{ backgroundColor: iconBgColor }">
        <component :is="iconComponent" />
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3>{{ title }}</h3>
          <span class="card-target">Goal: {{ target }}{{ unit }}</span>
        </div>
        <div class="card-progress">
          <div class="progress-info">
            <span class="current-value">{{ current }}{{ unit }}</span>
            <span class="percentage">{{ percentComplete }}%</span>
          </div>
          <div class="progress-bar-container">
            <div 
              class="progress-bar" 
              :style="{ 
                width: `${percentComplete}%`, 
                backgroundColor: color 
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
import Icon from '@/components/IconsLibrary.vue'
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: 'g'
    },
    color: {
      type: String,
      default: '#4285F4'
    },
    icon: {
      type: String,
      default: 'calories'
    }
  })
  
  const percentComplete = computed(() => {
    const percent = Math.floor((props.current / props.target) * 100)
    return Math.min(percent, 100)
  })
  
  const iconComponent = computed(() => {
    switch(props.icon.toLowerCase()) {
      case 'protein':
        return ProteinIcon
      case 'carbs':
        return CarbsIcon
      case 'fat':
        return FatIcon
      case 'calories':
      default:
        return CaloriesIcon
    }
  })
  
  const iconBgColor = computed(() => {
    return `${props.color}20` // 20% opacity version of the color
  })
  </script>
  
  <style scoped>
  .nutrition-card {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .nutrition-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .card-header h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-dark);
  }
  
  .card-target {
    font-size: 0.8rem;
    color: #757575;
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .current-value {
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  .percentage {
    background-color: #f0f2f5;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .progress-bar-container {
    height: 8px;
    background-color: #f0f2f5;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    transition: width 0.3s ease;
  }
  </style>