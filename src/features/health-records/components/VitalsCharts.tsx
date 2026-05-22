import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HealthRecordHistoryDTO } from '@/types/api'

function shortDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}`
}

function parseBP(bp: string): { systolic: number | null; diastolic: number | null } {
  const parts = bp.split('/')
  if (parts.length !== 2) return { systolic: null, diastolic: null }
  const s = parseInt(parts[0], 10)
  const d = parseInt(parts[1], 10)
  return { systolic: isNaN(s) ? null : s, diastolic: isNaN(d) ? null : d }
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-44">{children}</div>
      </CardContent>
    </Card>
  )
}

const AXIS_TICK = { fontSize: 11, fill: '#94a3b8' }
const GRID_STROKE = '#f1f5f9'
const MARGIN = { top: 4, right: 8, left: -20, bottom: 0 }

interface VitalsChartsProps {
  history: HealthRecordHistoryDTO[]
}

export function VitalsCharts({ history }: VitalsChartsProps) {
  const [expanded, setExpanded] = useState(false)

  if (history.length < 2) return null

  const data = [...history]
    .sort((a, b) => a.updateDate.localeCompare(b.updateDate))
    .map((h) => {
      const bp = parseBP(h.bloodPressure)
      return {
        date: shortDate(h.updateDate),
        heartRate: h.heartRate,
        temperature: h.temperature,
        saturation: h.saturation,
        weight: h.weight,
        imc: h.imc,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
      }
    })

  const hasImc = data.some((d) => d.imc != null)

  return (
    <div>
      <button
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <TrendingUp className="h-4 w-4" />
        Gráficos de Evolução ({history.length} registros)
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Frequência Cardíaca (bpm)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="date" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip formatter={(v) => [`${v} bpm`, 'FC']} />
                <Line type="monotone" dataKey="heartRate" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Saturação O₂ (%)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="date" tick={AXIS_TICK} />
                <YAxis domain={[80, 100]} tick={AXIS_TICK} />
                <Tooltip formatter={(v) => [`${v}%`, 'SpO₂']} />
                <Line type="monotone" dataKey="saturation" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Temperatura (°C)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="date" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} tickFormatter={(v: number) => v.toFixed(1)} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}°C`, 'Temperatura']} />
                <Line type="monotone" dataKey="temperature" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pressão Arterial (mmHg)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="date" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip
                  formatter={(v, name) => [
                    `${v} mmHg`,
                    name === 'systolic' ? 'Sistólica' : 'Diastólica',
                  ]}
                />
                <Legend
                  formatter={(name) => (name === 'systolic' ? 'Sistólica' : 'Diastólica')}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line type="monotone" dataKey="systolic" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="diastolic" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Peso (kg)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="date" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip formatter={(v) => [`${v} kg`, 'Peso']} />
                <Line type="monotone" dataKey="weight" stroke="#475569" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {hasImc && (
            <ChartCard title="IMC (kg/m²)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="date" tick={AXIS_TICK} />
                  <YAxis tick={AXIS_TICK} tickFormatter={(v: number) => v.toFixed(1)} />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}`, 'IMC']} />
                  <Line
                    type="monotone"
                    dataKey="imc"
                    stroke="#0891b2"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}
