export class SpeechService {
  private recognition: SpeechRecognition | null = null
  private isListening = false

  constructor() {
    if (typeof window !== 'undefined') {
      // Check for browser support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-US'
    this.recognition.maxAlternatives = 1
  }

  async requestPermission(): Promise<boolean> {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the stream immediately
      return true
    } catch (error) {
      console.error('Microphone permission denied:', error)
      return false
    }
  }

  async startListening(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported in this browser'))
        return
      }

      if (this.isListening) {
        reject(new Error('Already listening'))
        return
      }

      // Request permission first
      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        reject(new Error('Microphone permission denied. Please allow microphone access and try again.'))
        return
      }

      this.isListening = true

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        this.isListening = false
        resolve(transcript)
      }

      this.recognition.onerror = (event) => {
        this.isListening = false
        let errorMessage = 'Speech recognition error'
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permission in your browser settings.'
            break
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.'
            break
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone connection.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.'
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }
        
        reject(new Error(errorMessage))
      }

      this.recognition.onend = () => {
        this.isListening = false
      }

      try {
        this.recognition.start()
      } catch (error) {
        this.isListening = false
        reject(new Error('Failed to start speech recognition'))
      }
    })
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  getIsListening(): boolean {
    return this.isListening
  }
}
