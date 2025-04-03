<template>
    <div class="date-range-picker">
      <button @click="togglePicker" class="range-selector">
        <CalendarIcon />
        <span>{{ displayRange }}</span>
        <ChevronDownIcon />
      </button>
      
      <div v-if="showPicker" class="date-picker-popup">
        <div class="preset-ranges">
          <button 
            v-for="preset in presets" 
            :key="preset.label"
            @click="selectPreset(preset)"
            :class="['preset-btn', { active: isActivePreset(preset) }]"
          >
            {{ preset.label }}
          </button>
        </div>
        
        <div class="custom-range">
          <div class="picker-container">
            <div class="date-input">
              <label>Start Date</label>
              <input 
                type="date" 
                v-model="localStartDate" 
                :max="formatDateForInput(maxDate)"
                @change="updateCustomRange"
              />
            </div>
            
            <div class="date-input">
              <label>End Date</label>
              <input 
                type="date" 
                v-model="localEndDate" 
                :min="localStartDate"
                :max="formatDateForInput(maxDate)"
                @change="updateCustomRange"
              />
            </div>
          </div>
          
          <div class="picker-actions">
            <button @click="applyRange" class="apply-btn">Apply</button>
            <button @click="showPicker = false" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import Icon from '@/components/IconsLibrary.vue'
  
  const props = defineProps({
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  })
  
  const emit = defineEmits(['update:dateRange'])
  
  const showPicker = ref(false)
  const localStartDate = ref(formatDateForInput(props.startDate))
  const localEndDate = ref(formatDateForInput(props.endDate))
  const activePreset = ref('')
  const maxDate = new Date() // Today
  
  // Preset date ranges
  const presets = [
    { 
      label: 'Today',
      getRange: () => {
        const today = new Date()
        const start = new Date(today)
        start.setHours(0, 0, 0, 0)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    { 
      label: 'Yesterday',
      getRange: () => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        const end = new Date(yesterday)
        end.setHours(23, 59, 59, 999)
        return { start: yesterday, end }
      }
    },
    { 
      label: 'This Week',
      getRange: () => {
        const today = new Date()
        const start = new Date(today)
        start.setDate(start.getDate() - start.getDay()) // Start of week (Sunday)
        start.setHours(0, 0, 0, 0)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    { 
      label: 'Last 7 Days',
      getRange: () => {
        const today = new Date()
        const start = new Date(today)
        start.setDate(start.getDate() - 6)
        start.setHours(0, 0, 0, 0)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    { 
      label: 'Last 30 Days',
      getRange: () => {
        const today = new Date()
        const start = new Date(today)
        start.setDate(start.getDate() - 29)
        start.setHours(0, 0, 0, 0)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    },
    { 
      label: 'This Month',
      getRange: () => {
        const today = new Date()
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
    }
  ]
  
  // Format display range
  const displayRange = computed(() => {
    if (activePreset.value) {
      return activePreset.value
    }
    
    const start = new Date(localStartDate.value)
    const end = new Date(localEndDate.value)
    
    return `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`
  })
  
  // Format date for input value
  function formatDateForInput(date) {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }
  
  // Format date for display
  function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Toggle date picker
  function togglePicker() {
    showPicker.value = !showPicker.value
  }
  
  // Select preset range
  function selectPreset(preset) {
    const { start, end } = preset.getRange()
    localStartDate.value = formatDateForInput(start)
    localEndDate.value = formatDateForInput(end)
    activePreset.value = preset.label
  }
  
  // Check if preset is active
  function isActivePreset(preset) {
    return activePreset.value === preset.label
  }
  
  // Update custom range
  function updateCustomRange() {
    activePreset.value = '' // Clear active preset when custom range is selected
  }
  
  // Apply selected range
  function applyRange() {
    const start = new Date(localStartDate.value)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(localEndDate.value)
    end.setHours(23, 59, 59, 999)
    
    emit('update:dateRange', { start, end })
    showPicker.value = false
  }
  
  // Close picker when clicking outside
  const handleClickOutside = (event) => {
    const picker = document.querySelector('.date-range-picker')
    if (picker && !picker.contains(event.target)) {
      showPicker.value = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    
    // Set initial values
    localStartDate.value = formatDateForInput(props.startDate)
    localEndDate.value = formatDateForInput(props.endDate)
    
    // Check if initial dates match any preset
    for (const preset of presets) {
      const { start, end } = preset.getRange()
      if (
        formatDateForInput(start) === formatDateForInput(props.startDate) &&
        formatDateForInput(end) === formatDateForInput(props.endDate)
      ) {
        activePreset.value = preset.label
        break
      }
    }
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  // Watch for prop changes
  watch(() => props.startDate, (newDate) => {
    localStartDate.value = formatDateForInput(newDate)
  })
  
  watch(() => props.endDate, (newDate) => {
    localEndDate.value = formatDateForInput(newDate)
  })
  </script>
  
  <style scoped>
  .date-range-picker {
    position: relative;
  }
  
  .range-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .range-selector:hover {
    background-color: #e0e0e0;
  }
  
  .date-picker-popup {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    width: 320px;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: hidden;
  }
  
  .preset-ranges {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
  }
  
  .preset-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
}

.preset-btn.active {
  background-color: rgba(66, 133, 244, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

.preset-btn:hover {
  background-color: #f0f0f0;
}

.custom-range {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.picker-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-input label {
  font-size: 0.75rem;
  color: var(--text-light);
}

.picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.apply-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.apply-btn:hover {
  background-color: #3b77db;
}

.cancel-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
  border-radius: var(--border-radius);
}
</style>