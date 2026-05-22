import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, UserCheck, FileHeart,
  Pill, Activity, LogOut, Heart, Users, UserCog, BedDouble, AlertTriangle, FileText, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { hasAnyPermission } from '@/lib/permissions'
import { ROLE_LABELS } from '@/lib/constants'
import { AvatarUploader } from '@/components/shared/PhotoUploader'
import { updateUserPhoto } from '@/api/users'
import type { Permission } from '@/lib/permissions'

const navItems: { to: string; icon: React.ElementType; label: string; permissions: Permission[] }[] = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Início',
    permissions: [],
  },
  {
    to: '/residents',
    icon: Heart,
    label: 'Residentes',
    permissions: ['MANAGE_RESIDENTS', 'VIEW_RESIDENTS'],
  },
  {
    to: '/beds',
    icon: BedDouble,
    label: 'Leitos',
    permissions: ['MANAGE_RESIDENTS', 'VIEW_RESIDENTS'],
  },
  {
    to: '/employees',
    icon: UserCheck,
    label: 'Funcionários',
    permissions: ['READ_ALL_EMPLOYEES'],
  },
  {
    to: '/health-records',
    icon: FileHeart,
    label: 'Prontuários',
    permissions: ['MANAGE_HEALTH_RECORDS', 'VIEW_RESIDENT_RECORDS'],
  },
  {
    to: '/medications',
    icon: Pill,
    label: 'Medicamentos',
    permissions: ['MANAGE_HEALTH_RECORDS'],
  },
  {
    to: '/activities',
    icon: Activity,
    label: 'Atividades',
    permissions: ['MANAGE_ACTIVITIES', 'VIEW_RESIDENT_RECORDS'],
  },
  {
    to: '/incidents',
    icon: AlertTriangle,
    label: 'Incidentes',
    permissions: ['MANAGE_INCIDENTS', 'VIEW_INCIDENTS'],
  },
  {
    to: '/care-plans',
    icon: ClipboardList,
    label: 'Plano de Cuidados',
    permissions: ['MANAGE_CARE_PLANS', 'VIEW_CARE_PLANS'],
  },
  {
    to: '/reports',
    icon: FileText,
    label: 'Relatórios',
    permissions: ['MANAGE_HEALTH_RECORDS', 'VIEW_RESIDENT_RECORDS', 'VIEW_REPORTS'],
  },
  {
    to: '/family-members',
    icon: UserCog,
    label: 'Familiares',
    permissions: ['CREATE_FAMILY_MEMBER'],
  },
  {
    to: '/users',
    icon: Users,
    label: 'Usuários',
    permissions: ['UPDATE_USER'],
  },
]

export function Sidebar() {
  const { name, role, userId, photoUrl, setPhotoUrl, clearAuth } = useAuthStore()

  const visibleItems = navItems.filter(
    (item) => item.permissions.length === 0 || hasAnyPermission(role, item.permissions)
  )

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary">
          <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold">SeniorCare</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="px-3 py-2 mb-1 flex items-center gap-3">
          <AvatarUploader
            currentUrl={photoUrl}
            name={name ?? '?'}
            size="md"
            onUploaded={async (url) => {
              if (userId) await updateUserPhoto(userId, url)
              setPhotoUrl(url)
            }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-sidebar-foreground/50">{role ? (ROLE_LABELS[role] ?? role) : ''}</p>
          </div>
        </div>
        <button
          onClick={clearAuth}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
