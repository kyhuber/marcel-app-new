interface OpenAIError {
  status?: number;
  message: string;
  code?: string;
  type?: string;
}

interface ErrorHandler {
  handleRateLimitError: (error: OpenAIError, retryCount?: number) => Promise<any>;
  handleInvalidRequestError: (error: OpenAIError) => void;
  handleGenericError: (error: OpenAIError) => void;
}

export function createOpenAIErrorHandler(): ErrorHandler {
  return {
    handleRateLimitError(error: OpenAIError, retryCount: number = 0): Promise<any> {
      if (error.status === 429) {
        const waitTime = Math.pow(2, retryCount) * 1000
        console.warn(`Rate limited. Retrying in ${waitTime/1000} seconds`)
        
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(this.handleRateLimitError(error, retryCount + 1))
          }, waitTime)
        })
      }
      return Promise.resolve() // Return resolved promise for non-429 errors
    },
    
    handleInvalidRequestError(error: OpenAIError): void {
      console.error('Invalid OpenAI Request:', {
        message: error.message,
        code: error.code,
        type: error.type
      })

      notifyAdministrator(error)
    },

    handleGenericError(error: OpenAIError): void {
      console.error('OpenAI Generic Error:', error)
    }
  }
}

function notifyAdministrator(error: OpenAIError): void {
  console.log('Notifying admin about OpenAI error', error)
}
