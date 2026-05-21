import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-700',
      className
    )}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}
