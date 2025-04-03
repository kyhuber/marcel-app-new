<template>
    <div class="nutrition-dashboard">
      <div class="daily-summary">
        <h2>Today's Nutrition</h2>
        <div class="nutrition-stats">
          <div class="stat">
            <h3>Calories</h3>
            <p>{{ dailyNutrition.calories }} cal</p>
          </div>
          <div class="stat">
            <h3>Protein</h3>
            <p>{{ dailyNutrition.protein }}g</p>
          </div>
        </div>
      </div>
  
      <voice-recorder @meal-recorded="updateNutrition"></voice-recorder>
    </div>
  </template>
  
  <script>
  import VoiceRecorder from './VoiceRecorder.vue'
  import { db, auth } from '@/firebase'
  
  export default {
    components: { VoiceRecorder },
    data() {
      return {
        dailyNutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }
    },
    mounted() {
      this.fetchDailyNutrition()
    },
    methods: {
      async fetchDailyNutrition() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
  
        const snapshot = await db.collection('meals')
          .where('userId', '==', auth.currentUser.uid)
          .where('timestamp', '>=', today)
          .get()
  
        snapshot.forEach(doc => {
          const mealData = doc.data()
          this.dailyNutrition.calories += mealData.calories || 0
          this.dailyNutrition.protein += mealData.protein || 0
          this.dailyNutrition.carbs += mealData.carbs || 0
          this.dailyNutrition.fat += mealData.fat || 0
        })
      },
      updateNutrition(mealNutrition) {
        this.dailyNutrition.calories += mealNutrition.calories
        this.dailyNutrition.protein += mealNutrition.protein
        this.dailyNutrition.carbs += mealNutrition.carbs
        this.dailyNutrition.fat += mealNutrition.fat
      }
    }
  }
  </script>