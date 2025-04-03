export function initVoiceRecognition() {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'))
      }
  
      const recognition = new webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
  
      recognition.onstart = () => {
        console.log('Voice recognition started')
      }
  
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        reject(event.error)
      }
  
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }
  
      recognition.start()
    })
  }