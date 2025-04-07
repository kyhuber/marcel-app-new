import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from 'firebase/auth'

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

// Navigation guards
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // Handle auth required routes
  if (requiresAuth && !currentUser) {
    next({ name: 'Login' })
  } 
  // Handle guest only routes
  else if (requiresGuest && currentUser) {
    next({ name: 'Dashboard' })
  } 
  // Allow navigation
  else {
    next()
  }
})

export default router