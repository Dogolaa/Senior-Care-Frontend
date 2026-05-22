import { useMemo, useState } from 'react'
import { BedDouble, Search, FileHeart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useResidentSearch } from '@/features/residents/hooks/useResidents'
import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'
import { formatDate } from '@/lib/utils'
import type { ResidentDTO } from '@/types/api'

function calcAge(dateOfBirth: string): number {
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function RoomCard({ room, residents }: { room: string; residents: ResidentDTO[] }) {
  const isSingle = residents.length === 1
  const single = residents[0]

  const header = (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="text-lg leading-none">Quarto {room}</CardTitle>
        <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
          {isSingle ? 'Ocupado' : `${residents.length} residentes`}
        </Badge>
      </div>
    </CardHeader>
  )

  if (isSingle) {
    return (
      <Link to="/health-records">
        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-green-500">
          {header}
          <CardContent>
            <p className="font-semibold">{single.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {calcAge(single.dateOfBirth)} anos
              {single.admissionDate && ` · desde ${formatDate(single.admissionDate)}`}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
              <FileHeart className="h-3.5 w-3.5" />
              Ver Prontuário
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="h-full border-l-4 border-l-green-500">
      {header}
      <CardContent className="space-y-1">
        {residents.map((r) => (
          <Link key={r.id} to="/health-records" className="block group">
            <div className="flex items-center justify-between rounded-md px-2 py-1.5 -mx-2 hover:bg-muted transition-colors">
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{r.name}</p>
                <p className="text-xs text-muted-foreground">{calcAge(r.dateOfBirth)} anos</p>
              </div>
              <FileHeart className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export function BedsPage() {
  const [search, setSearch] = useState('')
  const { role } = useAuthStore()
  const canView = hasPermission(role, 'MANAGE_RESIDENTS') || hasPermission(role, 'VIEW_RESIDENTS')

  const { data: residents, isLoading } = useResidentSearch(canView)

  const roomMap = useMemo(() => {
    const active = (residents ?? []).filter((r) => r.isActive)
    const map = new Map<string, ResidentDTO[]>()
    for (const r of active) {
      const room = r.room?.trim() || 'Sem quarto'
      if (!map.has(room)) map.set(room, [])
      map.get(room)!.push(r)
    }
    return map
  }, [residents])

  const rooms = useMemo(() => {
    const q = search.trim().toLowerCase()
    const entries = [...roomMap.entries()]
    const filtered = q
      ? entries.filter(
          ([room, res]) =>
            room.toLowerCase().includes(q) ||
            res.some((r) => r.name.toLowerCase().includes(q))
        )
      : entries
    return filtered.sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }))
  }, [roomMap, search])

  const totalResidents = [...roomMap.values()].reduce((sum, r) => sum + r.length, 0)

  return (
    <div>
      <PageHeader
        title="Leitos"
        description={
          roomMap.size > 0
            ? `${roomMap.size} quarto${roomMap.size !== 1 ? 's' : ''} ocupado${roomMap.size !== 1 ? 's' : ''} · ${totalResidents} residente${totalResidents !== 1 ? 's' : ''} ativo${totalResidents !== 1 ? 's' : ''}`
            : 'Visão geral da ocupação dos quartos'
        }
      />

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Filtrar por número do quarto ou nome do residente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && rooms.length === 0 && (
        <EmptyState
          icon={BedDouble}
          title={search ? 'Nenhum resultado encontrado' : 'Nenhum quarto ocupado'}
          description={
            search
              ? `Não encontramos quartos ou residentes para "${search}".`
              : 'Nenhum residente ativo está cadastrado no sistema.'
          }
        />
      )}

      {!isLoading && rooms.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map(([room, res]) => (
            <RoomCard key={room} room={room} residents={res} />
          ))}
        </div>
      )}
    </div>
  )
}
