import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getEmployees, getDoctors, getNurses, getManagers,
  promoteNurse, promoteDoctor, promoteManager, demoteEmployee, updateEmployee,
} from '@/api/employees'
import type { EmployeeDetailsDTO, PromoteDoctorRequest, PromoteManagerRequest, PromoteNurseRequest } from '@/types/api'

function extractList(data: unknown): EmployeeDetailsDTO[] {
  if (!data) return []
  const d = data as Record<string, unknown>
  if (d._embedded) {
    const embedded = d._embedded as Record<string, unknown>
    const key = Object.keys(embedded)[0]
    return (embedded[key] as EmployeeDetailsDTO[]) ?? []
  }
  if (Array.isArray(data)) return data as EmployeeDetailsDTO[]
  return []
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees({ size: 100 }),
    select: (data) => extractList(data),
  })
}

export function useNurses() {
  return useQuery({
    queryKey: ['employees', 'nurses'],
    queryFn: getNurses,
    select: extractList,
  })
}

export function useDoctors() {
  return useQuery({
    queryKey: ['employees', 'doctors'],
    queryFn: getDoctors,
    select: extractList,
  })
}

export function useManagers() {
  return useQuery({
    queryKey: ['employees', 'managers'],
    queryFn: getManagers,
    select: extractList,
  })
}

export function usePromoteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type, data,
    }: { type: 'nurse' | 'doctor' | 'manager'; data: PromoteNurseRequest | PromoteDoctorRequest | PromoteManagerRequest }) => {
      if (type === 'nurse') return promoteNurse(data as PromoteNurseRequest)
      if (type === 'doctor') return promoteDoctor(data as PromoteDoctorRequest)
      return promoteManager(data as PromoteManagerRequest)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Funcionário promovido com sucesso!')
    },
  })
}

export function useDemoteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) => demoteEmployee(employeeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Funcionário removido da equipe.')
    },
  })
}

export function useUpdateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeDetailsDTO> }) =>
      updateEmployee(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Dados atualizados com sucesso!')
    },
  })
}
