import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      

      login: async (email: string, password: string) => {
        try {
          // Chamada real para a API de login
          const res = await (await import('../lib/api')).default.post('/auth/login', { email, password })
          const { user, token } = res.data.data
          set({
            user,
            isAuthenticated: true,
            token
          })
          // Salva o token no localStorage para o interceptor do axios
          localStorage.setItem('token', token)
        } catch (error: any) {
          // Mensagem de erro amigável
          throw new Error(error?.response?.data?.message || 'Credenciais inválidas')
        }
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null
        })
      },
      
      setUser: (user: User) => {
        set({ user })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
)
