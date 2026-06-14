import { useState, useEffect, createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthCtx {
  user:    User | null
  loading: boolean
  login:   (email: string, senha: string) => Promise<void>
  logout:  () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  login: async () => {}, logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Ouve mudanças de sessão (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(error.message === 'Invalid login credentials'
      ? 'E-mail ou senha inválidos.'
      : error.message
    )
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() { return useContext(Ctx) }
