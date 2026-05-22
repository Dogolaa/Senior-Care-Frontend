import api from './axios'
import type { CarePlanDTO, CreateCarePlanRequest, UpdateCarePlanRequest } from '../types/api'

export const getCarePlansByResident = (residentId: string): Promise<CarePlanDTO[]> =>
  api.get(`/care-plans/resident/${residentId}`).then(r => r.data)

export const createCarePlan = (data: CreateCarePlanRequest): Promise<void> =>
  api.post('/care-plans', data)

export const updateCarePlan = (id: string, data: UpdateCarePlanRequest): Promise<void> =>
  api.put(`/care-plans/${id}`, data)

export const deleteCarePlan = (id: string): Promise<void> =>
  api.delete(`/care-plans/${id}`)
