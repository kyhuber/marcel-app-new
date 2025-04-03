<template>
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <h2 class="app-title">Marcel</h2>
        <button @click="toggleSidebar" class="collapse-btn">
          <CollapseIcon :direction="isCollapsed ? 'right' : 'left'" />
        </button>
      </div>
      
      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <router-link to="/dashboard" class="nav-item">
            <DashboardIcon />
            <span v-if="!isCollapsed">Dashboard</span>
          </router-link>
          <router-link to="/MealHistory" class="nav-item">
            <MealsIcon />
            <span v-if="!isCollapsed">Meal History</span>
          </router-link>
          <router-link to="/analytics" class="nav-item">
            <AnalyticsIcon />
            <span v-if="!isCollapsed">Analytics</span>
          </router-link>
          <router-link to="/goals" class="nav-item">
            <GoalsIcon />
            <span v-if="!isCollapsed">Goals</span>
          </router-link>
        </nav>
      </div>
      
      <div class="sidebar-footer">
        <router-link to="/settings" class="nav-item">
          <SettingsIcon />
          <span v-if="!isCollapsed">Settings</span>
        </router-link>
        <div class="user-profile" v-if="!isCollapsed">
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-info">
            <div class="username">{{ displayName }}</div>
          </div>
        </div>
      </div>
    </aside>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { getAuth } from 'firebase/auth'
  import Icon from '@/components/IconsLibrary.vue'
  
  const isCollapsed = ref(false)
  const displayName = ref('')
  
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
  
  onMounted(() => {
    // Check if sidebar state was saved
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      isCollapsed.value = savedState === 'true'
    }
    
    // Get user info
    const auth = getAuth()
    const user = auth.currentUser
    
    if (user) {
      displayName.value = user.displayName || user.email || 'User'
    }
  })
  </script>
  
  <style scoped>
  .sidebar {
    width: 250px;
    height: 100vh;
    background-color: white;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    transition: width 0.3s ease;
  }
  
  .sidebar.collapsed {
    width: 70px;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
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
    background-color: #f5f5f5;
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
  border-top: 1px solid #f0f0f0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-top: 0.5rem;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .sidebar.collapsed {
    width: 100%;
    height: 60px;
    overflow: hidden;
  }
  
  .sidebar-content {
    display: block;
  }
  
  .sidebar.collapsed .sidebar-content,
  .sidebar.collapsed .sidebar-footer {
    display: none;
  }
}
</style>