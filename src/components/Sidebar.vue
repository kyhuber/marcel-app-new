// Update the Sidebar.vue template section:

<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <h2 class="app-title">{{ t('header.appName') }}</h2>
      <button @click="toggleSidebar" class="collapse-btn">
        <Icon :name="isCollapsed ? 'chevron-right' : 'chevron-left'" />
      </button>
    </div>
    
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <Icon name="dashboard" />
          <span v-if="!isCollapsed">{{ t('dashboard.title') }}</span>
        </router-link>
        <router-link to="/mealhistory" class="nav-item">
          <Icon name="meals" />
          <span v-if="!isCollapsed">{{ t('mealHistory.title') }}</span>
        </router-link>
        <router-link to="/analytics" class="nav-item">
          <Icon name="analytics" />
          <span v-if="!isCollapsed">{{ t('analytics.title') }}</span>
        </router-link>
        <router-link to="/goals" class="nav-item">
          <Icon name="goals" />
          <span v-if="!isCollapsed">{{ t('goals.title') }}</span>
        </router-link>
        <router-link to="/settings" class="nav-item mobile-only">
          <Icon name="settings" />
          <span v-if="!isCollapsed">{{ t('settings.title') }}</span>
        </router-link>
      </nav>
    </div>
    
    <div class="sidebar-footer">
      <router-link to="/settings" class="nav-item desktop-only">
        <Icon name="settings" />
        <span v-if="!isCollapsed">{{ t('settings.title') }}</span>
      </router-link>
      <div class="user-profile" v-if="!isCollapsed">
        <div class="avatar">{{ userInitials }}</div>
        <div class="user-info">
          <div class="username">{{ displayName }}</div>
        </div>
        <button @click="logout" class="logout-btn" :title="t('common.logout')">
          <Icon name="logout" />
        </button>
      </div>
    </div>
  </aside>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getAuth, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import Icon from '@/components/IconsLibrary.vue'

const { t } = useI18n()
const router = useRouter()
const isCollapsed = ref(false)
const displayName = ref('')
const username = ref('')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', isCollapsed.value)
}

const userInitials = computed(() => {
  if (!displayName.value) return '?'
  
  const names = displayName.value.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`
  }
  return displayName.value[0] || '?'
})

const logout = async () => {
  const auth = getAuth()
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout error', error)
    alert('Error logging out. Please try again.')
  }
}

const loadUserProfile = async () => {
  const auth = getAuth()
  const currentUser = auth.currentUser
  
  if (!currentUser) return
  
  try {
    const profileDocRef = doc(db, 'userProfiles', currentUser.uid)
    const profileDoc = await getDoc(profileDocRef)
    
    if (profileDoc.exists()) {
      const profileData = profileDoc.data()
      
      // Prioritize display name, fall back to username or email
      displayName.value = profileData.displayName || 
                           profileData.username || 
                           currentUser.email || 
                           'User'
      
      username.value = profileData.username || ''
    } else {
      // Fallback if no profile document exists
      displayName.value = currentUser.displayName || 
                           currentUser.email || 
                           'User'
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    displayName.value = currentUser.email || 'User'
  }
}

onMounted(() => {
  // Check if sidebar state was saved
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
  
  // Load user profile
  loadUserProfile()
})
</script>
  
<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: var(--background-card);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
    display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.collapse-btn {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 0.25rem;
}

.sidebar-content {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  color: var(--text-dark);
  text-decoration: none;
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: var(--background-light);
}

.nav-item.router-link-active {
  background-color: rgba(66, 133, 244, 0.1);
  border-left-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 500;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-top: 0.5rem;
  position: relative; /* For positioning the logout button */
}

.logout-btn {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  position: absolute;
  right: 1rem;
  padding: 0.25rem;
  transition: color 0.2s ease;
}

.logout-btn:hover {
  color: var(--primary-color);
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  font-size: 0.9rem;
}

/* Helper classes for mobile/desktop display */
.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    width: 100%;
    height: 70px;
    flex-direction: row;
    background-color: var(--background-card);
    padding: 0;
    z-index: 1000;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.06);
    border-top: 1px solid #f0f0f0;
    padding-bottom: calc(env(safe-area-inset-bottom, 0) + 0px);
    transform: translateY(0);
    transition: transform 0.3s ease;
  }

  /* Ensure content doesn't get hidden behind bottom nav */
  body {
    padding-bottom: 70px;
    padding-bottom: calc(70px + env(safe-area-inset-bottom, 0));
  }

  /* Adjust for browsers with bottom navigation/UI */
  @supports (-webkit-touch-callout: none) {
    .sidebar {
      padding-bottom: calc(env(safe-area-inset-bottom, 0) + 70px);
    }
  }

  /* Hide bottom navigation when browser bottom UI appears */
  @media (max-height: 650px) {
    .sidebar {
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }
    
    body {
      padding-bottom: 0;
    }
  }
  
  .sidebar-header {
    display: none;
  }
  
  .sidebar-content {
    padding: 0;
    width: 100%;
    display: block;
    overflow: visible;
    height: 100%;
  }
  
  .sidebar-nav {
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    padding: 0;
    margin: 0;
    height: 100%;
    align-items: center;
  }
  
  .nav-item {
    position: relative;
    flex-direction: column;
    padding: 8px 0;
    font-size: 0.75rem;
    text-align: center;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    border-left: none;
    border-top: none;
    flex: 1;
    height: 100%;
    color: var(--text-light);
    transition: transform 0.2s ease, color 0.2s ease;
  }
  
  .nav-item span {
    font-size: 11px;
    margin-top: 4px;
    display: block;
  }
  
  .nav-item.router-link-active {
    border-left-color: transparent;
    color: var(--primary-color);
    transform: translateY(-4px);
  }
  
  .nav-item.router-link-active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--primary-color);
  }
  
  /* Make dashboard icon slightly larger for emphasis */
  .nav-item[href="/dashboard"] svg {
    height: 26px;
    width: 26px;
  }
  
  .sidebar-footer {
    display: none;
  }
  
  .sidebar.collapsed {
    width: 100%; /* Ensure full width even when collapsed */
  }
  
  .mobile-only {
    display: flex;
  }
  
  .desktop-only {
    display: none;
  }
}
</style>