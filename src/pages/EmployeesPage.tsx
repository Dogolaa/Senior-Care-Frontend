import { useState } from 'react'
import { UserPlus, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmployeeCard } from '@/features/employees/components/EmployeeCard'
import { PromoteEmployeeDialog } from '@/features/employees/components/PromoteEmployeeDialog'
import { EditEmployeeDialog } from '@/features/employees/components/EditEmployeeDialog'
import { useEmployees, useDemoteEmployee } from '@/features/employees/hooks/useEmployees'
import type { EmployeeDetailsDTO } from '@/types/api'

export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [promoteOpen, setPromoteOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EmployeeDetailsDTO | null>(null)
  const [demoteTarget, setDemoteTarget] = useState<EmployeeDetailsDTO | null>(null)

  const { data: employees, isLoading } = useEmployees()
  const { mutate: demote, isPending: isDemoting } = useDemoteEmployee()

  const filtered = (employees ?? []).filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      (e.specialization ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Funcionários"
        description={employees ? `${employees.length} membro${employees.length !== 1 ? 's' : ''} na equipe` : 'Equipe da instituição'}
        action={
          <Button onClick={() => setPromoteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Adicionar Funcionário
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar por nome, cargo ou especialização..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum resultado encontrado' : 'Nenhum funcionário cadastrado'}
          description={search ? `Não encontramos nenhum funcionário para "${search}".` : 'Adicione membros da equipe para que possam acessar o sistema.'}
          actionLabel={!search ? 'Adicionar Funcionário' : undefined}
          onAction={!search ? () => setPromoteOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((emp) => (
            <EmployeeCard
              key={emp.employeeId}
              employee={emp}
              onEdit={setEditTarget}
              onDemote={setDemoteTarget}
            />
          ))}
        </div>
      )}

      <PromoteEmployeeDialog open={promoteOpen} onOpenChange={setPromoteOpen} />

      <EditEmployeeDialog
        employee={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!demoteTarget}
        onOpenChange={(open) => !open && setDemoteTarget(null)}
        title="Remover da equipe?"
        description={`Tem certeza que deseja remover ${demoteTarget?.name} da equipe? O usuário continuará cadastrado no sistema, mas perderá as permissões do cargo.`}
        confirmLabel="Sim, remover"
        isLoading={isDemoting}
        onConfirm={() => {
          if (!demoteTarget) return
          demote(demoteTarget.employeeId, { onSuccess: () => setDemoteTarget(null) })
        }}
      />
    </div>
  )
}
