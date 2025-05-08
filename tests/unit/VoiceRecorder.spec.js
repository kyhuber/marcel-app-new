import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import Icon from '@/components/IconsLibrary.vue'
import { i18nMessages } from '../i18n'

// Mock the required dependencies
vi.mock('@/utils/aiMealProcessor', () => ({
  aiProcessMeal: vi.fn()
}))

vi.mock('@/services/mealService', () => ({
  saveMealEntry: vi.fn()
}))

vi.mock('@/utils/nutritionDatabase', () => ({
  getNutritionEstimate: vi.fn()
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: i18nMessages
})

describe('VoiceRecorder', () => {
  let wrapper

  beforeEach(() => {
    // Mock the Web Speech API
    global.webkitSpeechRecognition = vi.fn().mockImplementation(() => ({
      continuous: true,
      interimResults: true,
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onerror: null,
      onend: null
    }))

    wrapper = mount(VoiceRecorder, {
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.voice-recorder').exists()).toBe(true)
  })

  it('shows instructions by default', () => {
    expect(wrapper.find('.instruction-card').exists()).toBe(true)
  })

  it('toggles instructions when clicked', async () => {
    const toggle = wrapper.find('.instruction-toggle')
    await toggle.trigger('click')
    expect(wrapper.find('.instruction-card').exists()).toBe(false)
    await toggle.trigger('click')
    expect(wrapper.find('.instruction-card').exists()).toBe(true)
  })

  it('disables recording button when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true })
    const button = wrapper.find('.record-btn')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('shows correct button text based on recording state', async () => {
    const button = wrapper.find('.record-btn')
    
    // Initial state
    expect(button.text()).toContain('Speak Meal')
    
    // Start recording
    await wrapper.vm.toggleRecording()
    expect(button.text()).toContain('Stop Recording')
    
    // Stop recording
    await wrapper.vm.toggleRecording()
    expect(button.text()).toContain('Speak Meal')
    
    // Set processing state through the component's method
    await wrapper.vm.processMeal('test meal') // Assuming you have this method
    expect(button.text()).toContain('Processing...')
  })

  it('handles text input submission', async () => {
    const input = wrapper.find('input[type="text"]')
    const submitButton = wrapper.find('.submit-btn')
    
    await input.setValue('I ate a sandwich for lunch')
    await submitButton.trigger('click')
    
    expect(wrapper.vm.mealText).toBe('I ate a sandwich for lunch')
  })
})
