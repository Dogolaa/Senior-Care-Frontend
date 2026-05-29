import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, UserPlus, Star, Trash2, Crown, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { getUser } from '@/api/users'
import { formatPhone } from '@/lib/utils'
import {
  useCreateAndLinkFamilyMember,
  useRemoveFamilyLink,
  useSetPrimaryContact,
} from '../hooks/useResidents'
import type { FamilyLinkDTO, ResidentDTO } from '@/types/api'

const newFamilySchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  relationship: z.string().min(2, 'Informe o parentesco'),
  isPrimaryContact: z.boolean().default(false),
})
type NewFamilyFormData = z.infer<typeof newFamilySchema>

function FamilyLinkRow({
  link,
  residentId,
  canManage,
}: {
  link: FamilyLinkDTO
  residentId: string
  canManage: boolean
}) {
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
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          {loadingUser ? (
            <div className="h-5 w-5 rounded-full bg-blue-200 animate-pulse" />
          ) : (
            <span className="text-blue-700 font-bold text-sm">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {loadingUser ? (
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-44 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <p className="font-semibold text-sm text-foreground">{user?.name ?? '—'}</p>
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
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                )}
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formatPhone(user.phone)}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Ações */}
        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            {!link.primaryContact && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-amber-700 hover:bg-amber-50"
                disabled={settingPrimary}
                onClick={() => setPrimary(link.id)}
              >
                <Star className="h-3 w-3 mr-1" />
                Principal
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover vínculo familiar?"
        description={`Tem certeza que deseja remover ${user?.name ?? 'este familiar'} como ${link.relationship}? O usuário ainda existirá no sistema.`}
        confirmLabel="Sim, remover vínculo"
        isLoading={removing}
        onConfirm={() => remove(link.id, { onSuccess: () => setConfirmRemove(false) })}
      />
    </div>
  )
}

interface FamilyMembersDialogProps {
  resident: ResidentDTO
  open: boolean
  onOpenChange: (v: boolean) => void
  canManage: boolean
}

export function FamilyMembersDialog({ resident, open, onOpenChange, canManage }: FamilyMembersDialogProps) {
  const [showForm, setShowForm] = useState(false)
  const { mutate: createAndLink, isPending } = useCreateAndLinkFamilyMember(resident.id, () => {
    reset()
    setShowForm(false)
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<NewFamilyFormData>({
    resolver: zodResolver(newFamilySchema),
    defaultValues: { isPrimaryContact: false },
  })

  const isPrimary = watch('isPrimaryContact')
  const familyLinks = resident.familyLinks ?? []

  const onSubmit = (data: NewFamilyFormData) => {
    const { relationship, isPrimaryContact, phone, ...familyData } = data
    createAndLink({
      familyData: { ...familyData, phone: phone || undefined },
      linkData: { relationship, isPrimaryContact },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Familiares — {resident.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {familyLinks.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum familiar vinculado"
              description="Cadastre o primeiro familiar para este residente."
            />
          ) : (
            <div className="space-y-2">
              {familyLinks.map((link) => (
                <FamilyLinkRow
                  key={link.id}
                  link={link}
                  residentId={resident.id}
                  canManage={canManage}
                />
              ))}
            </div>
          )}

          {canManage && (
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full"
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar novo familiar
                {showForm ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
              </button>

              {showForm && (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                    Um e-mail com a senha temporária será enviado ao familiar após o cadastro.
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fm-name">Nome completo</Label>
                      <Input id="fm-name" placeholder="Ex: Maria da Silva" {...register('name')} />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fm-email">E-mail</Label>
                      <Input id="fm-email" type="email" placeholder="email@exemplo.com" {...register('email')} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fm-phone">Telefone <span className="text-muted-foreground">(opcional)</span></Label>
                      <Input id="fm-phone" placeholder="(11) 99999-9999" {...register('phone')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fm-relationship">Parentesco</Label>
                      <Input id="fm-relationship" placeholder="Ex: Filho, Filha, Cônjuge, Sobrinho" {...register('relationship')} />
                      {errors.relationship && <p className="text-sm text-destructive">{errors.relationship.message}</p>}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        role="checkbox"
                        aria-checked={isPrimary}
                        onClick={() => setValue('isPrimaryContact', !isPrimary)}
                        className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                          isPrimary ? 'bg-primary border-primary' : 'border-input'
                        }`}
                      >
                        {isPrimary && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span className="text-sm font-medium">Definir como contato principal</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowForm(false); reset() }}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isPending}>
                      {isPending ? 'Cadastrando...' : 'Cadastrar e vincular'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
