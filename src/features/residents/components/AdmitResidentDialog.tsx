import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const { mutate: admit, isPending } = useAdmitResident(() => { reset(); onOpenChange(false) })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admitir Novo Residente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => admit(data))} className="space-y-4" noValidate>
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
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
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
              <Select onValueChange={(v) => setValue('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo Sanguíneo</Label>
              <Select onValueChange={(v) => setValue('bloodType', v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.bloodType && <p className="text-sm text-destructive">{errors.bloodType.message}</p>}
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
