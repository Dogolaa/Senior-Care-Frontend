import { Heart, Thermometer, Activity, Wind, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HealthRecordDTO } from '@/types/api'

interface VitalConfig {
  label: string
  value: string | number
  unit: string
  icon: React.ElementType
  status: 'normal' | 'warning' | 'danger'
}

function getHeartRateStatus(hr: number): 'normal' | 'warning' | 'danger' {
  if (hr >= 60 && hr <= 100) return 'normal'
  if (hr >= 50 && hr <= 120) return 'warning'
  return 'danger'
}

function getTempStatus(t: number): 'normal' | 'warning' | 'danger' {
  if (t >= 36.0 && t <= 37.5) return 'normal'
  if (t >= 35.0 && t <= 38.5) return 'warning'
  return 'danger'
}

function getSatStatus(s: number): 'normal' | 'warning' | 'danger' {
  if (s >= 95) return 'normal'
  if (s >= 90) return 'warning'
  return 'danger'
}

function getImcStatus(imc: number): 'normal' | 'warning' | 'danger' {
  if (imc >= 18.5 && imc <= 29.9) return 'normal'
  if (imc >= 15 && imc <= 39.9) return 'warning'
  return 'danger'
}

const statusClasses = {
  normal: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
}

const iconClasses = {
  normal: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
}

function VitalCard({ vital }: { vital: VitalConfig }) {
  const Icon = vital.icon
  return (
    <div className={cn('rounded-lg border p-4 flex items-center gap-3', statusClasses[vital.status])}>
      <Icon className={cn('h-6 w-6 shrink-0', iconClasses[vital.status])} />
      <div>
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{vital.label}</p>
        <p className="text-xl font-bold">
          {vital.value} <span className="text-sm font-normal">{vital.unit}</span>
        </p>
      </div>
    </div>
  )
}

interface VitalsDisplayProps {
  record: HealthRecordDTO
}

export function VitalsDisplay({ record }: VitalsDisplayProps) {
  const vitals: VitalConfig[] = [
    { label: 'Freq. Cardíaca', value: record.heartRate, unit: 'bpm', icon: Heart, status: getHeartRateStatus(record.heartRate) },
    { label: 'Temperatura', value: record.temperature.toFixed(1), unit: '°C', icon: Thermometer, status: getTempStatus(record.temperature) },
    { label: 'Saturação', value: record.saturation.toFixed(0), unit: '%', icon: Wind, status: getSatStatus(record.saturation) },
    { label: 'Pressão Arterial', value: record.bloodPressure, unit: 'mmHg', icon: Activity, status: 'normal' },
    { label: 'IMC', value: record.imc.toFixed(1), unit: 'kg/m²', icon: Scale, status: getImcStatus(record.imc) },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {vitals.map((v) => <VitalCard key={v.label} vital={v} />)}
    </div>
  )
}
