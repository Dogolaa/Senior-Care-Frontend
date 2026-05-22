import { useState, useMemo, useEffect, useRef } from 'react'
import { AlertTriangle, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { IncidentForm } from '@/features/incidents/components/IncidentForm'
import { SeverityBadge, TypeBadge } from '@/features/incidents/components/IncidentBadges'
import {
  useIncidentsByResident,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
} from '@/features/incidents/hooks/useIncidents'
import { useResidentSearch, useLinkedResidents } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import type { IncidentDTO, ResidentDTO } from '@/types/api'
import type { IncidentFormData } from '@/features/incidents/components/IncidentForm'

function toIso(datetimeLocal: string): string {
  return datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal
}

function IncidentCard({
  incident,
  canManage,
  onEdit,
  onDelete,
}: {
  incident: IncidentDTO
  canManage: boolean
  onEdit: (i: IncidentDTO) => void
  onDelete: (i: IncidentDTO) => void
}) {
  const occurredAt = parseISO(incident.occurredAt)

  return (
    <Card className="border-l-4 border-l-slate-300 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={incident.incidentType} />
              <SeverityBadge severity={incident.severity} />
              {incident.room && (
                <span className="text-xs text-slate-500">{incident.room}</span>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{incident.description}</p>

            {incident.actionTaken && (
              <div className="rounded-md bg-slate-50 p-2.5">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Ação tomada</p>
                <p className="text-sm text-slate-700">{incident.actionTaken}</p>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Ocorreu em:{' '}
              {format(occurredAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>

          {canManage && (
            <div className="flex gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Editar incidente"
                onClick={() => onEdit(incident)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                aria-label="Remover incidente"
                onClick={() => onDelete(incident)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function IncidentsList({
  resident,
  canManage,
}: {
  resident: ResidentDTO
  canManage: boolean
}) {
  const { userId } = useAuthStore()
  const { data: incidents, isLoading } = useIncidentsByResident(resident.id)
  const { mutate: create, isPending: creating } = useCreateIncident(resident.id)
  const { mutate: update, isPending: updating } = useUpdateIncident(resident.id)
  const { mutate: remove, isPending: deleting } = useDeleteIncident(resident.id)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<IncidentDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IncidentDTO | null>(null)

  const handleCreate = (data: IncidentFormData) => {
    create(
      {
        residentId: resident.id,
        reportedById: userId!,
        incidentType: data.incidentType as IncidentDTO['incidentType'],
        severity: data.severity as IncidentDTO['severity'],
        description: data.description,
        actionTaken: data.actionTaken || null,
        occurredAt: toIso(data.occurredAt),
        room: data.room || null,
      },
      { onSuccess: () => setShowCreate(false) }
    )
  }

  const handleUpdate = (data: IncidentFormData) => {
    if (!editTarget) return
    update(
      {
        id: editTarget.id,
        data: {
          incidentType: data.incidentType as IncidentDTO['incidentType'],
          severity: data.severity as IncidentDTO['severity'],
          description: data.description,
          actionTaken: data.actionTaken || null,
          occurredAt: toIso(data.occurredAt),
          room: data.room || null,
        },
      },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {resident.name}
          </CardTitle>
          {canManage && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Registrar Incidente
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : !incidents || incidents.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Nenhum incidente registrado"
            description="Quando ocorrer um incidente com este residente, ele aparecerá aqui."
          />
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                canManage={canManage}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Incidente</DialogTitle>
          </DialogHeader>
          <IncidentForm
            onSubmit={handleCreate}
            isPending={creating}
            onCancel={() => setShowCreate(false)}
            submitLabel="Registrar"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Incidente</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <IncidentForm
              initialData={editTarget}
              onSubmit={handleUpdate}
              isPending={updating}
              onCancel={() => setEditTarget(null)}
              submitLabel="Salvar Alterações"
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Remover Incidente"
        description="Tem certeza que deseja remover este registro de incidente? Esta ação não pode ser desfeita."
        confirmLabel="Sim, remover"
        onConfirm={() => {
          if (deleteTarget) {
            remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
        }}
        isLoading={deleting}
      />
    </Card>
  )
}

export function IncidentsPage() {
  const { role, userId } = useAuthStore()
  const canManage = hasPermission(role, 'MANAGE_INCIDENTS')
  const isFamily = role === 'FAMILY_MEMBER'
  const canListAll = hasPermission(role, 'VIEW_RESIDENTS') || hasPermission(role, 'MANAGE_RESIDENTS')

  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const [search, setSearch] = useState('')
  const incidentsRef = useRef<HTMLDivElement>(null)

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
        (digits.length > 0 && r.cpf.replace(/\D/g, '').includes(digits))
    )
  }, [baseResidents, search, isFamily])

  useEffect(() => {
    if (isFamily && linkedResidents?.length === 1 && !selectedResident) {
      setSelectedResident(linkedResidents[0])
    }
  }, [isFamily, linkedResidents, selectedResident])

  const handleSelect = (resident: ResidentDTO) => {
    setSelectedResident(resident)
    setTimeout(() => incidentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div>
      <PageHeader
        title="Incidentes"
        description={
          canManage
            ? 'Registre e acompanhe ocorrências com os residentes'
            : 'Acompanhe os incidentes registrados'
        }
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
          icon={AlertTriangle}
          title={
            isFamily
              ? 'Nenhum residente vinculado'
              : search
              ? 'Nenhum residente encontrado'
              : 'Nenhum residente cadastrado'
          }
          description={
            isFamily
              ? 'Você ainda não está vinculado a nenhum residente.'
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
        <div ref={incidentsRef} className="scroll-mt-4">
          <IncidentsList resident={selectedResident} canManage={canManage} />
        </div>
      )}
    </div>
  )
}
