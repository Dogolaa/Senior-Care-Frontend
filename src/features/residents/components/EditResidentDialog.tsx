import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GENDER_OPTIONS, BLOOD_TYPE_OPTIONS } from '@/lib/constants'
import { useUpdateResident } from '../hooks/useResidents'
import type { ResidentDTO } from '@/types/api'

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  rg: z.string().min(1, 'RG obrigatório').max(20),
  dateOfBirth: z.string().min(1, 'Data de nascimento obrigatória'),
  gender: z.string().min(1, 'Gênero obrigatório'),
  bloodType: z.string().min(1, 'Tipo sanguíneo obrigatório'),
  room: z.string().min(1, 'Quarto obrigatório').max(50),
})

type FormData = z.infer<typeof schema>

interface EditResidentDialogProps {
  resident: ResidentDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditResidentDialog({ resident, open, onOpenChange }: EditResidentDialogProps) {
  const { mutate: update, isPending } = useUpdateResident(() => onOpenChange(false))

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (resident) {
      reset({
        name: resident.name,
        rg: resident.rg,
        dateOfBirth: resident.dateOfBirth,
        gender: resident.gender,
        bloodType: resident.bloodType,
        room: resident.room,
      })
    }
  }, [resident, reset])

  const onSubmit = (data: FormData) => {
    if (!resident) return
    update({ id: resident.id, data })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Residente</DialogTitle>
          {resident && (
            <p className="text-sm text-muted-foreground">CPF: {resident.cpf}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome completo</Label>
            <Input id="edit-name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rg">RG</Label>
              <Input id="edit-rg" {...register('rg')} />
              {errors.rg && <p className="text-sm text-destructive">{errors.rg.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-room">Quarto</Label>
              <Input id="edit-room" placeholder="Ex: Quarto 101" {...register('room')} />
              {errors.room && <p className="text-sm text-destructive">{errors.room.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dob">Data de Nascimento</Label>
            <Input id="edit-dob" type="date" {...register('dateOfBirth')} />
            {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select
                defaultValue={resident?.gender}
                onValueChange={(v) => setValue('gender', v)}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo Sanguíneo</Label>
              <Select
                defaultValue={resident?.bloodType}
                onValueChange={(v) => setValue('bloodType', v)}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bloodType && <p className="text-sm text-destructive">{errors.bloodType.message}</p>}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
