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
        <li><strong>What you ate:</strong> "I had avocado toast and fresh fruit"</li>
        <li><strong>Optional amounts:</strong> "2 slices" / "1 cup of berries"</li>
        <li><strong>When you ate it:</strong> "for breakfast" / "yesterday" / "this morning"</li>
      </ul>
      <p class="example-heading">Examples:</p>
      <div class="examples">
        <div class="example">"I had chicken and cheetos for dinner tonight"</div>
        <div class="example">"Yesterday morning I ate oatmeal for breakfast"</div>
        <div class="example">"2 slices of detroit-style pizza for lunch today"</div>
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
    
    <!-- Confirmation Modal -->
    <div v-if="mealData && !isProcessing" class="meal-confirmation-modal">
      <div class="modal-overlay" @click="resetForm"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirm Your Meal</h3>
          <button @click="resetForm" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <p class="confirmation-question">Does this look correct?</p>
          
          <div class="edit-meal-type">
            <label for="mealType">Meal Type:</label>
            <select id="mealType" v-model="mealData.mealType" class="edit-select">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
          
          <div class="nutrition-summary">
            <div class="nutrition-item">
              <span class="nutrition-label">Calories:</span>
              <input type="number" v-model.number="mealData.calories" class="nutrition-input" min="0" />
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">Protein:</span>
              <input type="number" v-model.number="mealData.protein" class="nutrition-input" min="0" />
              <span class="unit">g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">Carbs:</span>
              <input type="number" v-model.number="mealData.carbs" class="nutrition-input" min="0" />
              <span class="unit">g</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-label">Fat:</span>
              <input type="number" v-model.number="mealData.fat" class="nutrition-input" min="0" />
              <span class="unit">g</span>
            </div>
          </div>
          
          <div class="food-items-editor">
            <label>Food Items:</label>
            <div v-for="(item, index) in mealData.foodItems" :key="index" class="food-item-edit">
              <input type="text" v-model="mealData.foodItems[index]" class="food-item-input" />
              <button @click="removeFood(index)" class="remove-btn">×</button>
            </div>
            <button @click="addFood" class="add-food-btn">+ Add Item</button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="resetForm" class="cancel-btn">Cancel</button>
          <button @click="saveMeal" class="confirm-btn">Confirm & Save</button>
        </div>
      </div>
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
    
    // Ensure meal type is lowercase for consistency
    data.mealType = 'snack'; // Default that can be changed by user
  } else {
    // Ensure meal type is lowercase for consistency
    data.mealType = data.mealType.toLowerCase();
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

function resetForm() {
  transcription.value = ''
  mealData.value = null
  mealText.value = ''
}

function addFood() {
  if (!mealData.value.foodItems) {
    mealData.value.foodItems = []
  }
  mealData.value.foodItems.push('')
}

function removeFood(index) {
  mealData.value.foodItems.splice(index, 1)
}

async function saveMeal() {
  try {
    if (!mealData.value) return
    
    await saveMealEntry(mealData.value)
    emit('meal-saved', mealData.value)
    
    // Reset the state
    resetForm()
    
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
  position: relative;
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
  background-color: var(--background-card)
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
  transition: background-color 0.3s ease;
}

.record-btn:hover:not(:disabled) {
  background-color: #3b77db;
}

.record-btn:disabled {
  background-color: var(--text-light);
  cursor: not-allowed;
}

.record-btn.recording {
  background-color: #d32f2f;
  animation: pulse 1.5s infinite;
}

.instruction-card {
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
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
  background-color: var(--background-card);
  border-left: 3px solid var(--primary-color);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-style: italic;
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
  background-color: var(--border-color);
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
  border: 1px solid var(--border-color);
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
  background-color: var(--background-light);
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

/* Modal Styles */
.meal-confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.3s ease;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  animation: slide-up 0.3s ease;
  z-index: 1001;
}

@keyframes slide-up {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--primary-color);
  color: white;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.confirmation-question {
  text-align: center;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
}

.edit-meal-type {
  margin-bottom: 1.5rem;
}

.edit-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 1rem;
}

.nutrition-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.nutrition-item {
  display: flex;
  align-items: center;
}

.nutrition-label {
  font-weight: 500;
  margin-right: 0.5rem;
  min-width: 60px;
}

.nutrition-input {
  width: 70px;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.unit {
  margin-left: 0.25rem;
  color: var(--text-light);
}

.food-items-editor {
  margin-top: 1.5rem;
}

.food-item-edit {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.food-item-input {
  flex: 1;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--error-color);
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

.add-food-btn {
  background: none;
  border: 1px dashed var(--border-color);
  width: 100%;
  padding: 0.5rem;
  color: var(--primary-color);
  border-radius: var(--border-radius);
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-food-btn:hover {
  background-color: var(--background-light);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: #f8f9ff;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  background: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}

.confirm-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
}

@media (max-width: 768px) {
  .instruction-card {
    padding: 0.75rem;
  }
  
  .instruction-list {
    padding-left: 1rem;
  }
  
  .nutrition-summary {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    max-height: 80vh;
  }
}
</style>