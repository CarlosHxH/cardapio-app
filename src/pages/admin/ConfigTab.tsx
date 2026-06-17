import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Key, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ConfigTab() {
  const { user } = useAuth()
  const [nova,  setNova]  = useState('')
  const [conf,  setConf]  = useState('')
  const [error, setError] = useState('')
  const [ok,    setOk]    = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTrocar(e: React.FormEvent) {
    e.preventDefault()
    if (nova !== conf) { setError('As senhas não coincidem.'); return }
    if (nova.length < 6) { setError('Mínimo 6 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: nova })
      if (error) throw new Error(error.message)
      setOk('Senha alterada com sucesso!')
      setNova(''); setConf('')
      setTimeout(()=>setOk(''), 3000)
    } catch (e: any) {
      setError(e.message || 'Erro ao trocar senha.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-sm space-y-4">
      <h2 className="text-xl font-bold font-display text-stone-800">Configurações</h2>

      <div className="p-4 bg-white border shadow-sm rounded-2xl border-stone-100">
        <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-stone-400">Logado como</p>
        <p className="font-bold text-stone-800">{user?.email}</p>
      </div>

      <div className="p-5 bg-white border shadow-sm rounded-2xl border-stone-100">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-stone-800"><Key className="w-4 h-4 text-brand-600"/>Trocar Senha</h3>
        <form onSubmit={handleTrocar} className="space-y-3">
          {[
            {label:'Nova Senha',    val:nova, set:setNova},
            {label:'Confirmar Nova',val:conf, set:setConf},
          ].map(f => (
            <div key={f.label}>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-stone-500">{f.label}</label>
              <input type="password" value={f.val} onChange={e=>f.set(e.target.value)} required minLength={6}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"/>
            </div>
          ))}
          {error && <div className="flex items-center gap-2 p-2 text-xs text-red-700 rounded-lg bg-red-50"><AlertCircle className="w-3.5 h-3.5"/>{error}</div>}
          {ok    && <div className="flex items-center gap-2 p-2 text-xs rounded-lg text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3.5 h-3.5"/>{ok}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition disabled:opacity-60">
            {loading ? 'Salvando…' : 'Trocar Senha'}
          </button>
        </form>
      </div>

      <div className="p-4 text-sm text-blue-800 border border-blue-200 bg-blue-50 rounded-2xl">
        <p className="mb-1 font-semibold">ℹ️ Supabase Auth</p>
        <p className="text-xs leading-relaxed text-blue-600">A senha é gerenciada diretamente pelo Supabase Authentication. Você também pode redefinir pelo painel do Supabase em Authentication → Users.</p>
      </div>
    </div>
  )
}
