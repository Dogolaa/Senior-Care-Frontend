import { useState } from 'react'
import { X, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAddAllergy, useRemoveAllergy } from '@/features/residents/hooks/useResidents'

interface AllergiesSectionProps {
  residentId: string
  allergies: string[]
  readOnly?: boolean
}

export function AllergiesSection({ residentId, allergies, readOnly = false }: AllergiesSectionProps) {
  const [input, setInput] = useState('')
  const { mutate: addA, isPending: adding } = useAddAllergy(residentId)
  const { mutate: removeA } = useRemoveAllergy(residentId)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    addA(trimmed, { onSuccess: () => setInput('') })
  }

  if (readOnly && allergies.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Alergias
      </div>

      {allergies.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border bg-amber-50/60 border-amber-200">
          {allergies.map((a) => (
            <Badge
              key={a}
              variant="secondary"
              className="bg-amber-100 text-amber-800 border-amber-300 gap-1 pr-1"
            >
              {a}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeA(a)}
                  className="ml-0.5 rounded-full hover:bg-amber-200 p-0.5 transition-colors"
                  aria-label={`Remover alergia ${a}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        !readOnly && <p className="text-sm text-muted-foreground">Nenhuma alergia registrada.</p>
      )}

      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Penicilina, Dipirona"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
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
