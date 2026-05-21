import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Heart, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { changePassword } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

const schema = z
  .object({
    newPassword: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const setMustChangePassword = useAuthStore((s) => s.setMustChangePassword)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => changePassword(data.newPassword),
    onSuccess: () => {
      setMustChangePassword(false)
      toast.success('Senha alterada com sucesso!')
      navigate('/dashboard', { replace: true })
    },
    onError: () => {
      toast.error('Não foi possível alterar a senha. Tente novamente.')
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">SeniorCare</span>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Crie sua senha</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Por segurança, você deve criar uma nova senha antes de continuar.
              Escolha uma senha que apenas você conheça.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 h-12"
                    {...register('newPassword')}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    className="pl-10 h-12"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
