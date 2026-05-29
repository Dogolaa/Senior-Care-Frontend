import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Users, Search, UserPlus, Crown, Star, Trash2, Mail, Phone } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ResidentPickerCard } from '@/features/residents/components/ResidentPickerCard'
import { getUser } from '@/api/users'
import { formatPhone } from '@/lib/utils'
import {
  useResidentSearch,
  useCreateAndLinkFamilyMember,
  useRemoveFamilyLink,
  useSetPrimaryContact,
} from '@/features/residents/hooks/useResidents'
import type { FamilyLinkDTO, ResidentDTO } from '@/types/api'

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  relationship: z.string().min(2, 'Informe o parentesco'),
  isPrimaryContact: z.boolean().default(false),
})
type FormData = z.infer<typeof schema>

function FamilyLinkRow({ link, residentId }: { link: FamilyLinkDTO; residentId: string }) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const { mutate: remove, isPending: removing } = useRemoveFamilyLink(residentId)
  const { mutate: setPrimary, isPending: settingPrimary } = useSetPrimaryContact(residentId)

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['users', link.familyMemberId],
    queryFn: () => getUser(link.familyMemberId),
    staleTime: 1000 * 60 * 10,
  })

  const initials = user
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '?'

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            {loadingUser ? (
              <div className="h-5 w-5 rounded-full bg-blue-200 animate-pulse" />
            ) : (
              <span className="text-blue-700 font-bold text-sm">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {loadingUser ? (
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-base text-foreground">{user?.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {link.relationship}
                  </span>
                  {link.primaryContact && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                      <Crown className="h-3 w-3" />
                      Contato principal
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {user?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </span>
                  )}
                  {user?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {formatPhone(user.phone)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {!link.primaryContact && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 whitespace-nowrap"
                disabled={settingPrimary}
                onClick={() => setPrimary(link.id)}
              >
                <Star className="h-3 w-3 mr-1" />
                Definir como principal
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remover vínculo
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover vínculo?"
        description={`Tem certeza que deseja remover ${user?.name ?? 'este familiar'} como ${link.relationship}? O usuário ainda existirá no sistema e poderá ser vinculado novamente.`}
        confirmLabel="Sim, remover vínculo"
        isLoading={removing}
        onConfirm={() => remove(link.id, { onSuccess: () => setConfirmRemove(false) })}
      />
    </Card>
  )
}

function ResidentFamilyPanel({ resident }: { resident: ResidentDTO }) {
  const [showForm, setShowForm] = useState(false)
  const { mutate: createAndLink, isPending } = useCreateAndLinkFamilyMember(resident.id, () => {
    reset()
    setShowForm(false)
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPrimaryContact: false },
  })

  const isPrimary = watch('isPrimaryContact')
  const familyLinks = resident.familyLinks ?? []

  const onSubmit = (data: FormData) => {
    const { relationship, isPrimaryContact, phone, ...familyData } = data
    createAndLink({
      familyData: { ...familyData, phone: phone || undefined },
      linkData: { relationship, isPrimaryContact },
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Familiares de {resident.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Quarto {resident.room}</p>
        </CardHeader>
        <CardContent>
          {familyLinks.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum familiar vinculado"
              description="Cadastre o primeiro familiar usando o formulário abaixo."
            />
          ) : (
            <div className="space-y-3">
              {familyLinks.map((link) => (
                <FamilyLinkRow key={link.id} link={link} residentId={resident.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Cadastrar novo familiar
            </CardTitle>
            {!showForm && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                <UserPlus className="h-4 w-4" />
                Novo familiar
              </Button>
            )}
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <div className="flex items-start gap-3 mb-5 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Após o cadastro, um e-mail com a senha temporária será enviado ao familiar.
                Ele deverá alterar a senha no primeiro acesso.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fm-name">Nome completo</Label>
                  <Input
                    id="fm-name"
                    placeholder="Ex: Maria da Silva"
                    className="h-11"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fm-email">E-mail</Label>
                  <Input
                    id="fm-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    className="h-11"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fm-phone">
                    Telefone <span className="text-muted-foreground text-xs">(opcional)</span>
                  </Label>
                  <Input
                    id="fm-phone"
                    placeholder="(11) 99999-9999"
                    className="h-11"
                    {...register('phone')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fm-relationship">Parentesco</Label>
                  <Input
                    id="fm-relationship"
                    placeholder="Ex: Filho, Filha, Cônjuge, Sobrinho"
                    className="h-11"
                    {...register('relationship')}
                  />
                  {errors.relationship && <p className="text-sm text-destructive">{errors.relationship.message}</p>}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                <div
                  role="checkbox"
                  aria-checked={isPrimary}
                  onClick={() => setValue('isPrimaryContact', !isPrimary)}
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isPrimary ? 'bg-primary border-primary' : 'border-input bg-background'
                  }`}
                >
                  {isPrimary && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Definir como contato principal</p>
                  <p className="text-xs text-muted-foreground">O contato principal é o primeiro a ser notificado em casos de emergência</p>
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowForm(false); reset() }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11" disabled={isPending}>
                  {isPending ? 'Cadastrando...' : 'Criar conta e vincular'}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export function FamilyMembersPage() {
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: allResidents, isLoading } = useResidentSearch(true)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allResidents ?? []
    const digits = q.replace(/\D/g, '')
    return (allResidents ?? []).filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (digits.length > 0 && r.cpf.replace(/\D/g, '').includes(digits)),
    )
  }, [allResidents, search])

  // Always derive selectedResident from the freshest data so mutations reflect immediately
  const selectedResident = useMemo(
    () => (allResidents ?? []).find((r) => r.id === selectedResidentId) ?? null,
    [allResidents, selectedResidentId]
  )

  return (
    <div>
      <PageHeader
        title="Familiares"
        description="Crie contas para os familiares e vincule-os aos residentes da instituição"
      />

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar residente por nome ou CPF..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedResidentId(null) }}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'Nenhum residente encontrado' : 'Nenhum residente cadastrado'}
          description={
            search
              ? `Não encontramos residentes para "${search}".`
              : 'Cadastre residentes antes de vincular familiares.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {filtered.map((r) => (
            <ResidentPickerCard
              key={r.id}
              resident={r}
              selected={selectedResidentId === r.id}
              onClick={() => setSelectedResidentId((prev) => prev === r.id ? null : r.id)}
            />
          ))}
        </div>
      )}

      {selectedResident && (
        <ResidentFamilyPanel resident={selectedResident} />
      )}

      {!selectedResident && !isLoading && filtered.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-muted-foreground">Selecione um residente acima</p>
          <p className="text-sm text-muted-foreground/70 mt-1">para ver e gerenciar seus familiares</p>
        </div>
      )}
    </div>
  )
}
