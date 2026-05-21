import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data)
      navigate('/dashboard')
    },
    onError: () => {
      toast.error('E-mail ou senha incorretos. Verifique e tente novamente.')
    },
  })
}
