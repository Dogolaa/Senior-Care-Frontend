import { useState, useRef, useEffect } from 'react'
import { Search, X, Pill } from 'lucide-react'
import { useMedicationSearch } from '@/features/medications/hooks/useMedications'
import { cn } from '@/lib/utils'
import type { MedicationDTO } from '@/types/api'

interface MedicationSearchComboboxProps {
  onSelect: (medication: MedicationDTO | null) => void
  placeholder?: string
  className?: string
}

export function MedicationSearchCombobox({
  onSelect,
  placeholder = 'Buscar medicamento por nome...',
  className,
}: MedicationSearchComboboxProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<MedicationDTO | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: medications, isLoading } = useMedicationSearch(inputValue)

  const handleSelect = (med: MedicationDTO) => {
    setSelected(med)
    setInputValue(med.commercialName)
    setIsOpen(false)
    onSelect(med)
  }

  const handleClear = () => {
    setSelected(null)
    setInputValue('')
    setIsOpen(false)
    onSelect(null)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsOpen(true)
    if (selected) {
      setSelected(null)
      onSelect(null)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (!selected) setInputValue('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selected])

  const showDropdown = isOpen && inputValue.length >= 2

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full h-11 pl-10 pr-10 rounded-lg border border-input bg-background text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'placeholder:text-muted-foreground',
            selected && 'font-medium',
          )}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Buscando medicamentos...
            </div>
          ) : !medications || medications.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Nenhum medicamento encontrado para "{inputValue}"
            </div>
          ) : (
            medications.map((med) => (
              <button
                key={med.id}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(med) }}
              >
                <Pill className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{med.commercialName}</p>
                  <p className="text-xs text-muted-foreground">
                    {med.activeIngredient} · {med.concentration}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
