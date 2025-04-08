import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './firebase'
import { useThemeManager } from './services/themeService'

const { initTheme } = useThemeManager()
initTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')