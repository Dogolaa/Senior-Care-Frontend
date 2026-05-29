import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getUsers, updateUser, deleteUser } from '@/api/users'
import type { UpdateUserRequest, UserDTO } from '@/types/api'

function extractUsers(data: unknown): UserDTO[] {
  if (!data) return []
  const d = data as Record<string, unknown>
  if (d._embedded) {
    const embedded = d._embedded as Record<string, unknown>
    const key = Object.keys(embedded)[0]
    return (embedded[key] as UserDTO[]) ?? []
  }
  if (Array.isArray(data)) return data as UserDTO[]
  return []
}

export function useUserList(page = 0, size = 12) {
  return useQuery({
    queryKey: ['users', 'list', page, size],
    queryFn: () => getUsers({ page, size, sort: 'name' }),
    select: (data) => ({
      users: extractUsers(data),
      pageInfo: data.page,
    }),
    staleTime: 1000 * 60 * 2,
  })
}

export function useUserSearch(enabled = true) {
  return useQuery({
    queryKey: ['users', 'search-all'],
    queryFn: () => getUsers({ page: 0, size: 500, sort: 'name' }),
    select: (data) => extractUsers(data),
    staleTime: 1000 * 60 * 2,
    enabled,
  })
}

export function useUpdateUser(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário atualizado com sucesso!')
      onSuccess?.()
    },
    onError: () => {
      toast.error('Não foi possível atualizar o usuário.')
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário desativado com sucesso.')
    },
    onError: () => {
      toast.error('Não foi possível desativar o usuário.')
    },
  })
}
