import OpenAI from 'openai'

// Initialize OpenAI with API key from environment variables
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Needed for client-side browser usage (not recommended for production)
})

// Optional: Add debugging to help troubleshoot API key issues
console.log('OpenAI client initialized. API key defined:', !!import.meta.env.VITE_OPENAI_API_KEY)