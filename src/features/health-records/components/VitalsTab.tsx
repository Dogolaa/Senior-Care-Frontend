import { useState } from 'react'
import { isAxiosError } from 'axios'
import { FileHeart, ChevronDown, ChevronUp, Clock, Eye, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/shared/EmptyState'
import { VitalsDisplay } from './VitalsDisplay'
import { VitalsCharts } from './VitalsCharts'
import { HealthRecordForm } from './HealthRecordForm'
import { HistoryPhotoSection } from './HistoryPhotoSection'
import { ConditionsSection } from './ConditionsSection'
import { useHealthRecord } from '@/features/health-records/hooks/useHealthRecord'
import { formatDate, checkVitalAnomalies, heartRateStatus, saturationStatus, temperatureStatus, bloodPressureStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { VITAL_SOURCE_LABELS } from '@/lib/constants'

export function VitalsTab({ residentId, readOnly }: { residentId: string; readOnly: boolean }) {
  const { data: record, isLoading, error } = useHealthRecord(residentId)
  const [showForm, setShowForm] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  const is404 = isAxiosError(error) && error.response?.status === 404

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Carregando prontuário...
      </div>
    )
  }

  if (is404 || !record) {
    if (readOnly) {
      return (
        <EmptyState
          icon={FileHeart}
          title="Nenhum prontuário encontrado"
          description="Este residente ainda não possui um prontuário registrado."
        />
      )
    }
    return (
      <div className="space-y-4">
        <EmptyState
          icon={FileHeart}
          title="Nenhum prontuário encontrado"
          description="Crie o primeiro registro de sinais vitais abaixo."
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Criar Prontuário</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthRecordForm residentId={residentId} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Última atualização: {formatDate(record.lastUpdated)}</p>
        {readOnly ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Somente leitura
          </Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : 'Atualizar Sinais Vitais'}
          </Button>
        )}
      </div>

      <VitalsDisplay record={record} />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Altura</p>
          <p className="font-semibold">{record.height} m</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Peso</p>
          <p className="font-semibold">{record.weight} kg</p>
        </div>
      </div>

      <ConditionsSection
        residentId={residentId}
        conditions={record.conditions ?? []}
        readOnly={readOnly}
      />

      {!readOnly && showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Atualizar Prontuário</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthRecordForm residentId={residentId} existing={record} onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <VitalsCharts history={record.history} />

      {record.history && record.history.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            <Clock className="h-4 w-4" />
            Histórico ({record.history.length} registros)
            {historyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {historyExpanded && (
            <TooltipProvider>
            <div className="mt-3 space-y-2">
              {record.history.map((h) => {
                const anomalies = checkVitalAnomalies(h.heartRate, h.saturation, h.temperature, h.bloodPressure)
                const hasAnomaly = anomalies.length > 0
                return (
                <Card key={h.id} className={cn('bg-muted/30', hasAnomaly && 'border-red-200 bg-red-50/30')}>
                  <CardContent className="p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(h.updateDate)}</span>
                        {hasAnomaly && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded cursor-default">
                                <AlertTriangle className="h-3 w-3" />
                                {anomalies.length} alerta{anomalies.length > 1 ? 's' : ''}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <ul className="space-y-1">
                                {anomalies.map((a) => (
                                  <li key={a.name} className="text-xs">
                                    <span className="font-medium">{a.name}:</span> {a.reason}
                                  </li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{VITAL_SOURCE_LABELS[h.source] ?? h.source}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-muted-foreground">
                      <span>FC: <strong className={cn('text-foreground', heartRateStatus(h.heartRate) === 'danger' && 'text-red-600', heartRateStatus(h.heartRate) === 'warning' && 'text-amber-600')}>{h.heartRate} bpm</strong></span>
                      <span>Temp: <strong className={cn('text-foreground', temperatureStatus(h.temperature) === 'danger' && 'text-red-600', temperatureStatus(h.temperature) === 'warning' && 'text-amber-600')}>{h.temperature}°C</strong></span>
                      <span>Sat: <strong className={cn('text-foreground', saturationStatus(h.saturation) === 'danger' && 'text-red-600', saturationStatus(h.saturation) === 'warning' && 'text-amber-600')}>{h.saturation}%</strong></span>
                      <span>PA: <strong className={cn('text-foreground', bloodPressureStatus(h.bloodPressure) === 'danger' && 'text-red-600', bloodPressureStatus(h.bloodPressure) === 'warning' && 'text-amber-600')}>{h.bloodPressure}</strong></span>
                      <span>IMC: <strong className="text-foreground">{h.imc != null ? h.imc.toFixed(1) : '—'}</strong></span>
                    </div>
                    <HistoryPhotoSection historyId={h.id} photoUrls={h.photoUrls} readOnly={readOnly} residentId={residentId} />
                  </CardContent>
                </Card>
                )
              })}
            </div>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  )
}
