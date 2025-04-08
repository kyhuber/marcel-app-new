<template>
    <div class="progress-container">
      <div 
        class="progress-bar" 
        :style="{
          width: `${(value / max) * 100}%`, 
          backgroundColor: color
        }"
      ></div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    value: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      default: 100
    },
    color: {
      type: String,
      default: '#4285F4'
    }
  })
  </script>
  
  <style scoped>
  .progress-container {
    height: 10px;
    background-color: var(--background-card)
    border-radius: 5px;
    overflow: hidden;
    margin-top: 8px;
  }
  
  .progress-bar {
    height: 100%;
    transition: width 0.5s ease;
  }
  </style>