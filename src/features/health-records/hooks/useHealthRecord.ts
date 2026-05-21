import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getHealthRecord, createHealthRecord, updateHealthRecord, addHistoryPhoto } from '@/api/healthRecords'
import type { CreateHealthRecordRequest } from '@/types/api'

export function useHealthRecord(residentId: string | undefined) {
  return useQuery({
    queryKey: ['health-records', 'resident', residentId],
    queryFn: () => getHealthRecord(residentId!),
    enabled: !!residentId,
    retry: (count, error) => {
      const status = (error as { response?: { status: number } })?.response?.status
      if (status === 404) return false
      return count < 1
    },
  })
}

export function useCreateHealthRecord(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateHealthRecordRequest) => createHealthRecord(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['health-records', 'resident', vars.residentId] })
      toast.success('Prontuário criado com sucesso!')
      onSuccess?.()
    },
  })
}

export function useUpdateHealthRecord(residentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHealthRecordRequest> }) =>
      updateHealthRecord(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health-records', 'resident', residentId] })
      toast.success('Prontuário atualizado!')
    },
  })
}

export function useAddHistoryPhoto(residentId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ historyId, photoUrl }: { historyId: string; photoUrl: string }) =>
      addHistoryPhoto(historyId, photoUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health-records', 'resident', residentId] })
    },
  })
}
