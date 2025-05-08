import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'

// Import components
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import MealHistory from '../views/MealHistory.vue'
import Analytics from '../views/Analytics.vue'
import Goals from '../views/Goals.vue'
import Settings from '../views/Settings.vue'
import EditMeal from '../views/EditMeal.vue'

interface RouteMeta {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true } satisfies RouteMeta
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } satisfies RouteMeta
  },
  // ... rest of the routes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  
  return new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      unsubscribe()
      
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

      if (requiresAuth && !user) {
        resolve(next({ name: 'Login', query: { redirect: to.fullPath } }))
      } else if (requiresGuest && user) {
        resolve(next({ name: 'Dashboard' }))
      } else {
        resolve(next())
      }
    })
  })
})

export default router