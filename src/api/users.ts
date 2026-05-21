import api from './axios'
import type { PaginatedResponse, PaginationParams, UserDTO, UpdateUserRequest } from '@/types/api'

export const getUsers = (params?: PaginationParams): Promise<PaginatedResponse<UserDTO>> =>
  api.get('/users', { params }).then((r) => r.data)

export const getUser = (id: string): Promise<UserDTO> =>
  api.get(`/users/${id}`).then((r) => r.data)

export const updateUser = (id: string, data: UpdateUserRequest): Promise<void> =>
  api.put(`/users/${id}`, data)

export const deleteUser = (id: string): Promise<void> =>
  api.delete(`/users/${id}`)

export const updateUserPhoto = (id: string, photoUrl: string): Promise<void> =>
  api.patch(`/users/${id}/photo`, { photoUrl })
