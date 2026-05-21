import { Heart, Users, UserCheck, Pill, FileHeart, Activity, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { RoleBadge } from '@/features/employees/components/RoleBadge'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/authStore'
import { ROLE_LABELS, ROLE_AVATAR_COLORS, SHIFT_LABELS } from '@/lib/constants'
import { useEmployees } from '@/features/employees/hooks/useEmployees'
import { hasPermission } from '@/lib/permissions'
import { formatDate } from '@/lib/utils'

function AdminManagerDashboard() {
  const { data: employees, isLoading } = useEmployees()

  const nurses = employees?.filter((e) => e.role === 'NURSE') ?? []
  const doctors = employees?.filter((e) => e.role === 'DOCTOR') ?? []
  const managers = employees?.filter((e) => e.role === 'MANAGER') ?? []

  const stats = [
    { label: 'Total de Funcionários', value: employees?.length ?? '—', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Enfermeiros', value: nurses.length || '—', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Médicos', value: doctors.length || '—', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Gerentes', value: managers.length || '—', icon: Pill, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : stats.map((s) => (
              <Card key={s.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <div className={`${s.bg} p-2 rounded-lg`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Equipe Ativa</h2>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : (
          <div className="space-y-2">
            {(employees ?? []).slice(0, 6).map((emp) => (
              <Card key={emp.employeeId}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.name} size="sm" color={ROLE_AVATAR_COLORS[emp.role]} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{emp.name}</p>
                        <RoleBadge role={emp.role} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {emp.specialization || emp.department || emp.coren || emp.crm || ''}
                        {emp.shift && ` · Turno ${SHIFT_LABELS[emp.shift] ?? emp.shift}`}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      Desde {formatDate(emp.admissionDate)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ClinicalDashboard({ role }: { role: string }) {
  const shortcuts = [
    {
      to: '/health-records',
      icon: FileHeart,
      label: 'Prontuários',
      description: 'Consulte e atualize registros de saúde',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      to: '/activities',
      icon: Activity,
      label: 'Atividades',
      description: 'Registre atividades dos residentes',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    ...(role === 'DOCTOR'
      ? [{
          to: '/medications',
          icon: Pill,
          label: 'Medicamentos',
          description: 'Pesquise medicamentos e prescreva',
          color: 'text-violet-600',
          bg: 'bg-violet-50',
        }]
      : [{
          to: '/medications',
          icon: Stethoscope,
          label: 'Medicamentos',
          description: 'Consulte medicamentos disponíveis',
          color: 'text-violet-600',
          bg: 'bg-violet-50',
        }]),
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Acesso rápido</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {shortcuts.map((s) => (
          <a key={s.to} href={s.to}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}

function FamilyDashboard() {
  return (
    <div className="space-y-6">
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">Bem-vindo ao portal familiar</p>
              <p className="text-sm text-blue-700 mt-1">
                Aqui você pode acompanhar os registros de saúde e as atividades do seu familiar de forma segura e atualizada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href="/health-records">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center">
                <FileHeart className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold">Prontuário</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Veja os sinais vitais e histórico de saúde
                </p>
              </div>
            </CardContent>
          </Card>
        </a>
        <a href="/activities">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="bg-amber-50 w-10 h-10 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">Atividades</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Acompanhe as atividades realizadas
                </p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { name, role } = useAuthStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const isAdminOrManager = hasPermission(role, 'MANAGE_RESIDENTS')
  const isClinical = hasPermission(role, 'MANAGE_HEALTH_RECORDS')
  const isFamily = role === 'FAMILY_MEMBER'

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${name?.split(' ')[0]}!`}
        description={`Perfil: ${role ? ROLE_LABELS[role] : ''} · ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      />

      {isAdminOrManager && <AdminManagerDashboard />}
      {isClinical && !isAdminOrManager && <ClinicalDashboard role={role ?? ''} />}
      {isFamily && <FamilyDashboard />}
    </div>
  )
}
