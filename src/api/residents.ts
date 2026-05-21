import api from './axios'
import type { AdmitResidentRequest, FamilyLinkRequest, PaginatedResponse, PaginationParams, ResidentDTO, UpdateResidentRequest } from '@/types/api'

export const getResidents = (params?: PaginationParams): Promise<PaginatedResponse<ResidentDTO>> =>
  api.get('/residents', { params }).then((r) => r.data)

export const getResident = (id: string): Promise<ResidentDTO> =>
  api.get(`/residents/${id}`).then((r) => r.data)

export const admitResident = (data: AdmitResidentRequest): Promise<void> =>
  api.post('/residents/admit', data)

export const updateResident = (id: string, data: UpdateResidentRequest): Promise<void> =>
  api.put(`/residents/${id}`, data)

export const linkFamilyMember = (residentId: string, data: FamilyLinkRequest): Promise<void> =>
  api.post(`/residents/${residentId}/family-links`, data)

export const getResidentsByFamilyMember = (familyMemberId: string): Promise<ResidentDTO[]> =>
  api.get(`/residents/family-member/${familyMemberId}`).then((r) => r.data)

export const createFamilyMemberUser = async (data: { name: string; email: string; phone?: string }): Promise<string> => {
  const res = await api.post('/family-members', data)
  const location = res.headers['location'] as string
  return location.split('/').pop()!
}

export const removeFamilyLink = (residentId: string, familyLinkId: string): Promise<void> =>
  api.delete(`/residents/${residentId}/family-links/${familyLinkId}`)

export const setPrimaryContact = (residentId: string, familyLinkId: string): Promise<void> =>
  api.patch(`/residents/${residentId}/family-links/${familyLinkId}/primary-contact`)
