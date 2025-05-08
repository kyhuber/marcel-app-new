interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
  error?: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export function initVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported'))
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = (): void => {
      console.log('Voice recognition started')
    }

    recognition.onerror = (event: SpeechRecognitionEvent): void => {
      console.error('Speech recognition error:', event.error)
      reject(event.error)
    }

    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }

    recognition.start()
  })
}