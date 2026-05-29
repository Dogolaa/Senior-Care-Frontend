import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { CARE_PLAN_STATUS_OPTIONS } from '@/lib/constants'
import type { CarePlanDTO } from '../../../types/api'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  goals: z.array(z.object({ value: z.string().min(1, 'Objetivo não pode estar vazio') })),
  interventions: z.array(z.object({ value: z.string().min(1, 'Intervenção não pode estar vazia') })),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  endDate: z.string().optional(),
  status: z.string().min(1, 'Status obrigatório'),
})

export type CarePlanFormData = z.infer<typeof schema>

interface CarePlanFormProps {
  initialData?: CarePlanDTO
  onSubmit: (data: CarePlanFormData) => void
  isPending: boolean
  onCancel: () => void
  submitLabel?: string
}

export function CarePlanForm({
  initialData,
  onSubmit,
  isPending,
  onCancel,
  submitLabel = 'Salvar',
}: CarePlanFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CarePlanFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      goals: [],
      interventions: [],
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const { fields: goalFields, append: addGoal, remove: removeGoal } = useFieldArray({ control, name: 'goals' })
  const { fields: interventionFields, append: addIntervention, remove: removeIntervention } = useFieldArray({ control, name: 'interventions' })

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description ?? '',
        goals: initialData.goals.map((v) => ({ value: v })),
        interventions: initialData.interventions.map((v) => ({ value: v })),
        startDate: initialData.startDate,
        endDate: initialData.endDate ?? '',
        status: initialData.status,
      })
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder="Ex: Plano de reabilitação motora" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreva os objetivos gerais do plano (opcional)..."
          rows={2}
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <DatePicker
            value={startDate}
            onChange={(v) => setValue('startDate', v, { shouldValidate: true })}
            placeholder="Selecionar"
            fromYear={new Date().getFullYear() - 1}
            toYear={new Date().getFullYear() + 5}
          />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Data de Término <span className="text-muted-foreground text-xs font-normal">(opcional)</span></Label>
          <DatePicker
            value={endDate}
            onChange={(v) => setValue('endDate', v)}
            placeholder="Selecionar"
            fromYear={new Date().getFullYear() - 1}
            toYear={new Date().getFullYear() + 5}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          defaultValue={initialData?.status ?? 'ACTIVE'}
          onValueChange={(v) => setValue('status', v)}
        >
          <SelectTrigger><SelectValue placeholder="Selecionar status" /></SelectTrigger>
          <SelectContent>
            {CARE_PLAN_STATUS_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Objetivos</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addGoal({ value: '' })}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar
          </Button>
        </div>
        {goalFields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center border rounded-md">
            Nenhum objetivo adicionado
          </p>
        ) : (
          <div className="space-y-2">
            {goalFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder={`Objetivo ${index + 1}`}
                  {...register(`goals.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeGoal(index)}
                  aria-label="Remover objetivo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.goals && (
              <p className="text-sm text-destructive">
                {errors.goals.root?.message ?? 'Verifique os objetivos'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Intervenções</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addIntervention({ value: '' })}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar
          </Button>
        </div>
        {interventionFields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center border rounded-md">
            Nenhuma intervenção adicionada
          </p>
        ) : (
          <div className="space-y-2">
            {interventionFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder={`Intervenção ${index + 1}`}
                  {...register(`interventions.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeIntervention(index)}
                  aria-label="Remover intervenção"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.interventions && (
              <p className="text-sm text-destructive">
                {errors.interventions.root?.message ?? 'Verifique as intervenções'}
              </p>
            )}
          </div>
        )}
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
