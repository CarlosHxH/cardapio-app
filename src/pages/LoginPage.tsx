import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UtensilsCrossed, Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]   = useState('')
  const [senha,    setSenha]   = useState('')
  const [error,    setError]   = useState('')
  const [loading,  setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <UtensilsCrossed className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-3xl font-display font-black text-white">Tempero Cuiabano</h1>
          <p className="text-brand-200 text-sm mt-1">Painel Administrativo</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-display font-bold text-stone-800 mb-6">Entrar</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@tempero.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-stone-50 focus:bg-white transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-stone-50 focus:bg-white transition" />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition shadow-md disabled:opacity-60 mt-2">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-xs text-stone-400 mt-6">
            <a href="/" className="text-brand-600 hover:underline font-medium">← Ir para o cardápio</a>
          </p>
        </div>
      </div>
    </div>
  )
}
