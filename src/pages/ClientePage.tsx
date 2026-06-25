import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCardapio } from '../hooks/useCardapio'
import { useCart } from '../hooks/useCart'
import { enviarPedido } from '../hooks/usePedidos'
import { formatBRL } from '../lib/utils'
import { getDadosUsuario, salvarDadosUsuario } from '../lib/userStorage'
import ModalHelpMe from '../components/ModalHelpMe'
import ItemList from '../components/ItemList'
import {
  UtensilsCrossed, Plus, Minus, ShoppingBag, Send,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, HelpCircle, ClipboardList,
  Bell, BellOff
} from 'lucide-react'
import { toast } from "sonner"
import { usePushNotifications } from '../hooks/usePushNotifications'

export default function ClientePage() {
  const { cardapio, loading } = useCardapio()
  const { cart, total, totalQtd, addItem, removeItem, qtd, clear } = useCart()
  const [marmitaIdx, setMarmitaIdx]     = useState(0)
  const [marmitaOpcao, setMarmitaOpcao] = useState<'Opção 1' | 'Opção 2'>('Opção 1')
  const [clienteNome, setClienteNome]   = useState(() => getDadosUsuario().clienteNome)
  const [setor, setSetor]               = useState(() => getDadosUsuario().setor)
  // Recolhe "Seus Dados" se já houver dados salvos; expande se for o 1º acesso
  const [dadosAbertos, setDadosAbertos] = useState(() => {
    const d = getDadosUsuario()
    return !d.clienteNome && !d.setor
  })
  const { supported: notifSupported, permission, enabled: notifEnabled, ativar: ativarNotif, desativar: desativarNotif } = usePushNotifications()
  const [ajuda, setAjuda]               = useState(false)
  const [cartOpen, setCartOpen]         = useState(true)
  const [sending, setSending]           = useState(false)
  const [error, setError]               = useState('')

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  function addMarmita() {
    const m = cardapio.marmitas[marmitaIdx]
    if (m) addItem(`Marmita ${m.tamanho}`, m.preco, marmitaOpcao)
  }

  async function handleEnviar() {
    if (!clienteNome.trim()) { setError('Informe seu nome.'); return }
    if (!setor.trim())       { setError('Informe o setor.'); return }
    if (!cart.length)        { setError('Adicione pelo menos um item.'); return }
    setError('')
    setSending(true)
    try {
      await enviarPedido({ clienteNome: clienteNome.trim(), setor: setor.trim(), itens: cart, total })
      salvarDadosUsuario({ clienteNome: clienteNome.trim(), setor: setor.trim() })
      clear()
      setCartOpen(false)
      toast(
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold">Pedido enviado! O restaurante já recebeu. 🎉</p>
            <Link to="/pedidos" className="text-xs text-emerald-700 underline mt-0.5 inline-block hover:text-emerald-900">
              Ver todos os pedidos de hoje →
            </Link>
          </div>
        </div>,
        { 
          duration: 8000,
          position: 'top-right',
          style: { maxWidth: '100%', width: 'auto' }
         }
      )
    } catch (e: any) {
      setError(e.message || 'Erro ao enviar. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const op1r = cardapio.opcao1.slice(0,2).join(', ')
  const op2r = cardapio.opcao2.slice(0,2).join(', ')

  return (
    <div className="h-screen overflow-y-auto bg-stone-50">
      {/* Header */}
      <header className="bg-brand-700 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setAjuda(true)} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              <h1 className="text-xl font-display font-black">Tempero Cuiabano</h1>  
            </div>
            <p className="text-xs text-brand-200 mt-0.5">Cardápio do Dia</p>
          </div>
          <div className="flex relative items-center gap-1">
            {notifSupported && permission !== 'denied' && (
              <button
                onClick={notifEnabled ? desativarNotif : ativarNotif}
                title={notifEnabled ? 'Desativar notificações' : 'Ativar notificações'}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center relative"
              >
                {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 opacity-60" />}
                {notifEnabled && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-brand-700" />
                )}
              </button>
            )}
            <Link to="/pedidos" title="Pedidos do dia" className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </Link>
            <span className="text-[10px] absolute bottom-[-16px] right-[5px] text-stone-200">v{__APP_VERSION__}</span>
          </div>
        </div>
      </header>

      {notifSupported && permission === 'default' && (
        <div className="bg-brand-50 border-b border-brand-100 px-4 py-2.5 flex items-center gap-3">
          <Bell className="w-4 h-4 text-brand-600 shrink-0" />
          <p className="text-xs text-stone-600 flex-1">Quer ser avisado quando o cardápio do dia mudar?</p>
          <button onClick={ativarNotif} className="text-xs font-bold text-brand-700 hover:text-brand-900 shrink-0">
            Ativar
          </button>
        </div>
      )}

      <main className="max-w-md mx-auto px-4 mt-4 space-y-5 pb-2">
        {/* Dados */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <button onClick={() => setDadosAbertos(o => !o)}
            className={`w-full flex items-center justify-between text-left ${dadosAbertos ? 'border-b border-stone-100 pb-2 mb-3' : ''}`}>
            <div className="flex flex-col">
              <h2 className="text-base font-display font-bold text-brand-700">Seus Dados</h2>
              {!dadosAbertos && (clienteNome || setor) && (
                <p className="text-xs text-stone-400 mt-0.5">{[clienteNome, setor].filter(Boolean).join(' · ')}</p>
              )}
            </div>
            {dadosAbertos
              ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
              : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
          </button>
          {dadosAbertos && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Seu Nome</label>
                <input type="text" value={clienteNome} onChange={e => setClienteNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Setor</label>
                <input type="text" value={setor} onChange={e => setSetor(e.target.value)}
                  placeholder="Ex: GESIS, SESP, TI..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition" />
              </div>
            </div>
          )}
        </section>

        {/* Menu */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-base font-display font-bold text-brand-700 border-b border-stone-100 pb-2 mb-3">Menu do Dia</h2>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">1ª Opção</p>
              <p className="text-sm text-stone-600 leading-relaxed">{cardapio.opcao1.join(', ')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">2ª Opção</p>
              <p className="text-sm text-stone-600 leading-relaxed">{cardapio.opcao2.join(', ')}</p>
            </div>
          </div>
        </section>

        {/* Marmita */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-base font-display font-bold text-brand-700 border-b border-stone-100 pb-2 mb-3">Escolha sua Marmita</h2>
          <div className="bg-stone-50 rounded-xl p-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Tamanho</label>
              <div className="relative">
                <select value={marmitaIdx} onChange={e => setMarmitaIdx(Number(e.target.value))}
                  className="w-full appearance-none p-2.5 pr-8 rounded-xl border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                  {cardapio.marmitas.map((m, i) => (
                    <option key={i} value={i}>{m.tamanho} — {formatBRL(m.preco)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Opção do Menu</label>
              <div className="relative">
                <select value={marmitaOpcao} onChange={e => setMarmitaOpcao(e.target.value as 'Opção 1' | 'Opção 2')}
                  className="w-full appearance-none p-2.5 pr-8 rounded-xl border border-stone-200 bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="Opção 1">Opção 1 ({op1r}…)</option>
                  <option value="Opção 2">Opção 2 ({op2r}…)</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
            <button onClick={addMarmita}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition">
              <Plus className="w-4 h-4" /> Adicionar Marmita
            </button>
          </div>
        </section>

        {/* Adicionais */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-base font-display font-bold text-brand-700 border-b border-stone-100 pb-2 mb-1">Adicionais</h2>
          <ItemList items={cardapio.adicionais} onAdd={(n,p)=>addItem(n,p)} onRemove={n=>removeItem(n)} getQtd={n=>qtd(n)} />
        </section>

        {/* Bebidas */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-base font-display font-bold text-brand-700 border-b border-stone-100 pb-2 mb-1">Bebidas</h2>
          <ItemList items={cardapio.bebidas} onAdd={(n,p)=>addItem(n,p)} onRemove={n=>removeItem(n)} getQtd={n=>qtd(n)} />
        </section>

        <div className="pb-24 flex flex-col items-center gap-1">
          <Link to="/login" className="text-[11px] text-stone-300 hover:text-stone-400 transition">
            Área administrativa
          </Link>
        </div>
      </main>

      {/* Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-2xl">
        <div className="max-w-md mx-auto px-4 py-3">
          {cartOpen && cart.length > 0 && (
            <div className="mb-3 max-h-40 overflow-y-auto scrollbar-hide space-y-1.5">
              {cart.map((item, i) => {
                const label = item.detalhe ? `${item.nome} ${item.detalhe}` : item.nome
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex-1 truncate text-stone-600">
                      <span className="font-semibold text-stone-800">{item.qtd}×</span> {label}
                    </span>
                    <span className="ml-2 font-bold text-stone-700 shrink-0">{formatBRL(item.preco * item.qtd)}</span>
                    <button onClick={() => removeItem(item.nome, item.detalhe)} className="ml-2 text-brand-400 hover:text-brand-600 p-1">
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          {error && (
            <div className="mb-2 flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button onClick={() => setCartOpen(o => !o)} className="flex items-center gap-2 flex-1">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-stone-700" />
                {totalQtd > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{totalQtd}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total</p>
                <p className="text-lg font-black text-stone-900">{formatBRL(total)}</p>
              </div>
            </button>
            <button onClick={handleEnviar} disabled={sending || cart.length === 0}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-xl text-sm transition shadow-md">
              {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Send className="w-4 h-4"/>}
              Enviar Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Modal Ajuda */}
      <ModalHelpMe isOpen={ajuda} onClose={() => setAjuda(false)} />
    </div>
  )
}
