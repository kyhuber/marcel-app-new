import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import './style.css' // Import global styles
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import './firebase' // Import to ensure Firebase is initialized

const routes = [
  { 
    path: '/', 
    component: Login 
  },
  { 
    path: '/dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Get the Auth instance that's already initialized in firebase.js
const auth = getAuth()

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !auth.currentUser) {
    next('/')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')