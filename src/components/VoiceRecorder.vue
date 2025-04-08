<template>
  <div class="voice-recorder">
    <div class="instruction-toggle" @click="toggleInstructions">
      <span v-if="showInstructions">Hide instructions</span>
      <span v-else>Show instructions</span>
      <Icon :name="showInstructions ? 'chevron-up' : 'chevron-down'" />
    </div>

    <div class="instruction-card" v-if="showInstructions">
      <h3>How to Log Your Meals</h3>
      <p>For best results, try to include:</p>
      <ul class="instruction-list">
        <li><strong>What you ate:</strong> "I had eggs and toast"</li>
        <li><strong>When you ate it:</strong> "for breakfast" / "yesterday" / "this morning"</li>
        <li><strong>Optional amounts:</strong> "2 eggs" / "1 cup of rice"</li>
      </ul>
      <p class="example-heading">Examples:</p>
      <div class="examples">
        <div class="example">"I had chicken and broccoli for dinner"</div>
        <div class="example">"Yesterday morning I ate oatmeal for breakfast"</div>
        <div class="example">"2 slices of pizza for lunch today"</div>
      </div>
    </div>

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
    
    <!-- Meal type selection if needed -->
    <div v-if="mealData && mealData.needsMealTypeSelection" class="meal-type-selection">
      <p>Please select a meal type:</p>
      <select v-model="mealData.mealType" class="meal-type-select">
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
        <option value="dessert">Dessert</option>
      </select>
    </div>
    
    <div v-if="mealData && !isProcessing" class="meal-result">
      <div class="meal-result-header">
        <h3>Meal Analysis Results</h3>
      </div>
      <div class="meal-result-content">
        <div class="meal-item">
          <span class="meal-label">Meal Type:</span>
          <span class="meal-value">{{ formatMealType(mealData.mealType) || 'Unknown' }}</span>
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
import { ref, computed, onMounted } from 'vue'
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
const showInstructions = ref(true) // Default to showing instructions

// Format meal type with proper capitalization
const formatMealType = (type) => {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const buttonText = computed(() => {
  if (isRecording.value) return 'Stop Recording'
  if (isProcessing.value) return 'Processing...'
  return 'Speak Meal'
})

function toggleInstructions() {
  showInstructions.value = !showInstructions.value
  localStorage.setItem('showMealInstructions', showInstructions.value.toString())
}

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

function validateMealData(data) {
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  
  // Check if mealType exists and is valid
  if (!data.mealType || !validMealTypes.includes(data.mealType.toLowerCase())) {
    console.warn(`Invalid meal type detected: "${data.mealType}". Prompting user to select.`);
    
    // Set a flag to prompt the user to select a meal type
    data.needsMealTypeSelection = true;
    data.mealType = 'snack'; // Default that can be changed by user
  } else {
    // Ensure meal type is lowercase for consistency
    data.mealType = data.mealType.toLowerCase();
    data.needsMealTypeSelection = false;
  }
  
  return data;
}

async function processMeal(transcript) {
  try {
    isProcessing.value = true
    
    const result = await aiProcessMeal(transcript)
    mealData.value = validateMealData(result)
    
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
    mealText.value = ''
    
    alert('Meal saved successfully!')
  } catch (error) {
    console.error('Error saving meal:', error)
    alert('Error saving meal: ' + error.message)
  }
}

onMounted(() => {
  // Check localStorage for instruction visibility preference
  const savedVisibility = localStorage.getItem('showMealInstructions')
  if (savedVisibility !== null) {
    showInstructions.value = savedVisibility === 'true'
  }
})
</script>

<style scoped>
.voice-recorder {
  width: 100%;
}

.instruction-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-light);
  transition: background-color 0.2s ease;
}

.instruction-toggle:hover {
  background-color: #e0e0e0;
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

.instruction-card {
  background-color: #f8faff;
  border: 1px solid #e0e7ff;
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.instruction-card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.instruction-list {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.instruction-list li {
  margin-bottom: 0.25rem;
}

.example-heading {
  font-weight: 500;
  margin: 0.75rem 0 0.5rem 0;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.example {
  background-color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
  font-style: italic;
}

.meal-type-selection {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #fff8e1;
  border-radius: var(--border-radius);
  border-left: 4px solid #FBBC05;
}

.meal-type-selection p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.meal-type-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .instruction-card {
    padding: 0.75rem;
  }
  
  .instruction-list {
    padding-left: 1rem;
  }
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