import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/api/dashboard'

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}
