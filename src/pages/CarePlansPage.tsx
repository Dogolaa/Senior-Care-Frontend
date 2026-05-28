import { useState, useMemo, useEffect, useRef } from 'react'
import { ClipboardList, Plus, Pencil, Trash2, Search, Target, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { CarePlanForm } from '@/features/care-plans/components/CarePlanForm'
import {
  useCarePlansByResident,
  useCreateCarePlan,
  useUpdateCarePlan,
  useDeleteCarePlan,
} from '@/features/care-plans/hooks/useCarePlans'
import { useResidentSearch, useLinkedResidents } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import { CARE_PLAN_STATUS_LABELS, CARE_PLAN_STATUS_COLORS } from '@/lib/constants'
import type { CarePlanDTO, ResidentDTO } from '@/types/api'
import type { CarePlanFormData } from '@/features/care-plans/components/CarePlanForm'

function StatusBadge({ status }: { status: string }) {
  const color = CARE_PLAN_STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {CARE_PLAN_STATUS_LABELS[status] ?? status}
    </span>
  )
}

function CarePlanCard({
  plan,
  canManage,
  onEdit,
  onDelete,
}: {
  plan: CarePlanDTO
  canManage: boolean
  onEdit: (p: CarePlanDTO) => void
  onDelete: (p: CarePlanDTO) => void
}) {
  return (
    <Card className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800">{plan.title}</span>
              <StatusBadge status={plan.status} />
            </div>

            {plan.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{plan.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500">
              <span>
                Início:{' '}
                {format(new Date(plan.startDate + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              {plan.endDate && (
                <span>
                  Término:{' '}
                  {format(new Date(plan.endDate + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              )}
            </div>

            {plan.goals.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Target className="h-3.5 w-3.5" />
                  Objetivos
                </div>
                <ul className="space-y-0.5">
                  {plan.goals.map((goal, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-slate-400 shrink-0">{i + 1}.</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.interventions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Intervenções
                </div>
                <ul className="space-y-0.5">
                  {plan.interventions.map((intervention, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-slate-400 shrink-0">{i + 1}.</span>
                      {intervention}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {canManage && (
            <div className="flex gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Editar plano"
                onClick={() => onEdit(plan)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                aria-label="Remover plano"
                onClick={() => onDelete(plan)}
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

function CarePlansList({
  resident,
  canManage,
}: {
  resident: ResidentDTO
  canManage: boolean
}) {
  const { userId } = useAuthStore()
  const { data: plans, isLoading } = useCarePlansByResident(resident.id)
  const { mutate: create, isPending: creating } = useCreateCarePlan(resident.id)
  const { mutate: update, isPending: updating } = useUpdateCarePlan(resident.id)
  const { mutate: remove, isPending: deleting } = useDeleteCarePlan(resident.id)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<CarePlanDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CarePlanDTO | null>(null)

  const handleCreate = (data: CarePlanFormData) => {
    create(
      {
        residentId: resident.id,
        responsibleId: userId!,
        title: data.title,
        description: data.description || null,
        goals: data.goals.map((g) => g.value),
        interventions: data.interventions.map((i) => i.value),
        startDate: data.startDate,
        endDate: data.endDate || null,
      },
      { onSuccess: () => setShowCreate(false) }
    )
  }

  const handleUpdate = (data: CarePlanFormData) => {
    if (!editTarget) return
    update(
      {
        id: editTarget.id,
        data: {
          title: data.title,
          description: data.description || null,
          goals: data.goals.map((g) => g.value),
          interventions: data.interventions.map((i) => i.value),
          startDate: data.startDate,
          endDate: data.endDate || null,
          status: data.status as CarePlanDTO['status'],
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
            <ClipboardList className="h-5 w-5 text-blue-500" />
            {resident.name}
          </CardTitle>
          {canManage && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Plano
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : !plans || plans.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum plano de cuidado"
            description={
              canManage
                ? 'Crie o primeiro plano de cuidado para este residente.'
                : 'Ainda não há planos de cuidado registrados para este residente.'
            }
          />
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <CarePlanCard
                key={plan.id}
                plan={plan}
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
            <DialogTitle>Novo Plano de Cuidado</DialogTitle>
          </DialogHeader>
          <CarePlanForm
            onSubmit={handleCreate}
            isPending={creating}
            onCancel={() => setShowCreate(false)}
            submitLabel="Criar Plano"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano de Cuidado</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <CarePlanForm
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
        title="Remover Plano de Cuidado"
        description={`Tem certeza que deseja remover o plano "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
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

export function CarePlansPage() {
  const { role, userId } = useAuthStore()
  const canManage = hasPermission(role, 'MANAGE_CARE_PLANS')
  const isFamily = role === 'FAMILY_MEMBER'
  const canListAll = hasPermission(role, 'VIEW_RESIDENTS') || hasPermission(role, 'MANAGE_RESIDENTS')

  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const [search, setSearch] = useState('')
  const plansRef = useRef<HTMLDivElement>(null)

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
    setTimeout(() => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div>
      <PageHeader
        title="Plano de Cuidados"
        description={
          canManage
            ? 'Gerencie os planos de cuidado individualizados dos residentes'
            : 'Acompanhe os planos de cuidado dos residentes'
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
          icon={ClipboardList}
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
        <div ref={plansRef} className="scroll-mt-4">
          <CarePlansList resident={selectedResident} canManage={canManage} />
        </div>
      )}
    </div>
  )
}
