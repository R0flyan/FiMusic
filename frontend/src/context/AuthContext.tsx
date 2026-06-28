import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User, login as apiLogin, register as apiRegister, getMe } from '../api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token')
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      getMe(token)
        .then((user) => {
          setUser(user)
          setIsLoading(false)
        })
        .catch(() => {
          // Токен невалидный - очищаем
          setToken(null)
          setUser(null)
          localStorage.removeItem('access_token')
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [token])

  // Снимаем загрузку после первого рендера если что-то пошло не так
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const login = async (username: string, password: string) => {
    const response = await apiLogin(username, password)
    setToken(response.access_token)
    localStorage.setItem('access_token', response.access_token)
    
    try {
      const user = await getMe(response.access_token)
      setUser(user)
    } catch {
      setUser({ id: 0, email: '', username, is_active: true })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    await apiRegister(email, username, password)
    // После регистрации автоматически логинимся
    await login(username, password)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}