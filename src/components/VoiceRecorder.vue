<template>
  <div class="voice-recorder">
    <button 
      @click="startRecording" 
      :class="['record-btn', { 'recording': isRecording }]"
      :disabled="isProcessing"
    >
      <MicIcon />
      <span>{{ buttonText }}</span>
    </button>
    
    <div v-if="transcription" class="transcription-display">
      "{{ transcription }}"
      <div class="processing-indicator" v-if="isProcessing">
        <div class="spinner"></div>
        <span>Analyzing...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MicIcon from './icons/MicIcon.vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['meal-recorded'])

const isRecording = ref(false)
const isProcessing = ref(false)
const transcription = ref('')

const buttonText = computed(() => {
  if (isRecording.value) return 'Recording...'
  if (isProcessing.value) return 'Processing...'
  return 'Record Meal'
})

const startRecording = async () => {
  if (props.disabled || isProcessing.value) return
  
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isRecording.value = true
      transcription.value = ''
    }

    recognition.onend = () => {
      isRecording.value = false
    }

    recognition.onerror = (event) => {
      isRecording.value = false
      console.error('Speech recognition error:', event.error)
    }

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      transcription.value = transcript
      await processMeal(transcript)
    }

    recognition.start()
  } else {
    alert('Speech recognition is not supported in your browser')
  }
}

const processMeal = async (transcript) => {
  try {
    isProcessing.value = true
    
    // Emit event to let parent component handle processing
    emit('meal-recorded', transcript)
    
    // Clear transcription after processing is complete
    setTimeout(() => {
      transcription.value = ''
      isProcessing.value = false
    }, 2000)
  } catch (error) {
    console.error('Error processing meal:', error)
    isProcessing.value = false
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
</style>