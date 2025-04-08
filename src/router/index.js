import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Import components
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import MealHistory from '../views/MealHistory.vue'
import Analytics from '../views/Analytics.vue'
import Goals from '../views/Goals.vue'
import Settings from '../views/Settings.vue'
import EditMeal from '../views/EditMeal.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/mealhistory',
    name: 'MealHistory',
    component: MealHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/goals',
    name: 'Goals',
    component: Goals,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/meals/edit/:id',
    name: 'EditMeal',
    component: EditMeal,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Enhanced navigation guard with async auth check
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  
  // Return a promise that resolves when auth state is determined
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe() // Unsubscribe immediately to prevent memory leaks
      
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

      if (requiresAuth && !user) {
        // Redirect to login if trying to access protected route without authentication
        resolve(next({ name: 'Login', query: { redirect: to.fullPath } }))
      } else if (requiresGuest && user) {
        // Redirect to dashboard if authenticated user tries to access login page
        resolve(next({ name: 'Dashboard' }))
      } else {
        // Allow navigation
        resolve(next())
      }
    })
  })
})

export default router