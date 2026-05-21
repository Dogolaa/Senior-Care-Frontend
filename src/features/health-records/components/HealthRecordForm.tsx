import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { useCreateHealthRecord, useUpdateHealthRecord } from '../hooks/useHealthRecord'
import type { HealthRecordDTO } from '@/types/api'

const schema = z.object({
  height: z.coerce.number().min(0.5).max(2.5),
  weight: z.coerce.number().min(10).max(300),
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato: 120/80'),
  heartRate: z.coerce.number().min(20).max(250),
  temperature: z.coerce.number().min(30).max(45),
  saturation: z.coerce.number().min(50).max(100),
})

type FormData = z.infer<typeof schema>

interface HealthRecordFormProps {
  residentId: string
  existing?: HealthRecordDTO
  onSuccess?: () => void
}

export function HealthRecordForm({ residentId, existing, onSuccess }: HealthRecordFormProps) {
  const userId = useAuthStore((s) => s.userId)!
  const { mutate: create, isPending: creating } = useCreateHealthRecord(onSuccess)
  const { mutate: update, isPending: updating } = useUpdateHealthRecord(residentId)
  const isPending = creating || updating

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          height: existing.height,
          weight: existing.weight,
          bloodPressure: existing.bloodPressure,
          heartRate: existing.heartRate,
          temperature: existing.temperature,
          saturation: existing.saturation,
        }
      : undefined,
  })

  const onSubmit = (data: FormData) => {
    if (existing) {
      update({ id: existing.id, data: { ...data, updatedById: userId } })
    } else {
      create({ ...data, residentId, updatedById: userId })
    }
  }

  const fields = [
    { id: 'height', label: 'Altura (m)', placeholder: '1.70', error: errors.height },
    { id: 'weight', label: 'Peso (kg)', placeholder: '70.0', error: errors.weight },
    { id: 'bloodPressure', label: 'Pressão Arterial', placeholder: '120/80', error: errors.bloodPressure },
    { id: 'heartRate', label: 'Freq. Cardíaca (bpm)', placeholder: '72', error: errors.heartRate },
    { id: 'temperature', label: 'Temperatura (°C)', placeholder: '36.5', error: errors.temperature },
    { id: 'saturation', label: 'Saturação (%)', placeholder: '98', error: errors.saturation },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.id} className="space-y-2">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} placeholder={f.placeholder} {...register(f.id)} />
            {f.error && <p className="text-sm text-destructive">{f.error.message}</p>}
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando...' : existing ? 'Atualizar Prontuário' : 'Criar Prontuário'}
      </Button>
    </form>
  )
}
