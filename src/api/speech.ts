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

function parseVitalsFromTranscription(text: string): Omit<VitalsTranscriptionResponse, 'rawTranscription'> {
  const lower = text.toLowerCase()
  const result: Omit<VitalsTranscriptionResponse, 'rawTranscription'> = {
    bloodPressure: null, weight: null, height: null,
    temperature: null, heartRate: null, saturation: null,
  }

  // Pressão arterial: "120 por 80", "120/80", "PA 120/80"
  const bpMatch = lower.match(/(?:press[aã]o\s+(?:arterial\s+)?)?(\d{2,3})\s*(?:por|\/)\s*(\d{2,3})/)
  if (bpMatch) result.bloodPressure = `${bpMatch[1]}/${bpMatch[2]}`

  // Frequência cardíaca: "fc 72", "pulso 72", "72 bpm", "frequência 72"
  const hrMatch = lower.match(/(?:freq[uü]?[eê]ncia\s+(?:card[ií]aca\s+)?|fc\s+|pulso\s+|batimentos\s+)(\d{2,3})|(\d{2,3})\s*bpm/)
  if (hrMatch) result.heartRate = parseInt(hrMatch[1] ?? hrMatch[2])

  // Temperatura: "temperatura 36,5", "febre 38", "36 vírgula 5 graus"
  const tempMatch = lower.match(/(?:temperatura|febre|temp)\s+(\d{2})[,.](\d)|(\d{2})[,.](\d)\s*(?:graus?|°c)|(?:temperatura|febre|temp)\s+(\d{2})\b/)
  if (tempMatch) {
    if (tempMatch[5]) {
      result.temperature = parseFloat(tempMatch[5])
    } else {
      const whole = tempMatch[1] ?? tempMatch[3]
      const decimal = tempMatch[2] ?? tempMatch[4] ?? '0'
      result.temperature = parseFloat(`${whole}.${decimal}`)
    }
  }

  // Saturação: "saturação 98", "spo2 97", "98 por cento"
  const satMatch = lower.match(/(?:satura[çc][aã]o|spo2?|oxig[eê]nio)\s+(\d{2,3})|(\d{2,3})\s*%/)
  if (satMatch) result.saturation = parseFloat(satMatch[1] ?? satMatch[2])

  // Peso: "peso 70", "70 quilos", "70 kg"
  const weightMatch = lower.match(/(?:peso|pesa)\s+(\d{2,3})[,.]?(\d?)|(\d{2,3})[,.]?(\d?)\s*(?:quilos?|kg)/)
  if (weightMatch) {
    const whole = weightMatch[1] ?? weightMatch[3]
    const decimal = weightMatch[2] ?? weightMatch[4] ?? ''
    result.weight = parseFloat(`${whole}${decimal ? '.' + decimal : ''}`)
  }

  // Altura: "altura 1,75", "1 vírgula 75 metros", "1,75 m"
  const heightMatch = lower.match(/(?:altura|mede)\s+(\d)[,.](\d{2})|(\d)[,.](\d{2})\s*(?:metros?|m\b)/)
  if (heightMatch) {
    const whole = heightMatch[1] ?? heightMatch[3]
    const decimal = heightMatch[2] ?? heightMatch[4]
    result.height = parseFloat(`${whole}.${decimal}`)
  }

  return result
}

export const transcribeVitals = async (audioBlob: Blob): Promise<VitalsTranscriptionResponse> => {
  const formData = new FormData()
  formData.append('audioFile', audioBlob, 'vitals.wav')
  const rawTranscription = await api.post<string>('/speech/transcribe', formData, {
    headers: { 'Content-Type': undefined },
  }).then((r) => r.data)

  return {
    rawTranscription,
    ...parseVitalsFromTranscription(rawTranscription),
  }
}
