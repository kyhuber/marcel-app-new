export function createOpenAIErrorHandler() {
    return {
      handleRateLimitError(error, retryCount = 0) {
        if (error.status === 429) {
          // Exponential backoff
          const waitTime = Math.pow(2, retryCount) * 1000
          console.warn(`Rate limited. Retrying in ${waitTime/1000} seconds`)
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(retryRequest())
            }, waitTime)
          })
        }
      },
      
      handleInvalidRequestError(error) {
        // Comprehensive error logging
        console.error('Invalid OpenAI Request:', {
          message: error.message,
          code: error.code,
          type: error.type
        })
  
        // Potential Slack/Email notification for critical errors
        notifyAdministrator(error)
      },
  
      handleGenericError(error) {
        // Generic error handling
        console.error('OpenAI Generic Error:', error)
        
        // Optional: Log to error tracking service
        // Sentry.captureException(error)
      }
    }
  }
  
  // Optional: Admin Notification
  function notifyAdministrator(error) {
    // Implement via email, Slack, or other notification service
    // This is a placeholder
    console.log('Notifying admin about OpenAI error', error)
  }