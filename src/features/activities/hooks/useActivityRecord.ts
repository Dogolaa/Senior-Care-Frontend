import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getActivityRecord, createActivityRecord, addActivity, addActivityPhoto } from '@/api/activityRecords'

export function useActivityRecord(residentId: string | undefined) {
  return useQuery({
    queryKey: ['activity-records', 'resident', residentId],
    queryFn: () => getActivityRecord(residentId!),
    enabled: !!residentId,
    retry: (count, error) => {
      const status = (error as { response?: { status: number } })?.response?.status
      if (status === 404) return false
      return count < 1
    },
  })
}

export function useCreateActivityRecord(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ residentId, conductedById }: { residentId: string; conductedById: string }) =>
      createActivityRecord(residentId, conductedById),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['activity-records', 'resident', vars.residentId] })
      toast.success('Registro de atividades criado!')
      onSuccess?.()
    },
  })
}

export function useAddActivity(residentId: string, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        activityName: string
        description: string
        startDateTime: string
        endDateTime: string
        conductedById: string
        notes: string
      }
    }) => addActivity(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-records', 'resident', residentId] })
      toast.success('Atividade registrada!')
      onSuccess?.()
    },
  })
}

export function useAddActivityPhoto(residentId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ historyId, photoUrl }: { historyId: string; photoUrl: string }) =>
      addActivityPhoto(historyId, photoUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity-records', 'resident', residentId] })
    },
  })
}
