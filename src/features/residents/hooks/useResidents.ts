import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getResidents, getResident, admitResident, updateResident, getResidentsByFamilyMember,
  createFamilyMemberUser, linkFamilyMember, removeFamilyLink, setPrimaryContact,
} from '@/api/residents'
import type { AdmitResidentRequest, FamilyLinkRequest, ResidentDTO, UpdateResidentRequest } from '@/types/api'

function extractResidents(data: unknown): ResidentDTO[] {
  if (!data) return []
  const d = data as Record<string, unknown>
  if (d._embedded) {
    const embedded = d._embedded as Record<string, unknown>
    const key = Object.keys(embedded)[0]
    return (embedded[key] as ResidentDTO[]) ?? []
  }
  if (Array.isArray(data)) return data as ResidentDTO[]
  return []
}

export function useResidents(page = 0, size = 10) {
  return useQuery({
    queryKey: ['residents', page, size],
    queryFn: () => getResidents({ page, size }),
    staleTime: 1000 * 60 * 2,
  })
}

export function useResident(id: string) {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: () => getResident(id),
    enabled: !!id,
    retry: (count, error) => {
      const status = (error as { response?: { status: number } })?.response?.status
      return status !== 404 && count < 2
    },
  })
}

export function useResidentList(role: string | null, userId: string | null, page = 0, size = 10) {
  const isFamilyMember = role === 'FAMILY_MEMBER'

  const staffQuery = useQuery({
    queryKey: ['residents', 'list', page, size],
    queryFn: () => getResidents({ page, size }),
    select: (data) => ({
      residents: extractResidents(data),
      pageInfo: data.page,
    }),
    staleTime: 1000 * 60 * 2,
    enabled: !isFamilyMember,
  })

  const familyQuery = useQuery({
    queryKey: ['residents', 'family-member', userId],
    queryFn: () => getResidentsByFamilyMember(userId!),
    select: (data) => ({ residents: data, pageInfo: undefined }),
    staleTime: 1000 * 60 * 5,
    enabled: isFamilyMember && !!userId,
  })

  return isFamilyMember ? familyQuery : staffQuery
}

export function useResidentSearch(enabled = true) {
  return useQuery({
    queryKey: ['residents', 'search-all'],
    queryFn: () => getResidents({ page: 0, size: 200, sort: 'name' }),
    select: (data) => extractResidents(data),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}

export function useLinkedResidents(familyMemberId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['residents', 'family-member', familyMemberId],
    queryFn: () => getResidentsByFamilyMember(familyMemberId!),
    enabled: !!familyMemberId && enabled,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdmitResident(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdmitResidentRequest) => admitResident(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Residente admitido com sucesso!')
      onSuccess?.()
    },
  })
}

export function useUpdateResident(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResidentRequest }) => updateResident(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Dados do residente atualizados!')
      onSuccess?.()
    },
  })
}

export function useCreateAndLinkFamilyMember(residentId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      familyData,
      linkData,
    }: {
      familyData: { name: string; email: string; phone?: string }
      linkData: { relationship: string; isPrimaryContact: boolean }
    }) => {
      const userId = await createFamilyMemberUser(familyData)
      await linkFamilyMember(residentId, { familyMemberId: userId, ...linkData })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Familiar cadastrado e vinculado com sucesso! Um e-mail com a senha temporária foi enviado.')
      onSuccess?.()
    },
  })
}

export function useLinkExistingFamilyMember(residentId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FamilyLinkRequest) => linkFamilyMember(residentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Familiar vinculado com sucesso!')
      onSuccess?.()
    },
  })
}

export function useRemoveFamilyLink(residentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (familyLinkId: string) => removeFamilyLink(residentId, familyLinkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Vínculo removido.')
    },
  })
}

export function useSetPrimaryContact(residentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (familyLinkId: string) => setPrimaryContact(residentId, familyLinkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residents'] })
      toast.success('Contato principal atualizado.')
    },
  })
}
