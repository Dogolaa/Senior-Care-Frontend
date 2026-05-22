import { useState, useMemo, useRef, useEffect } from 'react'
import { FileHeart, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { ResidentHealthView } from '@/features/health-records/components/ResidentHealthView'
import { useResidentSearch, useLinkedResidents } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import type { ResidentDTO } from '@/types/api'

export function HealthRecordsPage() {
  const [selectedResident, setSelectedResident] = useState<ResidentDTO | null>(null)
  const [search, setSearch] = useState('')
  const healthViewRef = useRef<HTMLDivElement>(null)
  const { role, userId } = useAuthStore()
  const readOnly = !hasPermission(role, 'MANAGE_HEALTH_RECORDS')
  const isFamily = role === 'FAMILY_MEMBER'
  const canListAll = hasPermission(role, 'MANAGE_RESIDENTS') || hasPermission(role, 'VIEW_RESIDENTS')

  const { data: allResidents, isLoading: allLoading } = useResidentSearch(canListAll)
  const { data: linkedResidents, isLoading: linkedLoading } = useLinkedResidents(userId, isFamily)

  const residentsLoading = isFamily ? linkedLoading : allLoading
  const baseResidents = isFamily ? (linkedResidents ?? []) : (allResidents ?? [])

  const filtered = useMemo(() => {
    if (isFamily) return baseResidents
    const q = search.trim().toLowerCase()
    if (!q) return baseResidents
    const digits = q.replace(/\D/g, '')
    return baseResidents.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (digits.length > 0 && r.cpf.replace(/\D/g, '').includes(digits)),
    )
  }, [baseResidents, search, isFamily])

  useEffect(() => {
    if (isFamily && linkedResidents?.length === 1 && !selectedResident) {
      setSelectedResident(linkedResidents[0])
    }
  }, [isFamily, linkedResidents, selectedResident])

  const handleSelect = (resident: ResidentDTO) => {
    setSelectedResident(resident)
    setTimeout(() => healthViewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <div>
      <PageHeader
        title="Prontuários"
        description={readOnly ? 'Acompanhe os registros de saúde' : 'Consulte e atualize os registros de saúde dos residentes'}
      />

      {!isFamily && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Filtrar residentes por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {residentsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {Array.from({ length: isFamily ? 1 : 8 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileHeart}
          title={isFamily ? 'Nenhum residente vinculado' : search ? 'Nenhum residente encontrado' : 'Nenhum residente cadastrado'}
          description={
            isFamily
              ? 'Você ainda não está vinculado a nenhum residente. Entre em contato com o gestor da instituição.'
              : search
              ? `Não encontramos residentes para "${search}".`
              : 'Não há residentes cadastrados no sistema.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {filtered.map((r) => (
            <ResidentPickerCard
              key={r.id}
              resident={r}
              selected={selectedResident?.id === r.id}
              onClick={() => handleSelect(r)}
            />
          ))}
        </div>
      )}

      {selectedResident && (
        <div ref={healthViewRef} className="scroll-mt-4">
          <ResidentHealthView resident={selectedResident} readOnly={readOnly} />
        </div>
      )}
    </div>
  )
}
