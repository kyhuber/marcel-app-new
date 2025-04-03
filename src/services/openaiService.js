class OpenAIUsageTracker {
    constructor() {
      this.dailyTokens = 0
      this.dailyRequests = 0
      this.resetTimer = this.setupDailyReset()
    }
  
    trackUsage(tokenCount) {
      this.dailyTokens += tokenCount
      this.dailyRequests += 1
  
      this.checkUsageLimits()
    }
  
    checkUsageLimits() {
      const DAILY_TOKEN_LIMIT = 50000
      const DAILY_REQUEST_LIMIT = 500
  
      if (this.dailyTokens > DAILY_TOKEN_LIMIT) {
        console.warn('Daily OpenAI token limit approaching')
        // Potential actions: 
        // - Switch to fallback
        // - Notify user
        // - Block further requests
      }
  
      if (this.dailyRequests > DAILY_REQUEST_LIMIT) {
        console.warn('Daily request limit reached')
        // Similar actions as above
      }
    }
  
    setupDailyReset() {
      // Reset counters at midnight
      const now = new Date()
      const midnight = new Date(
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate() + 1, 
        0, 0, 0
      )
      
      const timeUntilMidnight = midnight.getTime() - now.getTime()
      
      return setTimeout(() => {
        this.dailyTokens = 0
        this.dailyRequests = 0
        this.setupDailyReset() // Recursive setup
      }, timeUntilMidnight)
    }
  
    // Cleanup method
    destroy() {
      clearTimeout(this.resetTimer)
    }
  }
  
  export const usageTracker = new OpenAIUsageTracker()