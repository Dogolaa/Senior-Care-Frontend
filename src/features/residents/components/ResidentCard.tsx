import { Pencil, Bed, Droplets, Calendar, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BLOOD_TYPE_LABELS, GENDER_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { ResidentDTO } from '@/types/api'

interface ResidentCardProps {
  resident: ResidentDTO
  onEdit?: (resident: ResidentDTO) => void
  onFamilyMembers?: (resident: ResidentDTO) => void
}

const BLOOD_TYPE_COLORS: Record<string, string> = {
  A_POSITIVE: 'bg-red-100 text-red-800',
  A_NEGATIVE: 'bg-red-100 text-red-800',
  B_POSITIVE: 'bg-orange-100 text-orange-800',
  B_NEGATIVE: 'bg-orange-100 text-orange-800',
  AB_POSITIVE: 'bg-purple-100 text-purple-800',
  AB_NEGATIVE: 'bg-purple-100 text-purple-800',
  O_POSITIVE: 'bg-blue-100 text-blue-800',
  O_NEGATIVE: 'bg-blue-100 text-blue-800',
}

export function ResidentCard({ resident, onEdit, onFamilyMembers }: ResidentCardProps) {
  const initials = resident.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')

  const bloodLabel = BLOOD_TYPE_LABELS[resident.bloodType] ?? resident.bloodType
  const bloodColor = BLOOD_TYPE_COLORS[resident.bloodType] ?? 'bg-gray-100 text-gray-800'
  const genderLabel = GENDER_LABELS[resident.gender] ?? resident.gender

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-bold text-base">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground text-base leading-tight">{resident.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">CPF: {resident.cpf}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onFamilyMembers && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onFamilyMembers(resident)}
                    aria-label="Gerenciar familiares"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(resident)}
                    aria-label="Editar residente"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge className={`text-xs font-medium ${bloodColor}`}>
                <Droplets className="h-3 w-3 mr-1" />
                {bloodLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Bed className="h-3 w-3 mr-1" />
                {resident.room}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {genderLabel}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              {resident.dateOfBirth && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Nasc. {formatDate(resident.dateOfBirth)}
                </span>
              )}
              {resident.admissionDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Admissão {formatDate(resident.admissionDate)}
                </span>
              )}
            </div>

            {resident.allergies && resident.allergies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {resident.allergies.map((a) => (
                  <Badge key={a} variant="destructive" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            )}

            {resident.familyLinks && resident.familyLinks.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {resident.familyLinks.length} familiar{resident.familyLinks.length !== 1 ? 'es' : ''} vinculado{resident.familyLinks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
