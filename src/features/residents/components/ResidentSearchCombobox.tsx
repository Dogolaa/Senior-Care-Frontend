import { useState, useRef, useEffect } from 'react'
import { Search, X, User } from 'lucide-react'
import { useResidentSearch } from '@/features/residents/hooks/useResidents'
import { formatCPF } from '@/lib/utils'
import type { ResidentDTO } from '@/types/api'
import { cn } from '@/lib/utils'

interface ResidentSearchComboboxProps {
  onSelect: (resident: ResidentDTO | null) => void
  placeholder?: string
  className?: string
}

export function ResidentSearchCombobox({
  onSelect,
  placeholder = 'Buscar residente por nome ou CPF...',
  className,
}: ResidentSearchComboboxProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: residents, isLoading } = useResidentSearch()

  const q = inputValue.toLowerCase().trim()

  const sortScore = (name: string): number => {
    const lower = name.toLowerCase()
    if (lower.startsWith(q)) return 0
    if (lower.split(' ').some((word) => word.startsWith(q))) return 1
    return 2
  }

  const filtered = (residents ?? [])
    .filter((r) => {
      if (!q) return true
      const cpfDigits = q.replace(/\D/g, '')
      return (
        r.name.toLowerCase().includes(q) ||
        (cpfDigits.length > 0 && r.cpf.replace(/\D/g, '').includes(cpfDigits))
      )
    })
    .sort((a, b) => {
      const diff = sortScore(a.name) - sortScore(b.name)
      if (diff !== 0) return diff
      return a.name.localeCompare(b.name, 'pt-BR')
    })

  const handleSelect = (resident: ResidentDTO) => {
    setSelectedResident(resident)
    setInputValue(resident.name)
    setIsOpen(false)
    onSelect(resident)
  }

  const handleClear = () => {
    setSelectedResident(null)
    setInputValue('')
    setIsOpen(false)
    onSelect(null)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsOpen(true)
    if (selectedResident) {
      setSelectedResident(null)
      onSelect(null)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (!selectedResident) setInputValue('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedResident])

  const showDropdown = isOpen && inputValue.length >= 1

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
            'w-full h-12 pl-10 pr-10 rounded-lg border border-input bg-background text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'placeholder:text-muted-foreground',
            selectedResident && 'font-medium',
          )}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar seleção"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando residentes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Nenhum residente encontrado para "{inputValue}"
            </div>
          ) : (
            filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(r)
                }}
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    CPF: {formatCPF(r.cpf)}
                    {r.room && ` · Quarto ${r.room}`}
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
