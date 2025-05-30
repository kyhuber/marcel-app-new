<template>
  <div class="empty-state" :class="{ 'first-time': isFirstTimeUser }">
    <div class="empty-state-content">
      <!-- First time user experience -->
      <div v-if="isFirstTimeUser" class="welcome-container">
        <div class="welcome-icon">
          <Icon name="meals" size="48" color="#4285F4" />
        </div>
        <h2>{{ $t('emptyState.welcome') }}</h2>
        <p>{{ $t('emptyState.welcomeMessage') }}</p>
        
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>{{ $t('dashboard.logMeal') }}</h3>
              <p>{{ $t('voiceRecorder.voiceOrTextInstructions') }}</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>{{ $t('dashboard.trackNutrition') }}</h3>
              <p>{{ $t('emptyState.trackNutrition') }}</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>{{ $t('settings.goals') }}</h3>
              <p>{{ $t('emptyState.reachGoals') }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty day state -->
      <div v-else class="empty-day-container">
        <div class="empty-day-icon">
          <Icon name="calories" size="40" color="#FBBC05" />
        </div>
        <h2>{{ $t('emptyState.noMeals') }}</h2>
        <p>{{ $t('emptyState.trackNutrition') }}</p>
        <div class="nutrition-goals-preview">
          <div class="goal-item">
            <span class="goal-label">{{ $t('nutrition.calories') }} {{ $t('nutrition.goal') }}:</span>
            <span class="goal-value">{{ dailyGoals.calories }}{{ $t('nutrition.units.calories') }}</span>
          </div>
          <div class="goal-item">
            <span class="goal-label">{{ $t('nutrition.protein') }} {{ $t('nutrition.goal') }}:</span>
            <span class="goal-value">{{ dailyGoals.protein }}{{ $t('nutrition.units.grams') }}</span>
          </div>
        </div>
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
</script>
  
  <style scoped>
  .empty-state {
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}

.empty-state.first-time {
  background-color: rgba(66, 133, 244, 0.05);
  border: 2px dashed var(--primary-color);
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
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--text-dark);
}

.step-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

.nutrition-goals-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.goal-item {
  background-color: var(--background-light);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.goal-label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: var(--text-dark);
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
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb, 66, 133, 244), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb, 66, 133, 244), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb, 66, 133, 244), 0);
  }
}

/* Add a highlight animation for the voice recorder */
:global(.voice-recorder.highlight) {
  animation: highlight-pulse 1s ease-in-out;
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb, 66, 133, 244), 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(var(--primary-color-rgb, 66, 133, 244), 0.4);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb, 66, 133, 244), 0);
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