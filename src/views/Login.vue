<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Marcel Nutrition Tracker</h2>
      <button @click="signInWithGoogle" class="google-signin">
        Sign in with Google
      </button>
      
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider 
} from 'firebase/auth'

const error = ref(null)
const router = useRouter()

// Check for redirect result when component mounts
onMounted(async () => {
  try {
    const auth = getAuth()
    const result = await getRedirectResult(auth)
    
    if (result) {
      // User successfully signed in
      router.push('/dashboard')
    }
  } catch (err) {
    console.error('Redirect result error:', err)
    error.value = err.message || 'An error occurred during login'
  }
})

const signInWithGoogle = () => {
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  
  // Don't await this - it redirects away from the page
  signInWithRedirect(auth, provider).catch(err => {
    console.error('Redirect initiation error:', err)
    error.value = err.message || 'An error occurred during login'
  })
}
</script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 1rem;
  }
  
  .login-card {
    width: 100%;
    max-width: 350px;
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    text-align: center;
  }
  
  .google-signin {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    width: 100%;
    margin-top: 1rem;
    transition: background-color 0.3s ease;
  }
  
  .google-signin:hover {
    background-color: #357ae8;
  }
  
  .error-message {
    color: red;
    margin-top: 1rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 480px) {
    .login-card {
      width: 95%;
      padding: 1.5rem;
    }
  }
  </style>