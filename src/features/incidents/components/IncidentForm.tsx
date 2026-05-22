import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { INCIDENT_TYPE_OPTIONS, INCIDENT_SEVERITY_OPTIONS } from '@/lib/constants'
import type { IncidentDTO } from '../../../types/api'

const schema = z.object({
  incidentType: z.string().min(1, 'Tipo de incidente obrigatório'),
  severity: z.string().min(1, 'Severidade obrigatória'),
  description: z.string().min(1, 'Descrição obrigatória'),
  actionTaken: z.string().optional(),
  occurredAt: z.string().min(1, 'Data e hora obrigatórias'),
  room: z.string().optional(),
})

export type IncidentFormData = z.infer<typeof schema>

interface IncidentFormProps {
  defaultValues?: Partial<IncidentFormData>
  initialData?: IncidentDTO
  onSubmit: (data: IncidentFormData) => void
  isPending: boolean
  onCancel: () => void
  submitLabel?: string
}

function toDatetimeLocal(iso: string): string {
  return iso.replace('T', 'T').slice(0, 16)
}

export function IncidentForm({
  defaultValues,
  initialData,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Salvar',
}: IncidentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (initialData) {
      reset({
        incidentType: initialData.incidentType,
        severity: initialData.severity,
        description: initialData.description,
        actionTaken: initialData.actionTaken ?? '',
        occurredAt: toDatetimeLocal(initialData.occurredAt),
        room: initialData.room ?? '',
      })
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Incidente</Label>
          <Select
            defaultValue={initialData?.incidentType ?? defaultValues?.incidentType}
            onValueChange={(v) => setValue('incidentType', v)}
          >
            <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
            <SelectContent>
              {INCIDENT_TYPE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.incidentType && <p className="text-sm text-destructive">{errors.incidentType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Severidade</Label>
          <Select
            defaultValue={initialData?.severity ?? defaultValues?.severity}
            onValueChange={(v) => setValue('severity', v)}
          >
            <SelectTrigger><SelectValue placeholder="Selecionar severidade" /></SelectTrigger>
            <SelectContent>
              {INCIDENT_SEVERITY_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.severity && <p className="text-sm text-destructive">{errors.severity.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="occurredAt">Data e Hora do Incidente</Label>
          <Input id="occurredAt" type="datetime-local" {...register('occurredAt')} />
          {errors.occurredAt && <p className="text-sm text-destructive">{errors.occurredAt.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="room">Quarto / Local</Label>
          <Input id="room" placeholder="Ex: Quarto 101" {...register('room')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Incidente</Label>
        <Textarea
          id="description"
          placeholder="Descreva o que ocorreu..."
          rows={3}
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="actionTaken">Ação Tomada</Label>
        <Textarea
          id="actionTaken"
          placeholder="Descreva as ações tomadas após o incidente (opcional)..."
          rows={3}
          {...register('actionTaken')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
