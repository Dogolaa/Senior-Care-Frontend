import { useState } from 'react'
import { Search, Pill, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useMedicationSearch } from '@/features/medications/hooks/useMedications'

export function MedicationsPage() {
  const [search, setSearch] = useState('')
  const { data: medications, isLoading, isFetching } = useMedicationSearch(search)

  return (
    <div>
      <PageHeader
        title="Medicamentos"
        description="Pesquise medicamentos disponíveis no sistema"
      />

      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Digite o nome do medicamento (ex: Dipirona)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isFetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {search.length < 2 && (
        <div className="text-center py-12 text-muted-foreground">
          <Pill className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Digite ao menos 2 caracteres para buscar</p>
        </div>
      )}

      {search.length >= 2 && isLoading && <TableSkeleton rows={4} />}

      {search.length >= 2 && !isLoading && (!medications || medications.length === 0) && (
        <EmptyState
          icon={Pill}
          title="Nenhum medicamento encontrado"
          description={`Não encontramos resultados para "${search}". Tente outro nome ou princípio ativo.`}
        />
      )}

      {medications && medications.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{medications.length} resultado(s) para "{search}"</p>
          {medications.map((med) => (
            <Card key={med.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{med.commercialName}</h3>
                      {med.controlledSubstance && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Controlado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{med.activeIngredient}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span><strong className="text-foreground/70">Forma:</strong> {med.pharmaceuticalForm}</span>
                      <span><strong className="text-foreground/70">Concentração:</strong> {med.concentration}</span>
                      <span><strong className="text-foreground/70">Classe:</strong> {med.therapeuticClass}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{med.manufacturer}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{med.registrationNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
