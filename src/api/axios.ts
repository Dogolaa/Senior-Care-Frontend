import axios from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data
    const backendMsg = typeof data?.message === 'string' ? data.message : null

    if (status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 403) {
      toast.error(backendMsg ?? 'Você não tem permissão para realizar esta ação.')
      return Promise.reject(error)
    }

    if (status === 404) {
      toast.error(backendMsg ?? 'Recurso não encontrado.')
      return Promise.reject(error)
    }

    if (status === 400) {
      toast.error(backendMsg ?? 'Dados inválidos. Verifique as informações e tente novamente.')
      return Promise.reject(error)
    }

    if (status >= 500) {
      toast.error(backendMsg ?? 'Erro interno do servidor. Tente novamente em instantes.')
      return Promise.reject(error)
    }

    toast.error(backendMsg ?? 'Ocorreu um erro inesperado.')
    return Promise.reject(error)
  }
)

export default api
