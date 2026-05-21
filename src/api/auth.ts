import api from './axios'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api'

export const login = (data: LoginRequest): Promise<LoginResponse> =>
  api.post('/auth/login', data).then((r) => r.data)

export const register = (data: RegisterRequest): Promise<void> =>
  api.post('/auth/register', data).then((r) => r.data)

export const changePassword = (newPassword: string): Promise<void> =>
  api.post('/auth/change-password', { newPassword })
