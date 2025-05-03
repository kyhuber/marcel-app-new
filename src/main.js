import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './style.css'
import './firebase'
import { useThemeManager } from './services/themeService'

const { initTheme } = useThemeManager()
initTheme()

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')