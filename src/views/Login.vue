<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Marcel: Nutrition Tracking with a Flex</h2>

      <div class="form-toggle">
        <button
          @click="isLoginMode = true"
          :class="{ active: isLoginMode }"
        >
          Login
        </button>
        <button
          @click="isLoginMode = false"
          :class="{ active: !isLoginMode }"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleAuth">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div v-if="!isLoginMode" class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="Choose a username"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
            minlength="6"
          />
        </div>

        <button type="submit" class="submit-btn">
          {{ isLoginMode ? 'Login' : 'Sign Up' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="!isLoginMode" class="verification-message">
        Please check your email to verify your account.
      </p>

      <button v-if="isLoginMode" @click="resetPassword" class="reset-password-btn">
        Forgot Password?
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification, // Import for email verification
  sendPasswordResetEmail // Import for password reset
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const router = useRouter()
const route = useRoute()
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')
const error = ref(null)

const handleAuth = async () => {
  const auth = getAuth()

  try {
    if (isLoginMode.value) {
      // Login
      await signInWithEmailAndPassword(auth, email.value, password.value)

      // Check for redirect query parameter
      const redirectPath = route.query.redirect || '/dashboard'
      router.push(redirectPath)
    } else {
      // Sign Up
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      )

      const user = userCredential.user

      // Send email verification
      await sendEmailVerification(user);

      // Save additional user profile info
      await setDoc(doc(db, 'userProfiles', user.uid), {
        userId: user.uid,
        username: username.value,
        email: email.value,
        createdAt: new Date()
      })

      // Redirect to dashboard after signup
      // router.push('/dashboard')  // Consider not redirecting immediately
    }
  } catch (err) {
    console.error('Authentication error:', err)
    error.value = err.message
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-light);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 350px;
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
}

.form-toggle {
  display: flex;
  margin-bottom: 1.5rem;
}

.form-toggle button {
  flex: 1;
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-light);
  transition: all 0.2s ease;
}

.form-toggle button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: var(--border-color);
  border-radius: var(--border-radius);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #357ae8;
}

.error-message {
  color: var(--error-color);
  margin-top: 1rem;
}

.verification-message {
  color: green;
  margin-top: 1rem;
}

.reset-password-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  margin-top: 1rem;
}
</style>