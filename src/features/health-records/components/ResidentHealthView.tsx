import { FileHeart, Pill } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { VitalsTab } from './VitalsTab'
import { PrescriptionsTab } from './PrescriptionsTab'
import { MedicationRecordsTab } from './MedicationRecordsTab'
import { useHealthRecord } from '@/features/health-records/hooks/useHealthRecord'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import type { ResidentDTO } from '@/types/api'

export function ResidentHealthView({ resident, readOnly }: { resident: ResidentDTO; readOnly: boolean }) {
  const { data: record } = useHealthRecord(resident.id)
  const { role } = useAuthStore()
  const canPrescribe = hasPermission(role, 'PRESCRIBE_MEDICATION')
  const canRegisterMed = hasPermission(role, 'MANAGE_HEALTH_RECORDS')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileHeart className="h-5 w-5 text-primary" />
          {resident.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Quarto {resident.room}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vitals">
          <TabsList className="w-full">
            <TabsTrigger value="vitals" className="flex-1">Sinais Vitais</TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex-1">Prescrições</TabsTrigger>
            <TabsTrigger value="medications" className="flex-1">Medicamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <VitalsTab residentId={resident.id} readOnly={readOnly} />
          </TabsContent>

          <TabsContent value="prescriptions">
            {record ? (
              <PrescriptionsTab healthRecordId={record.id} canPrescribe={canPrescribe && !readOnly} />
            ) : (
              <EmptyState
                icon={Pill}
                title="Prontuário não encontrado"
                description="Crie primeiro o prontuário na aba de Sinais Vitais."
              />
            )}
          </TabsContent>

          <TabsContent value="medications">
            <MedicationRecordsTab residentId={resident.id} canRegister={canRegisterMed && !readOnly} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
