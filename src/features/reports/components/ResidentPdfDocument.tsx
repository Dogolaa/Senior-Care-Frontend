import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { format, parseISO, differenceInYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ResidentDTO, HealthRecordDTO, PrescriptionDTO, IncidentDTO, ActivityRecordDTO } from '../../../types/api'
import {
  GENDER_LABELS,
  BLOOD_TYPE_LABELS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
} from '../../../lib/constants'

const PRIMARY = '#1e40af'
const LIGHT_BG = '#f1f5f9'
const BORDER = '#e2e8f0'
const TEXT_MAIN = '#1e293b'
const TEXT_MUTED = '#64748b'
const RED = '#dc2626'
const ORANGE = '#ea580c'
const AMBER = '#d97706'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: TEXT_MAIN, padding: 36, paddingBottom: 48 },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: PRIMARY },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: TEXT_MAIN },
  headerSub: { fontSize: 8, color: TEXT_MUTED, marginTop: 2 },
  // Section
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: PRIMARY, borderBottomWidth: 1, borderBottomColor: PRIMARY, paddingBottom: 3, marginBottom: 8 },
  // Grid
  row: { flexDirection: 'row', marginBottom: 4 },
  col2: { flex: 1 },
  // Field
  fieldLabel: { fontSize: 7.5, color: TEXT_MUTED, marginBottom: 1 },
  fieldValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  // Vitals card
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vitalCard: { width: '30%', backgroundColor: LIGHT_BG, padding: 8, borderRadius: 4 },
  vitalLabel: { fontSize: 7, color: TEXT_MUTED, marginBottom: 2 },
  vitalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  vitalUnit: { fontSize: 7, color: TEXT_MUTED },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: PRIMARY, padding: '5 8', borderRadius: 4, marginBottom: 2 },
  tableHeaderText: { color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 1 },
  tableRow: { flexDirection: 'row', padding: '4 8', borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: 'row', padding: '4 8', backgroundColor: LIGHT_BG, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableCell: { fontSize: 8, flex: 1 },
  // Incident
  incidentCard: { padding: 8, borderLeftWidth: 3, borderLeftColor: AMBER, marginBottom: 6, backgroundColor: LIGHT_BG, borderRadius: 2 },
  incidentCardHigh: { borderLeftColor: ORANGE },
  incidentCardCritical: { borderLeftColor: RED },
  incidentCardLow: { borderLeftColor: '#16a34a' },
  incidentBadge: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  badge: { fontSize: 7, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, backgroundColor: '#e2e8f0' },
  incidentDesc: { fontSize: 8, color: TEXT_MAIN, marginTop: 2 },
  incidentAction: { fontSize: 7.5, color: TEXT_MUTED, marginTop: 3, fontStyle: 'italic' },
  // Footer
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 6 },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  // Empty state
  emptyText: { fontSize: 8, color: TEXT_MUTED, fontStyle: 'italic' },
  // Allergy
  allergyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  allergyBadge: { fontSize: 7.5, backgroundColor: '#fee2e2', color: RED, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
})

function fmt(dateStr: string, pattern = 'dd/MM/yyyy') {
  try { return format(parseISO(dateStr), pattern, { locale: ptBR }) } catch { return dateStr }
}

function age(dob: string) {
  try { return differenceInYears(new Date(), parseISO(dob)) } catch { return '—' }
}

function severityColor(sev: string) {
  if (sev === 'CRITICAL') return s.incidentCardCritical
  if (sev === 'HIGH') return s.incidentCardHigh
  if (sev === 'LOW') return s.incidentCardLow
  return {}
}

interface Props {
  resident: ResidentDTO
  healthRecord: HealthRecordDTO | null
  prescriptions: PrescriptionDTO[]
  incidents: IncidentDTO[]
  activities: ActivityRecordDTO | null
  generatedAt: string
}

