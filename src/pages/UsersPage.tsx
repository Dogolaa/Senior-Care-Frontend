import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Users, Search, ChevronLeft, ChevronRight,
  Pencil, Trash2, Mail, Phone, Calendar, ShieldAlert, AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useUserList, useUserSearch, useUpdateUser, useDeleteUser } from '@/features/users/hooks/useUsers'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import { ROLE_LABELS, ROLE_COLORS, ROLE_AVATAR_COLORS } from '@/lib/constants'
import { formatDate, formatPhone } from '@/lib/utils'
import type { UserDTO } from '@/types/api'

const PAGE_SIZE = 12

const editSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
})
type EditFormData = z.infer<typeof editSchema>

function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserDTO | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { mutate, isPending } = useUpdateUser(() => onOpenChange(false))

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: user ? { name: user.name, email: user.email, phone: user.phone ?? '' } : undefined,
  })

  const onSubmit = (data: EditFormData) => {
    if (!user) return
    mutate({ id: user.id, data })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input {...register('name')} placeholder="Nome completo" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input {...register('email')} type="email" placeholder="email@exemplo.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input {...register('phone')} placeholder="(11) 99999-9999" />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserCard({
  user,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  user: UserDTO
  canEdit: boolean
  canDelete: boolean
  onEdit: (u: UserDTO) => void
  onDelete: (u: UserDTO) => void
}) {
  const avatarColor = user.role ? (ROLE_AVATAR_COLORS[user.role] ?? 'bg-slate-500') : 'bg-slate-500'

  return (
    <Card className={`transition-shadow hover:shadow-md ${!user.isActive ? 'opacity-50' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" color={avatarColor} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-foreground truncate">{user.name}</p>
            {user.isActive && user.role && (
              <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            )}
            {!user.isActive && (
              <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">
                Inativo
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{formatPhone(user.phone)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Desde {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {user.isActive && (canEdit || canDelete) && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {canEdit && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(user)}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function UsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState<UserDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null)

  const { role } = useAuthStore()
  const canEdit = hasPermission(role, 'UPDATE_USER')
  const canDelete = hasPermission(role, 'DELETE_USER')

  const isSearching = search.trim().length > 0

  const { data, isLoading: isPageLoading, isError, error } = useUserList(isSearching ? 0 : page, PAGE_SIZE)
  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(isSearching)
  const { mutate: remove, isPending: isDeleting } = useDeleteUser()

  const isLoading = isSearching ? isSearchLoading : isPageLoading

  const users = isSearching
    ? (searchResults ?? []).filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      )
    : (data?.users ?? [])

  const pageInfo = isSearching ? undefined : data?.pageInfo
  const totalPages = pageInfo?.totalPages ?? 0
  const totalElements = isSearching ? users.length : (pageInfo?.totalElements ?? 0)

  const filtered = users

  return (
    <div>
      <PageHeader
        title="Usuários"
        description={
          totalElements > 0
            ? `${totalElements} usuário${totalElements !== 1 ? 's' : ''} cadastrado${totalElements !== 1 ? 's' : ''}`
            : 'Gerencie os usuários do sistema'
        }
      />

      {canDelete && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Você tem permissão de administrador — ações de exclusão são permanentes.
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Erro ao carregar usuários</p>
            <p className="text-sm text-red-700 mt-0.5 font-mono">
              {(error as { response?: { status: number; data?: { message?: string } } })?.response?.data?.message
                ?? (error as Error)?.message
                ?? 'Erro desconhecido'}
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'Nenhum resultado encontrado' : 'Nenhum usuário cadastrado'}
          description={
            search
              ? `Não encontramos nenhum usuário para "${search}".`
              : 'Nenhum usuário foi encontrado no sistema.'
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {totalPages > 1 && !search && (
            <Card className="mt-6">
              <CardContent className="p-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages} · {totalElements} usuários
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

      <EditUserDialog
        user={editTarget}
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Desativar usuário?"
        description={`Tem certeza que deseja desativar ${deleteTarget?.name}? Ele perderá acesso ao sistema e não poderá fazer login.`}
        confirmLabel="Sim, desativar"
        isLoading={isDeleting}
        onConfirm={() => {
          if (!deleteTarget) return
          remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
      />
    </div>
  )
}
