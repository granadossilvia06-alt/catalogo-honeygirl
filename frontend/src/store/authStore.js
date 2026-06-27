import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAdmin: false,
      isLoggedIn: false,

      login: (token, userData) => set({
        token,
        user: userData,
        isAdmin: userData.role === 'admin',
        isLoggedIn: true,
      }),

      logout: () => set({ token: null, user: null, isAdmin: false, isLoggedIn: false }),
    }),
    { name: 'honeygirl-auth' }
  )
)
