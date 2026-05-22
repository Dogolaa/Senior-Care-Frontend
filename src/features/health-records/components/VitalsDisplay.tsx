import { Heart, Thermometer, Activity, Wind, Scale } from 'lucide-react'
import { cn, heartRateStatus, saturationStatus, temperatureStatus, bloodPressureStatus } from '@/lib/utils'
import type { HealthRecordDTO } from '@/types/api'

interface VitalConfig {
  label: string
  value: string | number
  unit: string
  icon: React.ElementType
  status: 'normal' | 'warning' | 'danger'
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
    { label: 'Freq. Cardíaca', value: record.heartRate, unit: 'bpm', icon: Heart, status: heartRateStatus(record.heartRate) },
    { label: 'Temperatura', value: record.temperature.toFixed(1), unit: '°C', icon: Thermometer, status: temperatureStatus(record.temperature) },
    { label: 'Saturação', value: record.saturation.toFixed(0), unit: '%', icon: Wind, status: saturationStatus(record.saturation) },
    { label: 'Pressão Arterial', value: record.bloodPressure, unit: 'mmHg', icon: Activity, status: bloodPressureStatus(record.bloodPressure) },
    { label: 'IMC', value: record.imc.toFixed(1), unit: 'kg/m²', icon: Scale, status: getImcStatus(record.imc) },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {vitals.map((v) => <VitalCard key={v.label} vital={v} />)}
    </div>
  )
}
