import Vue from 'vue'
import VueRouter from 'vue-router'
import { auth } from '../firebase'

// Import components
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import NutritionDashboard from '../components/NutritionDashboard.vue'

Vue.use(VueRouter)

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
    component: NutritionDashboard,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !currentUser) {
    // Redirect to login if not authenticated
    next('/')
  } else if (requiresGuest && currentUser) {
    // Redirect to dashboard if already logged in
    next('/dashboard')
  } else {
    next()
  }
})

export default router