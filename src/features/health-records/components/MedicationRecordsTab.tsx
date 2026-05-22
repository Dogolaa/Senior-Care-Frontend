import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, ClipboardList, Eye, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { MedicationSearchCombobox } from '@/features/medications/components/MedicationSearchCombobox'
import { MedRecordPhotoSection } from './MedRecordPhotoSection'
import { useMedicationRecords, useCreateMedicationRecord } from '@/features/medications/hooks/useMedications'
import { useAuthStore } from '@/store/authStore'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { MedicationDTO } from '@/types/api'

const medicationRecordSchema = z.object({
  administrationDate: z.string().min(1, 'Data obrigatória'),
  administrationTime: z.string().min(1, 'Hora obrigatória'),
  dose: z.string().min(1, 'Dose obrigatória'),
})
type MedicationRecordFormData = z.infer<typeof medicationRecordSchema>

function pad(n: number) { return String(n).padStart(2, '0') }
function localDateNow() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function localTimeNow() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function formatAdminDate(s: string) {
  return s.includes('T') ? formatDateTime(s) : formatDate(s)
}

export function MedicationRecordsTab({
  residentId,
  canRegister,
}: {
  residentId: string
  canRegister: boolean
}) {
  const { data: records, isLoading } = useMedicationRecords(residentId)
  const { mutate: create, isPending } = useCreateMedicationRecord()
  const userId = useAuthStore((s) => s.userId)!
  const [showForm, setShowForm] = useState(false)
  const [selectedMed, setSelectedMed] = useState<MedicationDTO | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MedicationRecordFormData>({
    resolver: zodResolver(medicationRecordSchema),
    defaultValues: { administrationDate: localDateNow(), administrationTime: localTimeNow(), dose: '' },
  })

  const setNow = () => {
    setValue('administrationDate', localDateNow())
    setValue('administrationTime', localTimeNow())
  }

  const onSubmit = (data: MedicationRecordFormData) => {
    if (!selectedMed) return
    const administrationDate = `${data.administrationDate}T${data.administrationTime}`
    create(
      { residentId, medicationId: selectedMed.id, administeredById: userId, administrationDate, dose: data.dose },
      {
        onSuccess: () => {
          reset({ administrationDate: localDateNow(), administrationTime: localTimeNow(), dose: '' })
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
        <p className="text-sm text-muted-foreground">{records?.length ?? 0} administração(ões) registrada(s)</p>
        {canRegister ? (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancelar' : 'Registrar Administração'}
          </Button>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Somente leitura
          </Badge>
        )}
      </div>

      {canRegister && showForm && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Registrar Administração</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Medicamento</Label>
                <MedicationSearchCombobox onSelect={setSelectedMed} placeholder="Buscar medicamento..." />
              </div>
              <div className="space-y-2">
                <Label>Dose administrada</Label>
                <Input placeholder="Ex: 500mg" {...register('dose')} />
                {errors.dose && <p className="text-sm text-destructive">{errors.dose.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Data e hora de administração</Label>
                  <button
                    type="button"
                    onClick={setNow}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    Agora
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-[3]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <input
                      type="date"
                      {...register('administrationDate')}
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <div className="relative flex-[2]">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <input
                      type="time"
                      {...register('administrationTime')}
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                </div>
                {(errors.administrationDate || errors.administrationTime) && (
                  <p className="text-sm text-destructive">Data e hora obrigatórias</p>
                )}
              </div>
              <Button type="submit" disabled={isPending || !selectedMed} className="w-full">
                {isPending ? 'Salvando...' : 'Registrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {(!records || records.length === 0) && !showForm ? (
        <EmptyState icon={ClipboardList} title="Nenhuma administração" description="Nenhuma administração de medicamento registrada." />
      ) : (
        <div className="space-y-2">
          {(records ?? []).map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{r.medicationCommercialName}</p>
                    <p className="text-sm text-muted-foreground">Dose: {r.dose}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatAdminDate(r.administrationDate)}</p>
                </div>
                <MedRecordPhotoSection recordId={r.id} photoUrls={r.photoUrls ?? []} canAdd={canRegister} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
