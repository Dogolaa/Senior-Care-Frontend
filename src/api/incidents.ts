import api from './axios'
import type { IncidentDTO, CreateIncidentRequest, UpdateIncidentRequest } from '../types/api'

export const getIncidentsByResident = (residentId: string): Promise<IncidentDTO[]> =>
  api.get(`/incidents/resident/${residentId}`).then(r => r.data)

export const createIncident = (data: CreateIncidentRequest): Promise<void> =>
  api.post('/incidents', data)

export const updateIncident = (id: string, data: UpdateIncidentRequest): Promise<void> =>
  api.put(`/incidents/${id}`, data)

export const deleteIncident = (id: string): Promise<void> =>
  api.delete(`/incidents/${id}`)
