import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DateRangePicker from '@/components/DateRangePicker.vue'
import Icon from '@/components/IconsLibrary.vue'
import { i18nMessages } from '../i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: i18nMessages
})

describe('DateRangePicker', () => {
  const defaultProps = {
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31')
  }

  it('renders properly', () => {
    const wrapper = mount(DateRangePicker, {
      props: defaultProps,
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits date range when preset is selected', async () => {
    const wrapper = mount(DateRangePicker, {
      props: defaultProps,
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })

    // First click to show the picker
    await wrapper.find('.range-selector').trigger('click')
    
    // Find the preset buttons
    const presetButtons = wrapper.findAll('.preset-btn')
    expect(presetButtons.length).toBeGreaterThan(0)
    
    // Click the first preset button
    await presetButtons[0].trigger('click')
    
    expect(wrapper.emitted('update:dateRange')).toBeTruthy()
  })

  it('shows custom date picker when custom range is selected', async () => {
    const wrapper = mount(DateRangePicker, {
      props: defaultProps,
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })

    // First click to show the picker
    await wrapper.find('.range-selector').trigger('click')
    
    // Verify custom range section exists
    expect(wrapper.find('.custom-range').exists()).toBe(true)
  })

  it('validates date range', async () => {
    const wrapper = mount(DateRangePicker, {
      props: defaultProps,
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })

    // First click to show the picker
    await wrapper.find('.range-selector').trigger('click')
    
    // Set invalid date range through the component's methods
    await wrapper.vm.selectPreset({
      getRange: () => ({
        start: new Date('2024-03-20'),
        end: new Date('2024-03-19')
      })
    })
    
    // Try to apply the range
    await wrapper.find('.apply-btn').trigger('click')
    
    // Check for validation error
    expect(wrapper.find('.error-message').exists()).toBe(true)
  })
})
