import api from './axios'
import type {
  EmployeeDetailsDTO,
  PaginatedResponse,
  PaginationParams,
  PromoteDoctorRequest,
  PromoteManagerRequest,
  PromoteNurseRequest,
} from '@/types/api'

export const getEmployees = (params?: PaginationParams): Promise<PaginatedResponse<EmployeeDetailsDTO>> =>
  api.get('/employees', { params }).then((r) => r.data)

export const getEmployee = (id: string): Promise<EmployeeDetailsDTO> =>
  api.get(`/employees/${id}`).then((r) => r.data)

export const getNurses = (): Promise<EmployeeDetailsDTO[]> =>
  api.get('/employees/nurses').then((r) => r.data)

export const getDoctors = (): Promise<EmployeeDetailsDTO[]> =>
  api.get('/employees/doctors').then((r) => r.data)

export const getManagers = (): Promise<EmployeeDetailsDTO[]> =>
  api.get('/employees/managers').then((r) => r.data)

export const promoteNurse = (data: PromoteNurseRequest): Promise<void> =>
  api.post('/employees/nurses', data)

export const promoteDoctor = (data: PromoteDoctorRequest): Promise<void> =>
  api.post('/employees/doctors', data)

export const promoteManager = (data: PromoteManagerRequest): Promise<void> =>
  api.post('/employees/managers', data)

export const demoteEmployee = (employeeId: string): Promise<void> =>
  api.delete(`/employees/${employeeId}`)

export const updateEmployee = (employeeId: string, data: Partial<EmployeeDetailsDTO>): Promise<void> =>
  api.put(`/employees/${employeeId}`, data)
