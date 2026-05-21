import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SHIFT_OPTIONS } from '@/lib/constants'
import { useUpdateEmployee } from '../hooks/useEmployees'
import { RoleBadge } from './RoleBadge'
import type { EmployeeDetailsDTO } from '@/types/api'

const schema = z.object({
  admissionDate: z.string().min(1, 'Data de admissão obrigatória'),
  shift: z.string().min(1, 'Turno obrigatório'),
  specialization: z.string().optional(),
  coren: z.string().optional(),
  crm: z.string().optional(),
  department: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface EditEmployeeDialogProps {
  employee: EmployeeDetailsDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({ employee, open, onOpenChange }: EditEmployeeDialogProps) {
  const { mutate: update, isPending } = useUpdateEmployee()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (employee) {
      reset({
        admissionDate: employee.admissionDate,
        shift: employee.shift ?? '',
        specialization: employee.specialization ?? '',
        coren: employee.coren ?? '',
        crm: employee.crm ?? '',
        department: employee.department ?? '',
      })
    }
  }, [employee, reset])

  const onSubmit = (data: FormData) => {
    if (!employee) return
    update({ id: employee.employeeId, data }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          {employee && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{employee.name}</span>
              <RoleBadge role={employee.role} />
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="emp-admission">Data de Admissão</Label>
            <Input id="emp-admission" type="date" {...register('admissionDate')} />
            {errors.admissionDate && <p className="text-sm text-destructive">{errors.admissionDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Turno</Label>
            <Select
              defaultValue={employee?.shift ?? ''}
              onValueChange={(v) => setValue('shift', v)}
            >
              <SelectTrigger><SelectValue placeholder="Selecionar turno" /></SelectTrigger>
              <SelectContent>
                {SHIFT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
                <SelectItem value="DIURNO">Diurno</SelectItem>
                <SelectItem value="NOTURNO">Noturno</SelectItem>
              </SelectContent>
            </Select>
            {errors.shift && <p className="text-sm text-destructive">{errors.shift.message}</p>}
          </div>

          {employee?.role !== 'MANAGER' && (
            <div className="space-y-2">
              <Label htmlFor="emp-spec">Especialização</Label>
              <Input id="emp-spec" placeholder="Ex: Geriatria" {...register('specialization')} />
            </div>
          )}

          {employee?.role === 'NURSE' && (
            <div className="space-y-2">
              <Label htmlFor="emp-coren">COREN</Label>
              <Input id="emp-coren" placeholder="Ex: SP-123456" {...register('coren')} />
            </div>
          )}

          {employee?.role === 'DOCTOR' && (
            <div className="space-y-2">
              <Label htmlFor="emp-crm">CRM</Label>
              <Input id="emp-crm" placeholder="Ex: CRM-SP-123456" {...register('crm')} />
            </div>
          )}

          {employee?.role === 'MANAGER' && (
            <div className="space-y-2">
              <Label htmlFor="emp-dept">Departamento</Label>
              <Input id="emp-dept" placeholder="Ex: Diretoria" {...register('department')} />
            </div>
          )}

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
