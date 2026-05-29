import api from './axios'
import type { CreateHealthRecordRequest, HealthRecordDTO } from '@/types/api'

export const getHealthRecord = (residentId: string): Promise<HealthRecordDTO> =>
  api.get(`/health-records/resident/${residentId}`).then((r) => r.data)

export const createHealthRecord = (data: CreateHealthRecordRequest): Promise<void> =>
  api.post('/health-records', data)

export const updateHealthRecord = (id: string, data: Partial<CreateHealthRecordRequest>): Promise<void> =>
  api.put(`/health-records/${id}`, data)

export const addHistoryPhoto = (historyId: string, photoUrl: string): Promise<void> =>
  api.post(`/health-records/histories/${historyId}/photos`, { photoUrl })

export const addCondition = (residentId: string, conditionDescription: string): Promise<void> =>
  api.post(`/health-records/resident/${residentId}/conditions`, { conditionDescription })

export const removeCondition = (residentId: string, description: string): Promise<void> =>
  api.delete(`/health-records/resident/${residentId}/conditions`, { params: { description } })
