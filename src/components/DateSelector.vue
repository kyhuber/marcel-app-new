<template>
  <div class="date-selector">
    <button @click="goToPreviousDay" class="date-nav-btn">
      <Icon name="chevron-left" />
    </button>
    <div class="date-display" @click="showCalendar = !showCalendar">
      <span v-if="isToday">Today</span>
      <span v-else-if="isYesterday">Yesterday</span>
      <span v-else>{{ formattedDate }}</span>
      <Icon name="calendar" />
    </div>
    <button @click="goToNextDay" class="date-nav-btn" :disabled="isToday">
      <Icon name="chevron-right" />
    </button>
    
    <div v-if="showCalendar" class="calendar-popup">
      <div class="calendar-header">
        <button @click="prevMonth" class="month-nav-btn">
          <Icon name="chevron-left" />
        </button>
        <span>{{ calendarTitle }}</span>
        <button @click="nextMonth" class="month-nav-btn">
          <Icon name="chevron-right" />
        </button>
      </div>
      <div class="weekdays">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>
      <div class="calendar-grid">
        <button 
          v-for="(day, index) in calendarDays" 
          :key="index"
          :class="[
            'calendar-day',
            { 'other-month': !day.currentMonth },
            { 'selected': isSameDay(day.date, selectedDate) },
            { 'today': isSameDay(day.date, new Date()) },
            { 'disabled': day.date > new Date() }
          ]"
          :disabled="day.date > new Date()"
          @click="selectDate(day.date)"
        >
          {{ day.date.getDate() }}
        </button>
      </div>
      <div class="calendar-footer">
        <button @click="selectToday" class="today-btn">Today</button>
        <button @click="showCalendar = false" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/IconsLibrary.vue'

const { t, locale } = useI18n()

const props = defineProps({
  selectedDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['update:date'])

const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Weekdays translation
const weekdays = computed(() => {
  // Use narrow weekday names for brevity
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'narrow' })
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, i + 1) // Use a fixed month for consistent formatting
    return formatter.format(date)
  })
})
  
  const isToday = computed(() => {
    const today = new Date()
    return isSameDay(props.selectedDate, today)
  })
  
  const isYesterday = computed(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return isSameDay(props.selectedDate, yesterday)
  })
  
  const formattedDate = computed(() => {
    return props.selectedDate.toLocaleDateString(locale.value, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  })

  const calendarTitle = computed(() => {
    return new Date(currentYear.value, currentMonth.value).toLocaleDateString(locale.value, {
      month: 'long',
      year: 'numeric'
    })
  })
  
  const calendarDays = computed(() => {
    const days = []
    
    // First day of the month
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    // Last day of the month
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
    
    // Days from previous month
    const prevMonthDays = firstDay.getDay()
    const prevMonth = new Date(currentYear.value, currentMonth.value, 0)
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear.value, currentMonth.value - 1, prevMonth.getDate() - i),
        currentMonth: false
      })
    }
    
    // Days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(currentYear.value, currentMonth.value, i),
        currentMonth: true
      })
    }
    
    // Days from next month
    const nextMonthDays = 42 - days.length
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: new Date(currentYear.value, currentMonth.value + 1, i),
        currentMonth: false
      })
    }
    
    return days
  })
  
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }
  
  function goToPreviousDay() {
    const previousDay = new Date(props.selectedDate)
    previousDay.setDate(previousDay.getDate() - 1)
    emit('update:date', previousDay)
  }
  
  function goToNextDay() {
    const today = new Date()
    const nextDay = new Date(props.selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Prevent selecting future dates
    if (nextDay <= today) {
      emit('update:date', nextDay)
    }
  }
  
  function selectDate(date) {
    emit('update:date', date)
    showCalendar.value = false
  }
  
  function selectToday() {
    emit('update:date', new Date())
    showCalendar.value = false
  }
  
  function prevMonth() {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }
  
  function nextMonth() {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }
  
  // Close calendar when clicking outside
  const handleClickOutside = (event) => {
    const calendar = document.querySelector('.date-selector')
    if (calendar && !calendar.contains(event.target)) {
      showCalendar.value = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    
    // Initialize month/year based on selected date
    currentMonth.value = props.selectedDate.getMonth()
    currentYear.value = props.selectedDate.getFullYear()
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  watch(() => props.selectedDate, (newDate) => {
    currentMonth.value = newDate.getMonth()
    currentYear.value = newDate.getFullYear()
  })
  </script>
  
  <style scoped>
  .date-selector {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  .date-nav-btn {
    background: none;
    border: none;
    color: var(--text-dark);
    cursor: pointer;
    padding: 0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  
  .date-nav-btn:hover {
    opacity: 1;
  }
  
  .date-nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .date-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .date-display:hover {
    background-color: var(--background-card)
  }
  
  .calendar-popup {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
    width: 300px;
    background-color: var(--background-card);
    border-radius: var(--border-radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 1rem;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .month-nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    color: var(--text-dark);
  }
  
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.75rem;
    color: #757575;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  
  .calendar-day {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .calendar-day:hover:not(.disabled) {
    background-color: #f5f5f5;
  }
  
  .calendar-day.other-month {
    color: #bdbdbd;
  }
  
  .calendar-day.today {
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .calendar-day.selected {
    background-color: var(--primary-color);
    color: white;
  }
  
  .calendar-day.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .calendar-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid #f0f0f0;
  }
  
  .today-btn, .close-btn {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: var(--border-radius);
  }
  
  .today-btn {
    color: var(--primary-color);
  }
  
  .today-btn:hover {
    background-color: rgba(66, 133, 244, 0.1);
  }
  
  .close-btn:hover {
    background-color: #f5f5f5;
  }
  </style>