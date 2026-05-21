import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { searchMedications, getPrescriptions, createPrescription, getMedicationRecords, createMedicationRecord, addMedicationRecordPhoto } from '@/api/medications'

export function useMedicationSearch(term: string) {
  return useQuery({
    queryKey: ['medications', 'search', term],
    queryFn: () => searchMedications(term),
    enabled: term.trim().length >= 2,
    staleTime: 1000 * 60 * 10,
  })
}

export function usePrescriptions(healthRecordId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', healthRecordId],
    queryFn: () => getPrescriptions(healthRecordId!),
    enabled: !!healthRecordId,
  })
}

export function useCreatePrescription(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPrescription,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['prescriptions', vars.medicalRecordId] })
      toast.success('Prescrição adicionada!')
      onSuccess?.()
    },
  })
}

export function useMedicationRecords(residentId: string | undefined) {
  return useQuery({
    queryKey: ['medication-records', 'resident', residentId],
    queryFn: () => getMedicationRecords(residentId!),
    enabled: !!residentId,
  })
}

export function useCreateMedicationRecord(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createMedicationRecord,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['medication-records', 'resident', vars.residentId] })
      toast.success('Administração registrada!')
      onSuccess?.()
    },
  })
}

export function useAddMedicationRecordPhoto(residentId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ recordId, photoUrl }: { recordId: string; photoUrl: string }) =>
      addMedicationRecordPhoto(recordId, photoUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medication-records', 'resident', residentId] })
    },
  })
}
