<!-- src/App.vue -->
<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useThemeManager } from './services/themeService'

const { isDarkTheme } = useThemeManager()
</script>

<style>
#app {
  height: 100%;
  width: 100%;
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>