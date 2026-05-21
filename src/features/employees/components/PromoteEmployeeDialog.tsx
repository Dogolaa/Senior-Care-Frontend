import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePromoteEmployee } from '../hooks/useEmployees'

const baseSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  admissionDate: z.string().min(1, 'Data de admissão obrigatória'),
  shift: z.string().min(1, 'Turno obrigatório'),
})

const nurseSchema = baseSchema.extend({
  type: z.literal('nurse'),
  coren: z.string().min(1, 'COREN obrigatório'),
  specialization: z.string().min(1, 'Especialização obrigatória'),
})

const doctorSchema = baseSchema.extend({
  type: z.literal('doctor'),
  crm: z.string().min(1, 'CRM obrigatório'),
  specialization: z.string().min(1, 'Especialização obrigatória'),
})

const managerSchema = baseSchema.extend({
  type: z.literal('manager'),
  department: z.string().min(1, 'Departamento obrigatório'),
})

type EmployeeType = 'nurse' | 'doctor' | 'manager'
type FormData = z.infer<typeof nurseSchema> | z.infer<typeof doctorSchema> | z.infer<typeof managerSchema>

interface PromoteEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_TYPE_LABELS = { nurse: 'Enfermeiro', doctor: 'Médico', manager: 'Gerente' }

export function PromoteEmployeeDialog({ open, onOpenChange }: PromoteEmployeeDialogProps) {
  const [employeeType, setEmployeeType] = useState<EmployeeType>('nurse')
  const { mutate: promote, isPending } = usePromoteEmployee()

  const schema = employeeType === 'nurse' ? nurseSchema : employeeType === 'doctor' ? doctorSchema : managerSchema
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as z.ZodType<FormData>),
    defaultValues: { type: 'nurse' } as FormData,
  })

  const onSubmit = (data: FormData) => {
    const { type, ...rest } = data
    promote(
      { type, data: rest as Parameters<typeof promote>[0]['data'] },
      { onSuccess: () => { reset(); onOpenChange(false) } }
    )
  }

  const handleTypeChange = (val: EmployeeType) => {
    setEmployeeType(val)
    reset({ type: val } as FormData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promover Funcionário</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          <Label>Cargo</Label>
          <Select value={employeeType} onValueChange={(v) => handleTypeChange(v as EmployeeType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(ROLE_TYPE_LABELS) as [EmployeeType, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('type')} value={employeeType} />

          <div className="space-y-2">
            <Label htmlFor="userId">ID do Usuário (UUID)</Label>
            <Input id="userId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" {...register('userId')} />
            {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admissionDate">Data de Admissão</Label>
            <Input id="admissionDate" type="date" {...register('admissionDate')} />
            {errors.admissionDate && <p className="text-sm text-destructive">{errors.admissionDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Turno</Label>
            <Select onValueChange={(v) => setValue('shift' as keyof FormData, v as never)}>
              <SelectTrigger><SelectValue placeholder="Selecionar turno" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Manhã</SelectItem>
                <SelectItem value="AFTERNOON">Tarde</SelectItem>
                <SelectItem value="NIGHT">Noite</SelectItem>
              </SelectContent>
            </Select>
            {errors.shift && <p className="text-sm text-destructive">{(errors.shift as { message?: string }).message}</p>}
          </div>

          {employeeType === 'nurse' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="coren">COREN</Label>
                <Input id="coren" placeholder="Ex: MG-123456" {...register('coren' as keyof FormData)} />
                {'coren' in errors && <p className="text-sm text-destructive">{(errors as { coren?: { message?: string } }).coren?.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input id="specialization" placeholder="Ex: Geriatria" {...register('specialization' as keyof FormData)} />
              </div>
            </>
          )}

          {employeeType === 'doctor' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="crm">CRM</Label>
                <Input id="crm" placeholder="Ex: MG-123456" {...register('crm' as keyof FormData)} />
                {'crm' in errors && <p className="text-sm text-destructive">{(errors as { crm?: { message?: string } }).crm?.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input id="specialization" placeholder="Ex: Cardiologia" {...register('specialization' as keyof FormData)} />
              </div>
            </>
          )}

          {employeeType === 'manager' && (
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input id="department" placeholder="Ex: Enfermagem" {...register('department' as keyof FormData)} />
              {'department' in errors && <p className="text-sm text-destructive">{(errors as { department?: { message?: string } }).department?.message}</p>}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Promovendo...' : `Promover como ${ROLE_TYPE_LABELS[employeeType]}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
