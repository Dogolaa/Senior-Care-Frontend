import { useState, useMemo, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileHeart, ChevronDown, ChevronUp, Clock, Eye, Plus, Pill, ClipboardList, Calendar, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { VitalsDisplay } from '@/features/health-records/components/VitalsDisplay'
import { HealthRecordForm } from '@/features/health-records/components/HealthRecordForm'
import { MedicationSearchCombobox } from '@/features/medications/components/MedicationSearchCombobox'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { useHealthRecord } from '@/features/health-records/hooks/useHealthRecord'
import { usePrescriptions, useCreatePrescription, useMedicationRecords, useCreateMedicationRecord, useAddMedicationRecordPhoto } from '@/features/medications/hooks/useMedications'
import { useAddHistoryPhoto } from '@/features/health-records/hooks/useHealthRecord'
import { PhotoUploader, PhotoGallery } from '@/components/shared/PhotoUploader'
import { useResidentSearch, useLinkedResidents } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import { formatDate, formatDateTime } from '@/lib/utils'
import { VITAL_SOURCE_LABELS } from '@/lib/constants'
import type { MedicationDTO, ResidentDTO } from '@/types/api'

// ─── Prescrições ───────────────────────────────────────────────────────────────

const prescriptionSchema = z.object({
  dosage: z.string().min(1, 'Posologia obrigatória'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  endDate: z.string().min(1, 'Data de término obrigatória'),
})
type PrescriptionFormData = z.infer<typeof prescriptionSchema>

function PrescriptionsTab({
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
  })

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
    return <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {prescriptions?.length ?? 0} prescrição(ões) ativa(s)
        </p>
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
          <CardHeader><CardTitle className="text-sm">Nova Prescrição</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Medicamento</Label>
                <MedicationSearchCombobox
                  onSelect={setSelectedMed}
                  placeholder="Buscar medicamento..."
                />
                {!selectedMed && <p className="text-xs text-muted-foreground">Selecione um medicamento para continuar</p>}
              </div>
              <div className="space-y-2">
                <Label>Posologia</Label>
                <Input placeholder="Ex: 500mg 2x ao dia" {...register('dosage')} />
                {errors.dosage && <p className="text-sm text-destructive">{errors.dosage.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="date" {...register('startDate')} />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input type="date" {...register('endDate')} />
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

// ─── Medicamentos Administrados ────────────────────────────────────────────────

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

function MedicationRecordsTab({
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MedicationRecordFormData>({
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
    return <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {records?.length ?? 0} administração(ões) registrada(s)
        </p>
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
          <CardHeader><CardTitle className="text-sm">Registrar Administração</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Medicamento</Label>
                <MedicationSearchCombobox
                  onSelect={setSelectedMed}
                  placeholder="Buscar medicamento..."
                />
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
                  <p className="text-xs text-muted-foreground shrink-0">
                    {formatAdminDate(r.administrationDate)}
                  </p>
                </div>
                <MedRecordPhotoSection
                  recordId={r.id}
                  photoUrls={r.photoUrls ?? []}
                  canAdd={canRegister}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Seções de fotos ────────────────────────────────────────────────────────────

function HistoryPhotoSection({ historyId, photoUrls, readOnly }: { historyId: string; photoUrls: string[]; readOnly: boolean }) {
  const { mutate: addPhoto } = useAddHistoryPhoto()
  if (photoUrls.length === 0 && readOnly) return null
  return (
    <div className="mt-3 space-y-2">
      <PhotoGallery urls={photoUrls} />
      {!readOnly && (
        <PhotoUploader
          label="Adicionar foto"
          onUploaded={(url) => addPhoto({ historyId, photoUrl: url })}
        />
      )}
    </div>
  )
}

function MedRecordPhotoSection({ recordId, photoUrls, canAdd }: { recordId: string; photoUrls: string[]; canAdd: boolean }) {
  const { mutate: addPhoto } = useAddMedicationRecordPhoto()
  if (photoUrls.length === 0 && !canAdd) return null
  return (
    <div className="mt-3 space-y-2">
      <PhotoGallery urls={photoUrls} />
      {canAdd && (
        <PhotoUploader
          label="Adicionar foto"
          onUploaded={(url) => addPhoto({ recordId, photoUrl: url })}
        />
      )}
    </div>
  )
}

// ─── Sinais Vitais ─────────────────────────────────────────────────────────────

function VitalsTab({ residentId, readOnly }: { residentId: string; readOnly: boolean }) {
  const { data: record, isLoading, error } = useHealthRecord(residentId)
  const [showForm, setShowForm] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  const is404 = (error as { response?: { status: number } })?.response?.status === 404

  if (isLoading) {
    return <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />Carregando prontuário...</div>
  }

  if (is404 || !record) {
    if (readOnly) {
      return <EmptyState icon={FileHeart} title="Nenhum prontuário encontrado" description="Este residente ainda não possui um prontuário registrado." />
    }
    return (
      <div className="space-y-4">
        <EmptyState icon={FileHeart} title="Nenhum prontuário encontrado" description="Crie o primeiro registro de sinais vitais abaixo." />
        <Card>
          <CardHeader><CardTitle className="text-sm">Criar Prontuário</CardTitle></CardHeader>
          <CardContent><HealthRecordForm residentId={residentId} /></CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Última atualização: {formatDate(record.lastUpdated)}</p>
        {readOnly ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Somente leitura
          </Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : 'Atualizar Sinais Vitais'}
          </Button>
        )}
      </div>

      <VitalsDisplay record={record} />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Altura</p>
          <p className="font-semibold">{record.height} m</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Peso</p>
          <p className="font-semibold">{record.weight} kg</p>
        </div>
      </div>

      {!readOnly && showForm && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Atualizar Prontuário</CardTitle></CardHeader>
          <CardContent><HealthRecordForm residentId={residentId} existing={record} onSuccess={() => setShowForm(false)} /></CardContent>
        </Card>
      )}

      {record.history && record.history.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            <Clock className="h-4 w-4" />
            Histórico ({record.history.length} registros)
            {historyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {historyExpanded && (
            <div className="mt-3 space-y-2">
              {record.history.map((h) => (
                <Card key={h.id} className="bg-muted/30">
                  <CardContent className="p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{formatDate(h.updateDate)}</span>
                      <span className="text-xs text-muted-foreground">{VITAL_SOURCE_LABELS[h.source] ?? h.source}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>FC: <strong className="text-foreground">{h.heartRate} bpm</strong></span>
                      <span>Temp: <strong className="text-foreground">{h.temperature}°C</strong></span>
                      <span>Sat: <strong className="text-foreground">{h.saturation}%</strong></span>
                      <span>PA: <strong className="text-foreground">{h.bloodPressure}</strong></span>
                      <span>IMC: <strong className="text-foreground">{h.imc.toFixed(1)}</strong></span>
                    </div>
                    <HistoryPhotoSection historyId={h.id} photoUrls={h.photoUrls} readOnly={readOnly} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página Principal ──────────────────────────────────────────────────────────

function ResidentHealthView({ resident, readOnly }: { resident: ResidentDTO; readOnly: boolean }) {
  const { data: record } = useHealthRecord(resident.id)
  const { role } = useAuthStore()
  const canPrescribe = hasPermission(role, 'PRESCRIBE_MEDICATION')
  const canRegisterMed = hasPermission(role, 'MANAGE_HEALTH_RECORDS')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileHeart className="h-5 w-5 text-primary" />
          {resident.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Quarto {resident.room}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vitals">
          <TabsList className="w-full">
            <TabsTrigger value="vitals" className="flex-1">Sinais Vitais</TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex-1">Prescrições</TabsTrigger>
            <TabsTrigger value="medications" className="flex-1">Medicamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <VitalsTab residentId={resident.id} readOnly={readOnly} />
          </TabsContent>

          <TabsContent value="prescriptions">
            {record ? (
              <PrescriptionsTab healthRecordId={record.id} canPrescribe={canPrescribe && !readOnly} />
            ) : (
              <EmptyState icon={Pill} title="Prontuário não encontrado" description="Crie primeiro o prontuário na aba de Sinais Vitais." />
            )}
          </TabsContent>

          <TabsContent value="medications">
            <MedicationRecordsTab residentId={resident.id} canRegister={canRegisterMed && !readOnly} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export function HealthRecordsPage() {
  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const [search, setSearch] = useState('')
  const healthViewRef = useRef<HTMLDivElement>(null)
  const { role, userId } = useAuthStore()
  const readOnly = !hasPermission(role, 'MANAGE_HEALTH_RECORDS')
  const isFamily = role === 'FAMILY_MEMBER'
  const canListAll = hasPermission(role, 'MANAGE_RESIDENTS') || hasPermission(role, 'VIEW_RESIDENTS')

  const { data: allResidents, isLoading: allLoading } = useResidentSearch(canListAll)
  const { data: linkedResidents, isLoading: linkedLoading } = useLinkedResidents(userId, isFamily)

  const residentsLoading = isFamily ? linkedLoading : allLoading
  const baseResidents = isFamily ? (linkedResidents ?? []) : (allResidents ?? [])

  const filtered = useMemo(() => {
    if (isFamily) return baseResidents
    const q = search.trim().toLowerCase()
    if (!q) return baseResidents
    const digits = q.replace(/\D/g, '')
    return baseResidents.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (digits.length > 0 && r.cpf.replace(/\D/g, '').includes(digits)),
    )
  }, [baseResidents, search, isFamily])

  // auto-seleciona quando familiar tem exatamente 1 residente vinculado
  useEffect(() => {
    if (isFamily && linkedResidents?.length === 1 && !selectedResident) {
      setSelectedResident(linkedResidents[0])
    }
  }, [isFamily, linkedResidents, selectedResident])

  const handleSelect = (resident: ResidentDTO) => {
    setSelectedResident(resident)
    setTimeout(() => healthViewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div>
      <PageHeader
        title="Prontuários"
        description={readOnly ? 'Acompanhe os registros de saúde' : 'Consulte e atualize os registros de saúde dos residentes'}
      />

      {!isFamily && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Filtrar residentes por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {residentsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {Array.from({ length: isFamily ? 1 : 8 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileHeart}
          title={isFamily ? 'Nenhum residente vinculado' : search ? 'Nenhum residente encontrado' : 'Nenhum residente cadastrado'}
          description={
            isFamily
              ? 'Você ainda não está vinculado a nenhum residente. Entre em contato com o gestor da instituição.'
              : search
              ? `Não encontramos residentes para "${search}".`
              : 'Não há residentes cadastrados no sistema.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {filtered.map((r) => (
            <ResidentPickerCard
              key={r.id}
              resident={r}
              selected={selectedResident?.id === r.id}
              onClick={() => handleSelect(r)}
            />
          ))}
        </div>
      )}

      {selectedResident && (
        <div ref={healthViewRef} className="scroll-mt-4">
          <ResidentHealthView resident={selectedResident} readOnly={readOnly} />
        </div>
      )}
    </div>
  )
}
