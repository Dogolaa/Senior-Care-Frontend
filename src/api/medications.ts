import api from './axios'
import type { CreatePrescriptionRequest, MedicationDTO, MedicationRecordDTO, PrescriptionDTO } from '@/types/api'

export const searchMedications = (productName: string, page = 1, count = 10): Promise<MedicationDTO[]> =>
  api.get('/medications', { params: { productName, page, count } }).then((r) => r.data)

export const getPrescriptions = (healthRecordId: string): Promise<PrescriptionDTO[]> =>
  api.get(`/prescriptions/health-record/${healthRecordId}`).then((r) => r.data)

export const createPrescription = (data: CreatePrescriptionRequest): Promise<void> =>
  api.post('/prescriptions', data)

export const getMedicationRecords = (residentId: string): Promise<MedicationRecordDTO[]> =>
  api.get(`/medication-records/resident/${residentId}`).then((r) => r.data)

export const createMedicationRecord = (data: {
  residentId: string
  medicationId: string
  administrationDate: string
  administeredById: string
  dose: string
}): Promise<void> => api.post('/medication-records', data)

export const addMedicationRecordPhoto = (recordId: string, photoUrl: string): Promise<void> =>
  api.post(`/medication-records/${recordId}/photos`, { photoUrl })
