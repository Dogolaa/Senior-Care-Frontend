import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pill, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import { EmptyState } from '@/components/shared/EmptyState'
import { MedicationSearchCombobox } from '@/features/medications/components/MedicationSearchCombobox'
import { usePrescriptions, useCreatePrescription } from '@/features/medications/hooks/useMedications'
import { formatDate } from '@/lib/utils'
import type { MedicationDTO } from '@/types/api'

const prescriptionSchema = z.object({
  dosage: z.string().min(1, 'Posologia obrigatória'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  endDate: z.string().min(1, 'Data de término obrigatória'),
})
type PrescriptionFormData = z.infer<typeof prescriptionSchema>

export function PrescriptionsTab({
  healthRecordId,
  canPrescribe,
}: {
  healthRecordId: string
  canPrescribe: boolean
}) {
  const { data: prescriptions, isLoading } = usePrescriptions(healthRecordId)
  const { mutate: create, isPending } = useCreatePrescription()
  const [showForm, setShowForm] = useState(false)
  const [selectedMed, setSelectedMed] = useState<MedicationDTO | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrescriptionFormData>({ resolver: zodResolver(prescriptionSchema) })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const onSubmit = (data: PrescriptionFormData) => {
    if (!selectedMed) return
    create(
      { medicalRecordId: healthRecordId, medicationId: selectedMed.id, ...data },
      {
        onSuccess: () => {
          reset()
          setSelectedMed(null)
          setShowForm(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{prescriptions?.length ?? 0} prescrição(ões) ativa(s)</p>
        {canPrescribe ? (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancelar' : 'Nova Prescrição'}
          </Button>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Somente leitura
          </Badge>
        )}
      </div>

      {canPrescribe && showForm && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Nova Prescrição</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Medicamento</Label>
                <MedicationSearchCombobox onSelect={setSelectedMed} placeholder="Buscar medicamento..." />
                {!selectedMed && (
                  <p className="text-xs text-muted-foreground">Selecione um medicamento para continuar</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Posologia</Label>
                <Input placeholder="Ex: 500mg 2x ao dia" {...register('dosage')} />
                {errors.dosage && <p className="text-sm text-destructive">{errors.dosage.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <DatePicker
                    value={startDate}
                    onChange={(v) => setValue('startDate', v, { shouldValidate: true })}
                    placeholder="Selecionar"
                    fromYear={new Date().getFullYear() - 1}
                    toYear={new Date().getFullYear() + 2}
                  />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <DatePicker
                    value={endDate}
                    onChange={(v) => setValue('endDate', v, { shouldValidate: true })}
                    placeholder="Selecionar"
                    fromYear={new Date().getFullYear() - 1}
                    toYear={new Date().getFullYear() + 2}
                  />
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                </div>
              </div>
              <Button type="submit" disabled={isPending || !selectedMed} className="w-full">
                {isPending ? 'Salvando...' : 'Salvar Prescrição'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {(!prescriptions || prescriptions.length === 0) && !showForm ? (
        <EmptyState icon={Pill} title="Nenhuma prescrição" description="Nenhuma prescrição registrada para este prontuário." />
      ) : (
        <div className="space-y-2">
          {(prescriptions ?? []).map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{p.medicationCommercialName}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{p.dosage}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0">
                    <p>{formatDate(p.startDate)} →</p>
                    <p>{formatDate(p.endDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
