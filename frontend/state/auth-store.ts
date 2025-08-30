import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Guardian, Child } from '@ai-education/schemas'

interface AuthState {
  guardian: Guardian | null
  user: Guardian | null  // Alias for guardian to fix TypeScript errors
  currentChild: Child | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (data: { guardian: Guardian; accessToken: string; refreshToken: string }) => void
  setCurrentChild: (child: Child | null) => void
  logout: () => void
  clearTokens: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      guardian: null,
      user: null,  // Alias for guardian
      currentChild: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Actions
      setAuth: (data) => set({
        guardian: data.guardian,
        user: data.guardian,  // Keep user in sync with guardian
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true
      }),

      setCurrentChild: (child) => set({ currentChild: child }),

      logout: () => set({
        guardian: null,
        user: null,
        currentChild: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false
      }),

      clearTokens: () => set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        guardian: state.guardian,
        currentChild: state.currentChild,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