export function ResidentPdfDocument({
  resident,
  healthRecord,
  prescriptions,
  incidents,
  activities,
  generatedAt,
}: Props) {
  const recentIncidents = incidents.slice(0, 8)
  const recentActivities = activities?.history
    ? [...activities.history].sort((a, b) => b.startDateTime.localeCompare(a.startDateTime)).slice(0, 8)
    : []

  return (
    <Document title={`Relatório — ${resident.name}`} author="SeniorCare">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>SeniorCare</Text>
            <Text style={{ fontSize: 9, color: TEXT_MUTED, marginTop: 2 }}>Sistema de Gestão de ILPIs</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerTitle}>RELATÓRIO DO RESIDENTE</Text>
            <Text style={s.headerSub}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>DADOS PESSOAIS</Text>
          <View style={s.row}>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>Nome completo</Text>
              <Text style={[s.fieldValue, { fontSize: 11 }]}>{resident.name}</Text>
            </View>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>Quarto</Text>
              <Text style={s.fieldValue}>{resident.room || '—'}</Text>
            </View>
          </View>
          <View style={[s.row, { marginTop: 6 }]}>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>CPF</Text>
              <Text style={s.fieldValue}>{resident.cpf || '—'}</Text>
            </View>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>RG</Text>
              <Text style={s.fieldValue}>{resident.rg || '—'}</Text>
            </View>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>Data de Nascimento</Text>
              <Text style={s.fieldValue}>{resident.dateOfBirth ? `${fmt(resident.dateOfBirth)} (${age(resident.dateOfBirth)} anos)` : '—'}</Text>
            </View>
          </View>
          <View style={[s.row, { marginTop: 6 }]}>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>Gênero</Text>
              <Text style={s.fieldValue}>{GENDER_LABELS[resident.gender] ?? resident.gender}</Text>
            </View>
            <View style={s.col2}>
              <Text style={s.fieldLabel}>Tipo Sanguíneo</Text>
              <Text style={s.fieldValue}>{BLOOD_TYPE_LABELS[resident.bloodType] ?? resident.bloodType}</Text>
            </View>
            {resident.admissionDate && (
              <View style={s.col2}>
                <Text style={s.fieldLabel}>Data de Admissão</Text>
                <Text style={s.fieldValue}>{fmt(resident.admissionDate)}</Text>
              </View>
            )}
          </View>
          {resident.allergies && resident.allergies.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={s.fieldLabel}>Alergias conhecidas</Text>
              <View style={s.allergyRow}>
                {resident.allergies.map((a) => (
                  <Text key={a} style={s.allergyBadge}>{a}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Prontuário */}
        {healthRecord ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>PRONTUÁRIO — ÚLTIMOS VALORES REGISTRADOS</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginBottom: 8 }}>
              Última atualização: {fmt(healthRecord.lastUpdated, "dd/MM/yyyy")}
            </Text>
            <View style={s.vitalsGrid}>
              <View style={s.vitalCard}>
                <Text style={s.vitalLabel}>Pressão Arterial</Text>
                <Text style={s.vitalValue}>{healthRecord.bloodPressure || '—'}</Text>
                <Text style={s.vitalUnit}>mmHg</Text>
              </View>
              <View style={s.vitalCard}>
                <Text style={s.vitalLabel}>Frequência Cardíaca</Text>
                <Text style={s.vitalValue}>{healthRecord.heartRate ?? '—'}</Text>
                <Text style={s.vitalUnit}>bpm</Text>
              </View>
              <View style={s.vitalCard}>
                <Text style={s.vitalLabel}>Temperatura</Text>
                <Text style={s.vitalValue}>{healthRecord.temperature ?? '—'}</Text>
                <Text style={s.vitalUnit}>°C</Text>
              </View>
              <View style={s.vitalCard}>
                <Text style={s.vitalLabel}>Saturação (SpO₂)</Text>
                <Text style={s.vitalValue}>{healthRecord.saturation ?? '—'}</Text>
                <Text style={s.vitalUnit}>%</Text>
              </View>
              <View style={s.vitalCard}>
                <Text style={s.vitalLabel}>Peso / Altura</Text>
                <Text style={s.vitalValue}>{healthRecord.weight ?? '—'} kg</Text>
                <Text style={s.vitalUnit}>{healthRecord.height ?? '—'} m</Text>
              </View>
              <View style={s.vitalCard}>
                <Text style={s.vitalLabel}>IMC</Text>
                <Text style={s.vitalValue}>{healthRecord.imc != null ? healthRecord.imc.toFixed(1) : '—'}</Text>
                <Text style={s.vitalUnit}>kg/m²</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionTitle}>PRONTUÁRIO</Text>
            <Text style={s.emptyText}>Nenhum prontuário registrado.</Text>
          </View>
        )}

        {/* Prescrições */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>PRESCRIÇÕES ATIVAS</Text>
          {prescriptions.length === 0 ? (
            <Text style={s.emptyText}>Nenhuma prescrição registrada.</Text>
          ) : (
            <View>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, { flex: 2 }]}>Medicamento</Text>
                <Text style={[s.tableHeaderText, { flex: 2 }]}>Posologia</Text>
                <Text style={s.tableHeaderText}>Início</Text>
                <Text style={s.tableHeaderText}>Término</Text>
              </View>
              {prescriptions.map((p, i) => (
                <View key={p.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, { flex: 2 }]}>{p.medicationCommercialName}</Text>
                  <Text style={[s.tableCell, { flex: 2 }]}>{p.dosage}</Text>
                  <Text style={s.tableCell}>{fmt(p.startDate)}</Text>
                  <Text style={s.tableCell}>{fmt(p.endDate)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Incidentes */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>INCIDENTES RECENTES{recentIncidents.length > 0 ? ` (${recentIncidents.length})` : ''}</Text>
          {recentIncidents.length === 0 ? (
            <Text style={s.emptyText}>Nenhum incidente registrado.</Text>
          ) : (
            recentIncidents.map((inc) => (
              <View key={inc.id} style={[s.incidentCard, severityColor(inc.severity)]}>
                <View style={s.incidentBadge}>
                  <Text style={s.badge}>{INCIDENT_TYPE_LABELS[inc.incidentType] ?? inc.incidentType}</Text>
                  <Text style={s.badge}>Severidade: {INCIDENT_SEVERITY_LABELS[inc.severity] ?? inc.severity}</Text>
                  <Text style={[s.badge, { color: TEXT_MUTED }]}>{fmt(inc.occurredAt, "dd/MM/yyyy HH:mm")}</Text>
                  {inc.room && <Text style={[s.badge, { color: TEXT_MUTED }]}>{inc.room}</Text>}
                </View>
                <Text style={s.incidentDesc}>{inc.description}</Text>
                {inc.actionTaken && (
                  <Text style={s.incidentAction}>Ação tomada: {inc.actionTaken}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Atividades */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ATIVIDADES RECENTES{recentActivities.length > 0 ? ` (${recentActivities.length})` : ''}</Text>
          {recentActivities.length === 0 ? (
            <Text style={s.emptyText}>Nenhuma atividade registrada.</Text>
          ) : (
            <View>
              <View style={s.tableHeader}>
                <Text style={[s.tableHeaderText, { flex: 2 }]}>Atividade</Text>
                <Text style={s.tableHeaderText}>Data</Text>
                <Text style={s.tableHeaderText}>Horário</Text>
                <Text style={[s.tableHeaderText, { flex: 2 }]}>Observações</Text>
              </View>
              {recentActivities.map((a, i) => (
                <View key={a.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, { flex: 2 }]}>{a.activityName}</Text>
                  <Text style={s.tableCell}>{fmt(a.startDateTime, 'dd/MM/yyyy')}</Text>
                  <Text style={s.tableCell}>{fmt(a.startDateTime, 'HH:mm')} – {fmt(a.endDateTime, 'HH:mm')}</Text>
                  <Text style={[s.tableCell, { flex: 2 }]}>{a.notes || a.description || '—'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>SeniorCare — Relatório Confidencial</Text>
          <Text style={s.footerText}>{resident.name}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
