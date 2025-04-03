<template>
  <div class="voice-recorder">
    <button 
      @click="startRecording" 
      :disabled="isRecording"
      class="record-btn"
    >
      {{ isRecording ? 'Recording...' : 'Record Meal' }}
    </button>
    <p v-if="transcription">{{ transcription }}</p>
  </div>
</template>

<script>
import NutritionService from '@/services/nutritionService'
import { db, auth } from '@/firebase'

export default {
  data() {
    return {
      isRecording: false,
      transcription: '',
      recognition: null
    }
  },
  methods: {
    startRecording() {
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new webkitSpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'

        this.recognition.onstart = () => {
          this.isRecording = true
          this.transcription = ''
        }

        this.recognition.onresult = async (event) => {
          const transcript = event.results[0][0].transcript
          this.transcription = transcript
          await this.processVoiceInput(transcript)
        }

        this.recognition.onend = () => {
          this.isRecording = false
        }

        this.recognition.start()
      } else {
        alert('Speech recognition not supported')
      }
    },
    async processVoiceInput(text) {
      try {
        const nutritionalData = await NutritionService.estimateNutrition(text)
        await this.saveMealEntry(text, nutritionalData)
        this.$emit('meal-recorded', nutritionalData)
      } catch (error) {
        console.error('Voice processing error', error)
      }
    },
    async saveMealEntry(rawText, nutritionalData) {
      if (!auth.currentUser) {
        console.error('User not authenticated')
        return
      }

      await db.collection('meals').add({
        userId: auth.currentUser.uid,
        timestamp: new Date(),
        rawText,
        ...nutritionalData
      })
    }
  }
}
</script>