import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import the router from router/index.js
import './style.css'
import './firebase' // Import to ensure Firebase is initialized

const app = createApp(App)
app.use(router)
app.mount('#app')