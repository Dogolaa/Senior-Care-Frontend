import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { usePromoteEmployee } from '../hooks/useEmployees'

const formSchema = z.object({
  type: z.enum(['nurse', 'doctor', 'manager']),
  userId: z.string().uuid('ID de usuário inválido'),
  admissionDate: z.string().min(1, 'Data de admissão obrigatória'),
  shift: z.string().min(1, 'Turno obrigatório'),
  coren: z.string().optional(),
  crm: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'nurse') {
    if (!data.coren?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['coren'], message: 'COREN obrigatório' })
    if (!data.specialization?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['specialization'], message: 'Especialização obrigatória' })
  }
  if (data.type === 'doctor') {
    if (!data.crm?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['crm'], message: 'CRM obrigatório' })
    if (!data.specialization?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['specialization'], message: 'Especialização obrigatória' })
  }
  if (data.type === 'manager') {
    if (!data.department?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['department'], message: 'Departamento obrigatório' })
  }
})

type FormData = z.infer<typeof formSchema>
type EmployeeType = 'nurse' | 'doctor' | 'manager'

interface PromoteEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_TYPE_LABELS = { nurse: 'Enfermeiro', doctor: 'Médico', manager: 'Gerente' }

export function PromoteEmployeeDialog({ open, onOpenChange }: PromoteEmployeeDialogProps) {
  const [employeeType, setEmployeeType] = useState<EmployeeType>('nurse')
  const { mutate: promote, isPending } = usePromoteEmployee()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: 'nurse' },
  })

  const admissionDate = watch('admissionDate')

  const onSubmit = (data: FormData) => {
    const { type, coren, crm, specialization, department, ...base } = data
    const roleData = type === 'nurse'
      ? { ...base, coren: coren!, specialization: specialization! }
      : type === 'doctor'
      ? { ...base, crm: crm!, specialization: specialization! }
      : { ...base, department: department! }

    promote(
      { type, data: roleData as Parameters<typeof promote>[0]['data'] },
      { onSuccess: () => { reset({ type: 'nurse' }); setEmployeeType('nurse'); onOpenChange(false) } }
    )
  }

  const handleTypeChange = (val: EmployeeType) => {
    setEmployeeType(val)
    reset({ type: val })
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
            <Label>Data de Admissão</Label>
            <DatePicker
              value={admissionDate}
              onChange={(v) => setValue('admissionDate', v, { shouldValidate: true })}
              placeholder="Selecionar data de admissão"
              fromYear={2000}
              toYear={new Date().getFullYear() + 1}
            />
            {errors.admissionDate && <p className="text-sm text-destructive">{errors.admissionDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Turno</Label>
            <Select onValueChange={(v) => setValue('shift', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Selecionar turno" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Manhã</SelectItem>
                <SelectItem value="AFTERNOON">Tarde</SelectItem>
                <SelectItem value="NIGHT">Noite</SelectItem>
              </SelectContent>
            </Select>
            {errors.shift && <p className="text-sm text-destructive">{errors.shift.message}</p>}
          </div>

          {employeeType === 'nurse' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="coren">COREN</Label>
                <Input id="coren" placeholder="Ex: MG-123456" {...register('coren')} />
                {errors.coren && <p className="text-sm text-destructive">{errors.coren.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input id="specialization" placeholder="Ex: Geriatria" {...register('specialization')} />
                {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
              </div>
            </>
          )}

          {employeeType === 'doctor' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="crm">CRM</Label>
                <Input id="crm" placeholder="Ex: MG-123456" {...register('crm')} />
                {errors.crm && <p className="text-sm text-destructive">{errors.crm.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input id="specialization" placeholder="Ex: Cardiologia" {...register('specialization')} />
                {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
              </div>
            </>
          )}

          {employeeType === 'manager' && (
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input id="department" placeholder="Ex: Enfermagem" {...register('department')} />
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
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
