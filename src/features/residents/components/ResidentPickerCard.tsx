import { Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ResidentDTO } from '@/types/api'

export function ResidentPickerCard({
  resident,
  selected,
  onClick,
}: {
  resident: ResidentDTO
  selected: boolean
  onClick: () => void
}) {
  const initials = resident.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-all duration-150 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/30',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-blue-700 font-bold text-sm">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate">{resident.name}</p>
          <p className="text-xs text-muted-foreground">Quarto {resident.room}</p>
        </div>
        {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
      </div>
      {resident.allergies && resident.allergies.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700">
            {resident.allergies.length} alergia{resident.allergies.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </button>
  )
}
