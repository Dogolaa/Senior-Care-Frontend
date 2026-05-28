import api from './axios'

export interface VitalsTranscriptionResponse {
  rawTranscription: string
  bloodPressure: string | null
  weight: number | null
  height: number | null
  temperature: number | null
  heartRate: number | null
  saturation: number | null
}

export const transcribeVitals = (audioBlob: Blob): Promise<VitalsTranscriptionResponse> => {
  const formData = new FormData()
  formData.append('audioFile', audioBlob, 'vitals.wav')
  return api.post('/speech/transcribe-vitals', formData, {
    headers: { 'Content-Type': undefined },
  }).then((r) => r.data)
}
