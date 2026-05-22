import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createIncident,
  deleteIncident,
  getIncidentsByResident,
  updateIncident,
} from '../../../api/incidents'
import type { CreateIncidentRequest, UpdateIncidentRequest } from '../../../types/api'

export const useIncidentsByResident = (residentId: string) =>
  useQuery({
    queryKey: ['incidents', 'resident', residentId],
    queryFn: () => getIncidentsByResident(residentId),
    enabled: !!residentId,
    staleTime: 1000 * 60 * 2,
  })

export const useCreateIncident = (residentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateIncidentRequest) => createIncident(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents', 'resident', residentId] })
      toast.success('Incidente registrado com sucesso')
    },
    onError: () => toast.error('Erro ao registrar incidente'),
  })
}

export const useUpdateIncident = (residentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentRequest }) =>
      updateIncident(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents', 'resident', residentId] })
      toast.success('Incidente atualizado com sucesso')
    },
    onError: () => toast.error('Erro ao atualizar incidente'),
  })
}

export const useDeleteIncident = (residentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents', 'resident', residentId] })
      toast.success('Incidente removido com sucesso')
    },
    onError: () => toast.error('Erro ao remover incidente'),
  })
}
