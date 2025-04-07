// Create a new MobileHeader.vue component
<template>
  <header class="mobile-header">
    <h1>{{ title }}</h1>
    <button @click="toggleMenu" class="menu-button">
      <Icon name="menu" />
    </button>
    
    <div v-if="showMenu" class="mobile-menu">
      <router-link to="/settings" class="menu-item">Settings</router-link>
      <button @click="logout" class="menu-item">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '@/components/IconsLibrary.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const logout = () => {
  // Logout functionality
}
</script>

<style scoped>
.mobile-header {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: white;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .menu-button {
    background: none;
    border: none;
    font-size: 1.5rem;
  }
  
  .mobile-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 0.5rem 0;
    min-width: 150px;
  }
  
  .menu-item {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: var(--text-dark);
  }
  
  .menu-item:hover {
    background-color: #f5f5f5;
  }
}
</style>