<template>
    <div class="empty-state" :class="{ 'first-time': isFirstTimeUser }">
      <div class="empty-state-content">
        <!-- First time user experience -->
        <div v-if="isFirstTimeUser" class="welcome-container">
          <div class="welcome-icon">
            <Icon name="meals" size="48" color="#4285F4" />
          </div>
          <h2>Welcome to Marcel!</h2>
          <p>Let's start tracking your nutrition to help you reach your fitness goals.</p>
          
          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Log your meals</h3>
                <p>Use voice or text to record what you eat</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Track nutrients</h3>
                <p>Monitor your calories and protein intake</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Reach your goals</h3>
                <p>Stay consistent with your nutrition plan</p>
              </div>
            </div>
          </div>
          
          <button @click="scrollToMealInput" class="cta-button pulse-animation">
             Log Your First Meal
            <Icon name="chevron-down" />
          </button>
        </div>
        
        <!-- Empty day state -->
        <div v-else class="empty-day-container">
          <div class="empty-day-icon">
            <Icon name="calories" size="40" color="#FBBC05" />
          </div>
          <h2>No meals logged today</h2>
          <p>Track your nutrition to see your progress toward daily goals.</p>
          <div class="nutrition-goals-preview">
            <div class="goal-item">
              <span class="goal-label">Calories Goal:</span>
              <span class="goal-value">{{ dailyGoals.calories }}cal</span>
            </div>
            <div class="goal-item">
              <span class="goal-label">Protein Goal:</span>
              <span class="goal-value">{{ dailyGoals.protein }}g</span>
            </div>
          </div>
          <button @click="scrollToMealInput" class="cta-button">
            Log Your First Meal Today
            <Icon name="mic" />
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import Icon from '@/components/IconsLibrary.vue'
  
  const props = defineProps({
    isFirstTimeUser: {
      type: Boolean,
      default: false
    },
    dailyGoals: {
      type: Object,
      default: () => ({
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 70
      })
    }
  })
  
  const scrollToMealInput = () => {
    // Find the meal input section and scroll to it
    const mealSection = document.querySelector('.record-meal-section')
    if (mealSection) {
      mealSection.scrollIntoView({ behavior: 'smooth' })
      
      // Add a highlight effect to the voice recorder
      const voiceRecorder = mealSection.querySelector('.voice-recorder')
      if (voiceRecorder) {
        voiceRecorder.classList.add('highlight')
        // Remove highlight after animation completes
        setTimeout(() => {
          voiceRecorder.classList.remove('highlight')
        }, 2000)
      }
    }
  }
  </script>
  
  <style scoped>
  .empty-state {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 1.5rem;
  }
  
  .empty-state.first-time {
    background-color: #f8faff;
    border: 2px dashed #4285F4;
  }
  
  .welcome-icon, .empty-day-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  .welcome-container h2, .empty-day-container h2 {
    font-size: 1.5rem;
    color: var(--text-dark);
    margin-bottom: 0.75rem;
  }
  
  .welcome-container p, .empty-day-container p {
    color: var(--text-light);
    max-width: 500px;
    margin: 0 auto 1.5rem auto;
  }
  
  .steps-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    text-align: left;
    max-width: 250px;
  }
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: #4285F4;
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .step-content h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
  
  .step-content p {
    margin: 0;
    font-size: 0.9rem;
  }
  
  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;
  }
  
  .cta-button:hover {
    background-color: #3b77db;
    transform: translateY(-2px);
  }
  
  .nutrition-goals-preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .goal-item {
    background-color: #f5f5f5;
    padding: 0.5rem 1rem;
    border-radius: 20px;
  }
  
  .goal-label {
    font-weight: 500;
    margin-right: 0.5rem;
  }
  
  .goal-value {
    color: var(--primary-color);
    font-weight: 600;
  }
  
  .pulse-animation {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
    }
  }
  
  /* Add a highlight animation for the voice recorder */
  :global(.voice-recorder.highlight) {
    animation: highlight-pulse 1s ease-in-out;
  }
  
  @keyframes highlight-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.2);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(66, 133, 244, 0.4);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
    }
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .empty-state {
      padding: 1.5rem 1rem;
    }
    
    .steps-container {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .step {
      max-width: 100%;
    }
  }
  </style>