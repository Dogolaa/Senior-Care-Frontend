import { useState } from 'react'
import { Heart, UserPlus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AdmitResidentDialog } from '@/features/residents/components/AdmitResidentDialog'
import { EditResidentDialog } from '@/features/residents/components/EditResidentDialog'
import { FamilyMembersDialog } from '@/features/residents/components/FamilyMembersDialog'
import { ResidentCard } from '@/features/residents/components/ResidentCard'
import { useResidentList } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import type { ResidentDTO } from '@/types/api'

const PAGE_SIZE = 10

export function ResidentsPage() {
  const [admitOpen, setAdmitOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ResidentDTO | null>(null)
  const [familyTarget, setFamilyTarget] = useState<ResidentDTO | null>(null)
  const [page, setPage] = useState(0)

  const { role, userId } = useAuthStore()
  const canManage = hasPermission(role, 'MANAGE_RESIDENTS')
  const canManageFamilyMembers = hasPermission(role, 'CREATE_FAMILY_MEMBER')

  const { data, isLoading, isError, error } = useResidentList(role, userId, page, PAGE_SIZE)

  const residents = data?.residents ?? []
  const pageInfo = data?.pageInfo
  const totalPages = pageInfo?.totalPages ?? 0
  const totalElements = pageInfo?.totalElements ?? 0

  const is500 = (error as { response?: { status: number } })?.response?.status === 500

  return (
    <div>
      <PageHeader
        title="Residentes"
        description={
          totalElements > 0
            ? `${totalElements} residente${totalElements !== 1 ? 's' : ''} cadastrado${totalElements !== 1 ? 's' : ''}`
            : 'Gerencie os residentes da instituição'
        }
        action={
          canManage ? (
            <Button onClick={() => setAdmitOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Admitir Residente
            </Button>
          ) : undefined
        }
      />

      {isLoading && <TableSkeleton rows={6} />}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">
              {is500 ? 'Erro ao carregar residentes' : 'Não foi possível carregar os dados'}
            </p>
            <p className="text-sm text-red-700 mt-0.5">
              {is500
                ? 'Houve um erro interno no servidor. Tente recarregar a página ou contate o suporte.'
                : 'Verifique sua conexão e tente novamente.'}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && residents.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Nenhum residente cadastrado"
          description="Clique em 'Admitir Residente' para cadastrar o primeiro residente."
          actionLabel="Admitir Residente"
          onAction={() => setAdmitOpen(true)}
        />
      )}

      {residents.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {residents.map((resident) => (
              <ResidentCard
                key={resident.id}
                resident={resident}
                onEdit={canManage ? setEditTarget : undefined}
                onFamilyMembers={canManageFamilyMembers ? setFamilyTarget : undefined}
              />
            ))}
          </div>

          {pageInfo && totalPages > 1 && (
            <Card className="mt-6">
              <CardContent className="p-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages} · {totalElements} residentes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {canManage && (
        <>
          <AdmitResidentDialog open={admitOpen} onOpenChange={setAdmitOpen} />
          <EditResidentDialog
            resident={editTarget}
            open={!!editTarget}
            onOpenChange={(open) => !open && setEditTarget(null)}
          />
        </>
      )}

      {familyTarget && (
        <FamilyMembersDialog
          resident={familyTarget}
          open={!!familyTarget}
          onOpenChange={(open) => !open && setFamilyTarget(null)}
          canManage={canManageFamilyMembers}
        />
      )}
    </div>
  )
}
