import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createCarePlan, deleteCarePlan, getCarePlansByResident, updateCarePlan } from '../../../api/carePlans'
import type { CreateCarePlanRequest, UpdateCarePlanRequest } from '../../../types/api'

export const useCarePlansByResident = (residentId: string) =>
  useQuery({
    queryKey: ['care-plans', 'resident', residentId],
    queryFn: () => getCarePlansByResident(residentId),
    enabled: !!residentId,
    staleTime: 1000 * 60 * 5,
  })

export const useCreateCarePlan = (residentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCarePlanRequest) => createCarePlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['care-plans', 'resident', residentId] })
      toast.success('Plano de cuidado criado com sucesso')
    },
    onError: () => toast.error('Erro ao criar plano de cuidado'),
  })
}

export const useUpdateCarePlan = (residentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarePlanRequest }) => updateCarePlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['care-plans', 'resident', residentId] })
      toast.success('Plano de cuidado atualizado com sucesso')
    },
    onError: () => toast.error('Erro ao atualizar plano de cuidado'),
  })
}

export const useDeleteCarePlan = (residentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCarePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['care-plans', 'resident', residentId] })
      toast.success('Plano de cuidado removido com sucesso')
    },
    onError: () => toast.error('Erro ao remover plano de cuidado'),
  })
}
