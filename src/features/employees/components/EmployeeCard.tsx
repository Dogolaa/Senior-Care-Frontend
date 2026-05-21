import { Calendar, Phone, Stethoscope, Trash2, Pencil } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RoleBadge } from './RoleBadge'
import { ROLE_AVATAR_COLORS, SHIFT_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { EmployeeDetailsDTO } from '@/types/api'

interface EmployeeCardProps {
  employee: EmployeeDetailsDTO
  onEdit?: (employee: EmployeeDetailsDTO) => void
  onDemote?: (employee: EmployeeDetailsDTO) => void
}

export function EmployeeCard({ employee, onEdit, onDemote }: EmployeeCardProps) {
  const specialty = employee.specialization || employee.department || '—'
  const shift = employee.shift ? (SHIFT_LABELS[employee.shift] ?? employee.shift) : null
  const registration = employee.coren || employee.crm || null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar
            name={employee.name}
            size="lg"
            color={ROLE_AVATAR_COLORS[employee.role] ?? 'bg-primary'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground text-base leading-tight">{employee.name}</p>
                <div className="mt-1">
                  <RoleBadge role={employee.role} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary h-9 w-9"
                    onClick={() => onEdit(employee)}
                    aria-label="Editar funcionário"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDemote && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-9 w-9"
                    onClick={() => onDemote(employee)}
                    aria-label="Remover da equipe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {registration && (
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 shrink-0" />
                  <span>{registration}</span>
                  {specialty !== '—' && <span className="text-foreground/60">· {specialty}</span>}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Desde {formatDate(employee.admissionDate)}</span>
                {shift && <span className="text-foreground/60">· Turno {shift}</span>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
