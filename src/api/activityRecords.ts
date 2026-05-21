import api from './axios'
import type { ActivityRecordDTO } from '@/types/api'

export const getActivityRecord = (residentId: string): Promise<ActivityRecordDTO> =>
  api.get(`/activity-records/resident/${residentId}`).then((r) => r.data)

export const createActivityRecord = (residentId: string, conductedById: string): Promise<void> =>
  api.post('/activity-records', { residentId, conductedById })

export const addActivity = (
  id: string,
  data: {
    activityName: string
    description: string
    startDateTime: string
    endDateTime: string
    conductedById: string
    notes: string
  }
): Promise<void> => api.post(`/activity-records/${id}/activities`, data)

export const addActivityPhoto = (historyId: string, photoUrl: string): Promise<void> =>
  api.post(`/activity-records/histories/${historyId}/photos`, { photoUrl })
