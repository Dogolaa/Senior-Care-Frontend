import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}

export function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export type VitalStatus = 'normal' | 'warning' | 'danger'

export interface VitalAnomaly {
  name: string
  value: string
  reason: string
}

function parseBP(bp: string | null | undefined): { sys: number; dia: number } | null {
  if (!bp || !bp.includes('/')) return null
  const [s, d] = bp.split('/').map((v) => parseInt(v.trim(), 10))
  if (isNaN(s) || isNaN(d)) return null
  return { sys: s, dia: d }
}

export function heartRateStatus(hr: number | null | undefined): VitalStatus {
  if (hr == null) return 'normal'
  if (hr < 40 || hr > 120) return 'danger'
  if (hr < 60 || hr > 100) return 'warning'
  return 'normal'
}

export function saturationStatus(sat: number | null | undefined): VitalStatus {
  if (sat == null) return 'normal'
  if (sat < 90) return 'danger'
  if (sat < 95) return 'warning'
  return 'normal'
}

export function temperatureStatus(temp: number | null | undefined): VitalStatus {
  if (temp == null) return 'normal'
  if (temp < 35 || temp > 38.5) return 'danger'
  if (temp < 36 || temp > 37.5) return 'warning'
  return 'normal'
}

export function bloodPressureStatus(bp: string | null | undefined): VitalStatus {
  const parsed = parseBP(bp)
  if (!parsed) return 'normal'
  const { sys, dia } = parsed
  if (sys > 160 || sys < 80 || dia > 100) return 'danger'
  if (sys > 140 || sys < 90 || dia > 90) return 'warning'
  return 'normal'
}

export function checkVitalAnomalies(
  heartRate: number | null | undefined,
  saturation: number | null | undefined,
  temperature: number | null | undefined,
  bloodPressure: string | null | undefined
): VitalAnomaly[] {
  const anomalies: VitalAnomaly[] = []

  if (heartRateStatus(heartRate) === 'danger') {
    anomalies.push({ name: 'Freq. Cardíaca', value: `${heartRate} bpm`, reason: heartRate! < 40 ? 'Abaixo de 40 bpm (bradicardia grave)' : 'Acima de 120 bpm (taquicardia)' })
  } else if (heartRateStatus(heartRate) === 'warning') {
    anomalies.push({ name: 'Freq. Cardíaca', value: `${heartRate} bpm`, reason: heartRate! < 60 ? 'Abaixo de 60 bpm' : 'Acima de 100 bpm' })
  }

  if (saturationStatus(saturation) !== 'normal') {
    anomalies.push({ name: 'Saturação', value: `${saturation}%`, reason: saturation! < 90 ? 'Hipoxemia (abaixo de 90%)' : 'Atenção (abaixo de 95%)' })
  }

  if (temperatureStatus(temperature) !== 'normal') {
    anomalies.push({ name: 'Temperatura', value: `${temperature}°C`, reason: temperature! < 35 ? 'Hipotermia (abaixo de 35°C)' : temperature! > 38.5 ? 'Febre (acima de 38.5°C)' : 'Fora do padrão' })
  }

  const bpStatus = bloodPressureStatus(bloodPressure)
  if (bpStatus !== 'normal') {
    const parsed = parseBP(bloodPressure)
    if (parsed) {
      const reason = parsed.sys > 160 ? 'Hipertensão grave (sistólica > 160)' :
        parsed.sys < 80 ? 'Hipotensão (sistólica < 80)' :
        parsed.dia > 100 ? 'Hipertensão (diastólica > 100)' :
        'Pressão fora do padrão'
      anomalies.push({ name: 'Pressão Arterial', value: `${bloodPressure} mmHg`, reason })
    }
  }

  return anomalies
}
