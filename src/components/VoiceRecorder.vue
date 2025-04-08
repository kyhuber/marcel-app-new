<template>
  <div class="voice-recorder">
    <button 
      @click="toggleRecording" 
      :class="['record-btn', { 'recording': isRecording }]"
      :disabled="isProcessing"
    >
      <Icon name="mic" />
      <span>{{ buttonText }}</span>
    </button>

    <!-- Text Input Option -->
    <div class="text-input-container">
      <p class="or-divider">or</p>
      <div class="text-input-form">
        <input 
          type="text" 
          v-model="mealText" 
          placeholder="Type your meal details..." 
          :disabled="isProcessing || isRecording"
          @keyup.enter="submitText"
        />
        <button 
          @click="submitText" 
          class="submit-btn"
          :disabled="isProcessing || isRecording || !mealText.trim()"
        >
          Submit
        </button>
      </div>
    </div>
    
    <div v-if="transcription" class="transcription-display">
      <p>"{{ transcription }}"</p>
      <div class="processing-indicator" v-if="isProcessing">
        <div class="spinner"></div>
        <span>Analyzing...</span>
      </div>
    </div>
    
    <div v-if="mealData && !isProcessing" class="meal-result">
      <div class="meal-result-header">
        <h3>Meal Analysis Results</h3>
      </div>
      <div class="meal-result-content">
        <div class="meal-item">
          <span class="meal-label">Meal Type:</span>
          <span class="meal-value">{{ mealData.mealType || 'Unknown' }}</span>
        </div>
        <div class="meal-item">
          <span class="meal-label">Calories:</span>
          <span class="meal-value">{{ mealData.calories || 0 }}</span>
        </div>
        <div class="meal-item">
          <span class="meal-label">Protein:</span>
          <span class="meal-value">{{ mealData.protein || 0 }}g</span>
        </div>
        <div class="meal-item">
          <span class="meal-label">Carbs:</span>
          <span class="meal-value">{{ mealData.carbs || 0 }}g</span>
        </div>
        <div class="meal-item">
          <span class="meal-label">Fat:</span>
          <span class="meal-value">{{ mealData.fat || 0 }}g</span>
        </div>
        <div class="meal-foods" v-if="mealData.foodItems && mealData.foodItems.length">
          <h4>Food Items:</h4>
          <ul>
            <li v-for="(item, index) in mealData.foodItems" :key="index">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
      <button @click="saveMeal" class="save-btn">Save Meal</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from '@/components/IconsLibrary.vue'
import { aiProcessMeal } from '@/utils/aiMealProcessor'
import { saveMealEntry } from '@/services/mealService'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['meal-saved'])

const isRecording = ref(false)
const isProcessing = ref(false)
const transcription = ref('')
const recognition = ref(null)
const mealData = ref(null)
const mealText = ref('')

const buttonText = computed(() => {
  if (isRecording.value) return 'Stop Recording'
  if (isProcessing.value) return 'Processing...'
  return 'Speak Meal'
})

function toggleRecording() {
  if (props.disabled) return
  
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function startRecording() {
  if ('webkitSpeechRecognition' in window) {
    recognition.value = new webkitSpeechRecognition()
    recognition.value.continuous = true
    recognition.value.interimResults = true
    recognition.value.lang = 'en-US'
    
    let silenceTimer
    
    recognition.value.onstart = () => {
      isRecording.value = true
      transcription.value = ''
      mealData.value = null
    }

    recognition.value.onresult = (event) => {
      // Clear previous silence timer
      clearTimeout(silenceTimer)
      
      // Collect all results
      const interimTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      
      // Update transcription
      transcription.value = interimTranscript
      
      // Set a short silence timer (2 seconds)
      silenceTimer = setTimeout(() => {
        // Stop recording after a brief pause
        stopRecording()
      }, 2000)
    }

    recognition.value.onerror = (event) => {
      isRecording.value = false
      console.error('Speech recognition error:', event.error)
      alert(`Speech recognition error: ${event.error}`)
    }

    recognition.value.onend = () => {
      if (isRecording.value) {
        // Automatically process if recording was intentionally stopped
        processMeal(transcription.value)
      }
    }

    recognition.value.start()
  } else {
    alert('Speech recognition is not supported in your browser')
  }
}

function stopRecording() {
  if (recognition.value) {
    isRecording.value = false
    recognition.value.stop()
    
    // Immediately process the transcription
    if (transcription.value.trim()) {
      processMeal(transcription.value)
    }
  }
}

async function submitText() {
  if (!mealText.value.trim() || isProcessing.value) return
  
  transcription.value = mealText.value
  await processMeal(mealText.value)
  // Don't clear mealText here to allow for corrections/resubmissions
}

async function processMeal(transcript) {
  try {
    isProcessing.value = true
    
    const result = await aiProcessMeal(transcript)
    mealData.value = result
    
    isProcessing.value = false
  } catch (error) {
    console.error('Error processing meal:', error)
    alert('Error processing meal: ' + error.message)
    isProcessing.value = false
  }
}

async function saveMeal() {
  try {
    if (!mealData.value) return
    
    await saveMealEntry(mealData.value)
    emit('meal-saved', mealData.value)
    
    // Reset the state
    transcription.value = ''
    mealData.value = null
    
    alert('Meal saved successfully!')
  } catch (error) {
    console.error('Error saving meal:', error)
    alert('Error saving meal: ' + error.message)
  }
}
</script>

<style scoped>
.voice-recorder {
  width: 100%;
}

.record-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-btn:hover:not(:disabled) {
  background-color: #3b77db;
}

.record-btn:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

.record-btn.recording {
  background-color: #d32f2f;
  animation: pulse 1.5s infinite;
}

.text-input-container {
  margin-top: 1rem;
}

.or-divider {
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 1rem 0;
  position: relative;
}

.or-divider::before,
.or-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #e0e0e0;
}

.or-divider::before {
  left: 0;
}

.or-divider::after {
  right: 0;
}

.text-input-form {
  display: flex;
  gap: 0.5rem;
}

.text-input-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
}

.text-input-form input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.submit-btn {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #3b77db;
}

.submit-btn:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.transcription-display {
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-radius: var(--border-radius);
  font-style: italic;
  position: relative;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.meal-result {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  border: 1px solid #eaeaea;
}

.meal-result-header {
  margin-bottom: 0.75rem;
}

.meal-result-header h3 {
  font-size: 1.1rem;
  color: var(--primary-color);
  margin: 0;
}

.meal-result-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meal-label {
  font-weight: 500;
  color: var(--text-dark);
}

.meal-value {
  font-weight: 600;
}

.meal-foods {
  margin-top: 0.75rem;
}

.meal-foods h4 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.meal-foods ul {
  margin: 0;
  padding-left: 1.25rem;
}

.save-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background-color: #2d964a;
}
</style>