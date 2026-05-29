import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { GENDER_OPTIONS, BLOOD_TYPE_OPTIONS } from '@/lib/constants'
import { useAdmitResident } from '../hooks/useResidents'

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string().length(11, 'CPF deve ter exatamente 11 dígitos').regex(/^\d+$/, 'CPF deve conter apenas números'),
  rg: z.string().min(1, 'RG obrigatório').max(20, 'RG muito longo'),
  dateOfBirth: z.string().min(1, 'Data de nascimento obrigatória'),
  gender: z.string().min(1, 'Gênero obrigatório'),
  bloodType: z.string().min(1, 'Tipo sanguíneo obrigatório'),
  room: z.string().min(1, 'Quarto obrigatório').max(50),
})

type FormData = z.infer<typeof schema>

interface AdmitResidentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdmitResidentDialog({ open, onOpenChange }: AdmitResidentDialogProps) {
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState('')

  const { mutate: admit, isPending } = useAdmitResident(() => {
    reset()
    setAllergies([])
    setAllergyInput('')
    onOpenChange(false)
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const dateOfBirth = watch('dateOfBirth')

  const addAllergy = () => {
    const trimmed = allergyInput.trim()
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies((prev) => [...prev, trimmed])
    }
    setAllergyInput('')
  }

  const removeAllergy = (allergy: string) => {
    setAllergies((prev) => prev.filter((a) => a !== allergy))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admitir Novo Residente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => admit({ ...data, initialAllergies: allergies }))} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Nome do residente" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (somente números)</Label>
              <Input id="cpf" placeholder="12345678901" maxLength={11} {...register('cpf')} />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" placeholder="MG-1234567" {...register('rg')} />
              {errors.rg && <p className="text-sm text-destructive">{errors.rg.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <DatePicker
                value={dateOfBirth}
                onChange={(v) => setValue('dateOfBirth', v, { shouldValidate: true })}
                placeholder="Selecionar"
                toYear={new Date().getFullYear() - 40}
              />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Quarto</Label>
              <Input id="room" placeholder="Ex: Quarto 101" {...register('room')} />
              {errors.room && <p className="text-sm text-destructive">{errors.room.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select onValueChange={(v) => setValue('gender', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo Sanguíneo</Label>
              <Select onValueChange={(v) => setValue('bloodType', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.bloodType && <p className="text-sm text-destructive">{errors.bloodType.message}</p>}
            </div>
          </div>

          {/* Alergias iniciais */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Alergias conhecidas <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </Label>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-md border bg-amber-50/50 border-amber-200">
                {allergies.map((a) => (
                  <Badge
                    key={a}
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 border-amber-300 gap-1 pr-1"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => removeAllergy(a)}
                      className="ml-0.5 rounded-full hover:bg-amber-200 p-0.5 transition-colors"
                      aria-label={`Remover alergia ${a}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Penicilina, Dipirona"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addAllergy() }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addAllergy} className="shrink-0">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Admitindo...' : 'Admitir Residente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
