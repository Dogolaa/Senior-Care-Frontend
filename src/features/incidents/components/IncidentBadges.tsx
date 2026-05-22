import { INCIDENT_SEVERITY_COLORS, INCIDENT_SEVERITY_LABELS, INCIDENT_TYPE_LABELS } from '../../../lib/constants'
import type { IncidentSeverity, IncidentType } from '../../../types/api'

interface SeverityBadgeProps {
  severity: IncidentSeverity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INCIDENT_SEVERITY_COLORS[severity] ?? 'bg-gray-100 text-gray-800'}`}>
      {INCIDENT_SEVERITY_LABELS[severity] ?? severity}
    </span>
  )
}

interface TypeBadgeProps {
  type: IncidentType
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      {INCIDENT_TYPE_LABELS[type] ?? type}
    </span>
  )
}
