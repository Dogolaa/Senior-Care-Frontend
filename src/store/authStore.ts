import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LoginResponse } from '@/types/api'

interface AuthState {
  token: string | null
  userId: string | null
  name: string | null
  email: string | null
  role: string | null
  photoUrl: string | null
  mustChangePassword: boolean
  isAuthenticated: boolean
  setAuth: (data: LoginResponse) => void
  setPhotoUrl: (url: string) => void
  setMustChangePassword: (value: boolean) => void
  clearAuth: () => void
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,
      email: null,
      role: null,
      photoUrl: null,
      mustChangePassword: false,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          token: data.token,
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
          mustChangePassword: data.mustChangePassword,
          isAuthenticated: true,
        }),

      setPhotoUrl: (url) => set({ photoUrl: url }),

      setMustChangePassword: (value) => set({ mustChangePassword: value }),

      clearAuth: () =>
        set({
          token: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          photoUrl: null,
          mustChangePassword: false,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'senior-care-auth',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token && isTokenExpired(state.token)) {
          state.clearAuth()
        }
      },
    }
  )
)

export { isTokenExpired }
