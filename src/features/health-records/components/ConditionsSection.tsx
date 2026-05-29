import { useState } from 'react'
import { X, Plus, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAddCondition, useRemoveCondition } from '@/features/health-records/hooks/useHealthRecord'

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

interface ConditionsSectionProps {
  residentId: string
  conditions: string[]
  readOnly: boolean
}

export function ConditionsSection({ residentId, conditions, readOnly }: ConditionsSectionProps) {
  const [input, setInput] = useState('')
  const { mutate: addCond, isPending: adding } = useAddCondition(residentId)
  const { mutate: removeCond } = useRemoveCondition(residentId)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    addCond(trimmed, { onSuccess: () => setInput('') })
  }

  if (readOnly && conditions.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Stethoscope className="h-4 w-4 text-indigo-500" />
        Condições / Diagnósticos
      </div>

      {conditions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border bg-indigo-50/60 border-indigo-200">
          {conditions.map((c) => (
            <Badge
              key={c}
              variant="secondary"
              className="bg-indigo-100 text-indigo-800 border-indigo-300 gap-1 pr-1 text-sm"
            >
              {toTitleCase(c)}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeCond(c)}
                  className="ml-0.5 rounded-full hover:bg-indigo-200 p-0.5 transition-colors"
                  aria-label={`Remover condição ${toTitleCase(c)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        !readOnly && (
          <p className="text-sm text-muted-foreground">Nenhuma condição registrada.</p>
        )
      )}

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Diabetes Tipo 2, Hipertensão Arterial"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
            }}
            className="flex-1"
            disabled={adding}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={adding || !input.trim()}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      )}
    </div>
  )
}
