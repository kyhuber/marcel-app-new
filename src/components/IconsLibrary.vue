<template>
    <svg 
      v-if="name === 'calories'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M12 2L4 7l1 2 7-5 7 5 1-2-8-5z"></path>
      <path d="M4 7v10c0 3 2 5 8 5s8-2 8-5V7"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="12" y1="16" x2="12" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
    
    <svg 
      v-else-if="name === 'protein'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M18 7c0-5.333-8-5.333-8 0"></path>
      <path d="M10 7v10a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V7"></path>
      <path d="M6 7v10a3 3 0 0 0 3 3h0"></path>
    </svg>
    
    <svg 
      v-else-if="name === 'carbs'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M17 12a5 5 0 0 0-5-5c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.13 0 2.16-.39 3-1.02"></path>
      <path d="M3 12h6"></path>
      <path d="M21 12h-4"></path>
    </svg>
    
    <svg 
      v-else-if="name === 'fat'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M14 12a4 4 0 0 0-8 0 8 8 0 0 0 8 8h0a8 8 0 0 0 8-8 4 4 0 0 0-4-4h-4z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
    
    <svg 
      v-else-if="name === 'mic'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
    
    <svg 
      v-else-if="name === 'logout'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
    
    <svg 
      v-else-if="name === 'edit'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
    
    <svg 
      v-else-if="name === 'delete'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M3 6h18"></path>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
    
    <svg 
      v-else-if="name === 'dashboard'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
    
    <svg 
      v-else-if="name === 'meals'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
    
    <svg 
      v-else-if="name === 'analytics'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
    
    <svg 
      v-else-if="name === 'goals'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
    
    <svg 
      v-else-if="name === 'settings'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
    
    <svg 
      v-else-if="name === 'calendar'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
    
    

    <svg 
      v-else-if="name === 'chevron-left'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    
    <svg 
      v-else-if="name === 'chevron-right'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
    
    <svg 
      v-else-if="name === 'chevron-down'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
    
    <svg 
      v-else-if="name === 'search'" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    
    <!-- Default / Fallback Icon -->
    <svg 
      v-else
      xmlns="http://www.w3.org/2000/svg" 
      :width="size" 
      :height="size" 
      viewBox="0 0 24 24" 
      :fill="fill" 
      :stroke="color" 
      :stroke-width="strokeWidth" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  </template>
  
  <script setup>
  defineProps({
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    fill: {
      type: String,
      default: 'none'
    },
    strokeWidth: {
      type: [Number, String],
      default: 2
    }
  })
  </script>