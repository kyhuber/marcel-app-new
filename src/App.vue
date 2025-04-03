<template>
  <div id="app">
    <nav v-if="isAuthenticated">
      <router-link to="/dashboard">Dashboard</router-link>
      <button @click="logout">Logout</button>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { auth } from './firebase'

export default {
  data() {
    return {
      isAuthenticated: false
    }
  },
  created() {
    auth.onAuthStateChanged(user => {
      this.isAuthenticated = !!user
    })
  },
  methods: {
    async logout() {
      try {
        await auth.signOut()
        this.$router.push('/')
      } catch (error) {
        console.error('Logout error', error)
      }
    }
  }
}
</script>