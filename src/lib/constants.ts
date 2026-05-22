export const GENDER_LABELS: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
  MASCULINO: 'Masculino',
  FEMININO: 'Feminino',
  OUTRO: 'Outro',
}

export const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A−',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B−',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB−',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O−',
}

export const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
  DIURNO: 'Diurno',
  NOTURNO: 'Noturno',
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  DOCTOR: 'Médico',
  NURSE: 'Enfermeiro',
  FAMILY_MEMBER: 'Familiar',
  DEFAULT_USER: 'Usuário',
}

export const ROLE_COLORS: Record<string, string> = {
  NURSE: 'bg-blue-100 text-blue-800',
  DOCTOR: 'bg-emerald-100 text-emerald-800',
  MANAGER: 'bg-violet-100 text-violet-800',
  ADMIN: 'bg-slate-100 text-slate-800',
  FAMILY_MEMBER: 'bg-amber-100 text-amber-800',
  DEFAULT_USER: 'bg-gray-100 text-gray-600',
}

export const ROLE_AVATAR_COLORS: Record<string, string> = {
  NURSE: 'bg-blue-500',
  DOCTOR: 'bg-emerald-600',
  MANAGER: 'bg-violet-600',
  ADMIN: 'bg-slate-700',
  FAMILY_MEMBER: 'bg-amber-500',
  DEFAULT_USER: 'bg-gray-500',
}

export const VITAL_SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  WEARABLE: 'Wearable',
  DEVICE: 'Dispositivo',
}

export const GENDER_OPTIONS = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'OUTRO', label: 'Outro' },
]

export const BLOOD_TYPE_OPTIONS = Object.entries(BLOOD_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export const SHIFT_OPTIONS = [
  { value: 'MORNING', label: 'Manhã' },
  { value: 'AFTERNOON', label: 'Tarde' },
  { value: 'NIGHT', label: 'Noite' },
]

export const VITAL_SOURCE_OPTIONS = Object.entries(VITAL_SOURCE_LABELS).map(([value, label]) => ({ value, label }))

export const API_BASE_URL = '/api/v1'

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  FALL: 'Queda',
  AGITATION: 'Agitação',
  MEDICATION_REFUSAL: 'Recusa de Medicamento',
  BEHAVIORAL_CHANGE: 'Mudança Comportamental',
  ACCIDENT: 'Acidente',
  OTHER: 'Outro',
}

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

export const INCIDENT_TYPE_OPTIONS = Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))
export const INCIDENT_SEVERITY_OPTIONS = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({ value, label }))

export const CARE_PLAN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export const CARE_PLAN_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

export const CARE_PLAN_STATUS_OPTIONS = Object.entries(CARE_PLAN_STATUS_LABELS).map(([value, label]) => ({ value, label }))
