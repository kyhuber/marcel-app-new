import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MealList from '@/components/MealList.vue'
import Icon from '@/components/IconsLibrary.vue'
import { i18nMessages } from '../i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: i18nMessages
})

describe('MealList', () => {
  const mockMeals = [
    {
      id: '1',
      foodItems: ['Oatmeal', 'Banana'],
      mealType: 'breakfast',
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 5,
      timestamp: new Date('2024-03-20T08:00:00')
    },
    {
      id: '2',
      foodItems: ['Chicken Salad'],
      mealType: 'lunch',
      calories: 400,
      protein: 30,
      carbs: 20,
      fat: 15,
      timestamp: new Date('2024-03-20T12:00:00')
    }
  ]

  it('renders properly', () => {
    const wrapper = mount(MealList, {
      props: {
        meals: mockMeals
      },
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays meals in chronological order', () => {
    const wrapper = mount(MealList, {
      props: {
        meals: mockMeals
      },
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })
    
    const mealElements = wrapper.findAll('.meal-card')
    expect(mealElements).toHaveLength(2)
    expect(mealElements[0].text()).toContain('Breakfast')
    expect(mealElements[1].text()).toContain('Lunch')
  })

  it('shows empty state when no meals', () => {
    const wrapper = mount(MealList, {
      props: {
        meals: []
      },
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('displays correct nutrition information', () => {
    const wrapper = mount(MealList, {
      props: {
        meals: [mockMeals[0]]
      },
      global: {
        plugins: [i18n],
        components: {
          Icon
        }
      }
    })
    
    const mealCard = wrapper.find('.meal-card')
    expect(mealCard.exists()).toBe(true)
    
    const nutrientPills = mealCard.findAll('.nutrient-pill')
    expect(nutrientPills.length).toBeGreaterThan(0)
    
    const html = mealCard.html()
    expect(html).toContain('300') // calories
    expect(html).toContain('10')  // protein
    expect(html).toContain('50')  // carbs
    expect(html).toContain('5')   // fat
  })
})
