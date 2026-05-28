import { useState, useMemo, useRef, useEffect } from 'react'
import { Activity, Plus, Clock, Eye, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { useActivityRecord, useCreateActivityRecord, useAddActivity, useAddActivityPhoto } from '@/features/activities/hooks/useActivityRecord'
import { useResidentSearch, useLinkedResidents } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import { formatDate, formatDateTime } from '@/lib/utils'
import { PhotoUploader, PhotoGallery } from '@/components/shared/PhotoUploader'
import type { ResidentDTO } from '@/types/api'

const activitySchema = z.object({
  activityName: z.string().min(2, 'Nome da atividade obrigatório'),
  description: z.string().min(2, 'Descrição obrigatória'),
  startDateTime: z.string().min(1, 'Data/hora de início obrigatória'),
  endDateTime: z.string().min(1, 'Data/hora de fim obrigatória'),
  notes: z.string().optional().default(''),
})

type ActivityFormData = z.infer<typeof activitySchema>

function ActivityPhotoSection({ historyId, photoUrls, canAdd }: { historyId: string; photoUrls: string[]; canAdd: boolean }) {
  const { mutate: addPhoto } = useAddActivityPhoto()
  if (photoUrls.length === 0 && !canAdd) return null
  return (
    <div className="mt-3 space-y-2">
      <PhotoGallery urls={photoUrls} />
      {canAdd && (
        <PhotoUploader
          label="Adicionar foto"
          onUploaded={(url) => addPhoto({ historyId, photoUrl: url })}
        />
      )}
    </div>
  )
}

function ActivityView({ residentId, readOnly }: { residentId: string; readOnly: boolean }) {
  const { data: record, isLoading } = useActivityRecord(residentId)
  const { mutate: createRecord, isPending: creatingRecord } = useCreateActivityRecord()
  const { mutate: addAct, isPending: addingAct } = useAddActivity(residentId)
  const [showForm, setShowForm] = useState(false)
  const userId = useAuthStore((s) => s.userId)!

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
  })

  const onAddActivity = (data: ActivityFormData) => {
    if (!record) {
      createRecord(
        { residentId, conductedById: userId },
        {
          onSuccess: () => {
            setShowForm(false)
            reset()
          },
        }
      )
      return
    }
    addAct(
      { id: record.id, data: { ...data, notes: data.notes ?? '', conductedById: userId } },
      { onSuccess: () => { setShowForm(false); reset() } }
    )
  }

  if (isLoading) {
    return <div className="flex items-center gap-2 py-8 text-muted-foreground"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />Carregando atividades...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {record ? `${record.history.length} atividade(s) registrada(s)` : 'Nenhuma atividade ainda'}
        </p>
        {readOnly ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Somente leitura
          </Badge>
        ) : (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancelar' : 'Registrar Atividade'}
          </Button>
        )}
      </div>

      {!readOnly && showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nova Atividade</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onAddActivity)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Atividade</Label>
                <Input placeholder="Ex: Fisioterapia, Caminhada, Leitura" {...register('activityName')} />
                {errors.activityName && <p className="text-sm text-destructive">{errors.activityName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva a atividade realizada..." {...register('description')} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="datetime-local" {...register('startDateTime')} />
                  {errors.startDateTime && <p className="text-sm text-destructive">{errors.startDateTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input type="datetime-local" {...register('endDateTime')} />
                  {errors.endDateTime && <p className="text-sm text-destructive">{errors.endDateTime.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Observações adicionais..." {...register('notes')} />
              </div>
              <Button type="submit" disabled={addingAct || creatingRecord} className="w-full">
                {addingAct || creatingRecord ? 'Salvando...' : 'Registrar Atividade'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {(!record || record.history.length === 0) && !showForm && (
        <EmptyState
          icon={Activity}
          title="Nenhuma atividade registrada"
          description={readOnly ? 'Nenhuma atividade registrada para este residente.' : 'Registre a primeira atividade deste residente.'}
        />
      )}

      {record && record.history.length > 0 && (
        <div className="space-y-3">
          {[...record.history].reverse().map((h) => (
            <Card key={h.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{h.activityName}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(h.recordedAt)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{h.description}</p>
                    {h.notes && <p className="text-sm text-muted-foreground mt-1 italic">"{h.notes}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(h.startDateTime)} → {formatDateTime(h.endDateTime)}
                </div>
                <ActivityPhotoSection
                  historyId={h.id}
                  photoUrls={h.photoUrls ?? []}
                  canAdd={!readOnly}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function ActivitiesPage() {
  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const [search, setSearch] = useState('')
  const activityViewRef = useRef<HTMLDivElement>(null)
  const { role, userId } = useAuthStore()
  const readOnly = !hasPermission(role, 'MANAGE_ACTIVITIES')
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

  useEffect(() => {
    if (isFamily && linkedResidents?.length === 1 && !selectedResident) {
      setSelectedResident(linkedResidents[0])
    }
  }, [isFamily, linkedResidents, selectedResident])

  const handleSelect = (resident: ResidentDTO) => {
    setSelectedResident(resident)
    setTimeout(() => activityViewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div>
      <PageHeader
        title="Atividades"
        description={readOnly ? 'Acompanhe as atividades dos residentes' : 'Registre e consulte as atividades dos residentes'}
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
          icon={Activity}
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
        <div ref={activityViewRef} className="scroll-mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {selectedResident.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Quarto {selectedResident.room}</p>
            </CardHeader>
            <CardContent>
              <ActivityView residentId={selectedResident.id} readOnly={readOnly} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
