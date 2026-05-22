import api from './axios'
import type { DashboardStatsDTO } from '@/types/api'

export const getDashboardStats = (): Promise<DashboardStatsDTO> =>
  api.get('/dashboard/stats').then((r) => r.data)
