import { useQuery } from '@tanstack/react-query'
import { getHealthRecord } from '../../../api/healthRecords'
import { getIncidentsByResident } from '../../../api/incidents'
import { getPrescriptions } from '../../../api/medications'
import { getActivityRecord } from '../../../api/activityRecords'

export function useResidentReportData(residentId: string | null) {
  const healthQuery = useQuery({
    queryKey: ['health-records', 'resident', residentId],
    queryFn: () => getHealthRecord(residentId!),
    enabled: !!residentId,
    staleTime: 1000 * 60 * 5,
  })

  const incidentsQuery = useQuery({
    queryKey: ['incidents', 'resident', residentId],
    queryFn: () => getIncidentsByResident(residentId!),
    enabled: !!residentId,
    staleTime: 1000 * 60 * 5,
  })

  const activitiesQuery = useQuery({
    queryKey: ['activity-records', 'resident', residentId],
    queryFn: () => getActivityRecord(residentId!),
    enabled: !!residentId,
    staleTime: 1000 * 60 * 5,
  })

  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', healthQuery.data?.id],
    queryFn: () => getPrescriptions(healthQuery.data!.id),
    enabled: !!healthQuery.data?.id,
    staleTime: 1000 * 60 * 5,
  })

  const isLoading =
    healthQuery.isLoading ||
    incidentsQuery.isLoading ||
    activitiesQuery.isLoading ||
    prescriptionsQuery.isLoading

  const isReady =
    !!residentId &&
    !isLoading &&
    (healthQuery.data !== undefined ||
      incidentsQuery.data !== undefined ||
      activitiesQuery.data !== undefined)

  return {
    healthRecord: healthQuery.data ?? null,
    incidents: incidentsQuery.data ?? [],
    activities: activitiesQuery.data ?? null,
    prescriptions: prescriptionsQuery.data ?? [],
    isLoading,
    isReady,
  }
}
