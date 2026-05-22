import { useState, useMemo, useEffect } from 'react'
import { FileText, Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { ResidentPdfDocument } from '@/features/reports/components/ResidentPdfDocument'
import { useResidentReportData } from '@/features/reports/hooks/useResidentReportData'
import { useResidentSearch, useLinkedResidents } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import type { ResidentDTO } from '@/types/api'

function ReportPanel({ resident }: { resident: ResidentDTO }) {
  const { healthRecord, prescriptions, incidents, activities, isLoading, isReady } =
    useResidentReportData(resident.id)

  const generatedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-blue-700">
            {resident.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{resident.name}</p>
          {resident.room && <p className="text-sm text-slate-500">Quarto: {resident.room}</p>}
        </div>
        {isReady && (
          <PDFDownloadLink
            document={
              <ResidentPdfDocument
                resident={resident}
                healthRecord={healthRecord}
                prescriptions={prescriptions}
                incidents={incidents}
                activities={activities}
                generatedAt={generatedAt}
              />
            }
            fileName={`relatorio-${resident.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} className="shrink-0">
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Gerando PDF...' : 'Baixar PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          label="Prontuário"
          value={healthRecord ? 'Disponível' : 'Sem dados'}
          ok={!!healthRecord}
        />
        <SummaryCard
          label="Prescrições"
          value={`${prescriptions.length} registrada${prescriptions.length !== 1 ? 's' : ''}`}
          ok={prescriptions.length > 0}
        />
        <SummaryCard
          label="Incidentes"
          value={`${incidents.length} registrado${incidents.length !== 1 ? 's' : ''}`}
          ok={incidents.length === 0}
          warningOnTrue={false}
        />
        <SummaryCard
          label="Atividades"
          value={`${activities?.history?.length ?? 0} no histórico`}
          ok={(activities?.history?.length ?? 0) > 0}
        />
      </div>

      <p className="text-xs text-slate-400 text-center">
        O PDF inclui dados pessoais, prontuário atual, prescrições, últimos 8 incidentes e últimas 8 atividades.
      </p>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  ok,
  warningOnTrue = true,
}: {
  label: string
  value: string
  ok: boolean
  warningOnTrue?: boolean
}) {
  const color = warningOnTrue
    ? ok
      ? 'text-green-600'
      : 'text-slate-400'
    : ok
    ? 'text-slate-400'
    : 'text-amber-600'

  return (
    <div className="rounded-lg border bg-white p-3 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export function ReportsPage() {
  const { role, userId } = useAuthStore()
  const isFamily = role === 'FAMILY_MEMBER'
  const canListAll = hasPermission(role, 'VIEW_RESIDENTS') || hasPermission(role, 'MANAGE_RESIDENTS')

  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const [search, setSearch] = useState('')

  const { data: allResidents, isLoading: allLoading } = useResidentSearch(canListAll)
  const { data: linkedResidents, isLoading: linkedLoading } = useLinkedResidents(userId, isFamily)

  const residentsLoading = isFamily ? linkedLoading : allLoading
  const baseResidents = isFamily ? (linkedResidents ?? []) : (allResidents ?? [])

  const filtered = useMemo(() => {
    if (isFamily) return baseResidents
    const q = search.trim().toLowerCase()
    if (!q) return baseResidents
    const digits = q.replace(/\D/g, '')
    return baseResidents.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (digits.length > 0 && r.cpf.replace(/\D/g, '').includes(digits))
    )
  }, [baseResidents, search, isFamily])

  useEffect(() => {
    if (isFamily && linkedResidents?.length === 1 && !selectedResident) {
      setSelectedResident(linkedResidents[0])
    }
  }, [isFamily, linkedResidents, selectedResident])

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Exporte o relatório completo de um residente em PDF"
      />

      {!isFamily && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Filtrar residentes por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {residentsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {Array.from({ length: isFamily ? 1 : 8 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={isFamily ? 'Nenhum residente vinculado' : search ? 'Nenhum residente encontrado' : 'Nenhum residente cadastrado'}
          description={
            isFamily
              ? 'Você ainda não está vinculado a nenhum residente.'
              : search
              ? `Não encontramos residentes para "${search}".`
              : 'Não há residentes cadastrados no sistema.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {filtered.map((r) => (
            <ResidentPickerCard
              key={r.id}
              resident={r}
              selected={selectedResident?.id === r.id}
              onClick={() => setSelectedResident(r)}
            />
          ))}
        </div>
      )}

      {selectedResident ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Relatório Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReportPanel resident={selectedResident} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={FileText}
          title="Selecione um residente"
          description="Clique em um residente acima para visualizar as opções de relatório."
        />
      )}
    </div>
  )
}
