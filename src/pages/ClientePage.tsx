import { useState } from 'react'
import { useCardapio } from '../hooks/useCardapio'
import { enviarPedido } from '../hooks/usePedidos'
import { formatBRL } from '../lib/utils'
import type { CartItem } from '../types'
import {
  UtensilsCrossed, Plus, Minus, ShoppingBag, Send,
  ChevronDown, AlertCircle, CheckCircle2, HelpCircle, X
} from 'lucide-react'

export default function ClientePage() {
  const { cardapio, loading } = useCardapio()
  const [cart, setCart]                 = useState<CartItem[]>([])
  const [marmitaIdx, setMarmitaIdx]     = useState(0)
  const [marmitaOpcao, setMarmitaOpcao] = useState<'Opção 1' | 'Opção 2'>('Opção 1')
  const [clienteNome, setClienteNome]   = useState('')
  const [setor, setSetor]               = useState('')
  const [ajuda, setAjuda]               = useState(false)
  const [cartOpen, setCartOpen]         = useState(false)
  const [sending, setSending]           = useState(false)
  const [success, setSuccess]           = useState(false)
  const [error, setError]               = useState('')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const total    = cart.reduce((s, i) => s + i.preco * i.qtd, 0)
  const totalQtd = cart.reduce((s, i) => s + i.qtd, 0)

  function addItem(nome: string, preco: number, detalhe?: string) {
    setCart(prev => {
      const ex = prev.find(i => i.nome === nome && i.detalhe === detalhe)
      if (ex) return prev.map(i => i.nome === nome && i.detalhe === detalhe ? { ...i, qtd: i.qtd+1 } : i)
      return [...prev, { nome, preco, qtd: 1, detalhe }]
    })
  }
  function removeItem(nome: string, detalhe?: string) {
    setCart(prev => {
      const ex = prev.find(i => i.nome === nome && i.detalhe === detalhe)
      if (!ex) return prev
      if (ex.qtd === 1) return prev.filter(i => !(i.nome === nome && i.detalhe === detalhe))
      return prev.map(i => i.nome === nome && i.detalhe === detalhe ? { ...i, qtd: i.qtd-1 } : i)
    })
  }
  function qtd(nome: string, detalhe?: string) {
    return cart.find(i => i.nome === nome && i.detalhe === detalhe)?.qtd ?? 0
  }
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
      setSuccess(true)
      setCart([])
      setCartOpen(false)
      setClienteNome('')
      setSetor('')
      setTimeout(() => setSuccess(false), 5000)
    } catch (e: any) {
      setError(e.message || 'Erro ao enviar. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const op1r = cardapio.opcao1.slice(0,2).join(', ')
  const op2r = cardapio.opcao2.slice(0,2).join(', ')

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-brand-700 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-9" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              <h1 className="text-xl font-display font-black">Tempero Cuiabano</h1>
            </div>
            <p className="text-xs text-brand-200 mt-0.5">Cardápio do Dia</p>
          </div>
          <button onClick={() => setAjuda(true)} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-4 space-y-5 pb-2">
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-slide-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-semibold">Pedido enviado! O restaurante já recebeu. 🎉</p>
          </div>
        )}

        {/* Dados */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="text-base font-display font-bold text-brand-700 border-b border-stone-100 pb-2 mb-3">Seus Dados</h2>
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
      {ajuda && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-brand-700">Como usar</h2>
              <button onClick={() => setAjuda(false)}><X className="w-5 h-5 text-stone-400"/></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-sm text-stone-600">
              {[
                {n:'1',t:'Preencha seus dados',d:'Informe seu nome e o setor onde trabalha.'},
                {n:'2',t:'Veja o menu do dia', d:'Confira as opções disponíveis.'},
                {n:'3',t:'Monte sua marmita', d:'Escolha o tamanho e opção (1 ou 2) e clique em Adicionar.'},
                {n:'4',t:'Extras e bebidas',  d:'Use os botões + para incluir adicionais e bebidas.'},
                {n:'5',t:'Envie o pedido',    d:'Clique em Enviar Pedido. O restaurante recebe na hora!'},
              ].map(s => (
                <div key={s.n} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-black flex items-center justify-center shrink-0 text-sm">{s.n}</div>
                  <div><p className="font-bold text-stone-800 mb-0.5">{s.t}</p><p className="text-stone-500">{s.d}</p></div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <button onClick={() => setAjuda(false)} className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition">Entendi!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ItemList({ items, onAdd, onRemove, getQtd }: {
  items: { nome: string; preco: number }[]
  onAdd: (n: string, p: number) => void
  onRemove: (n: string) => void
  getQtd: (n: string) => number
}) {
  return (
    <div className="divide-y divide-stone-100">
      {items.map(item => {
        const q = getQtd(item.nome)
        return (
          <div key={item.nome} className="flex justify-between items-center py-2.5">
            <div>
              <p className="font-medium text-sm text-stone-800">{item.nome}</p>
              <p className="text-xs text-stone-400">{formatBRL(item.preco)}</p>
            </div>
            <div className="flex items-center gap-2">
              {q > 0 && (
                <>
                  <button onClick={() => onRemove(item.nome)} className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition">
                    <Minus className="w-3 h-3 text-stone-600"/>
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-stone-700">{q}</span>
                </>
              )}
              <button onClick={() => onAdd(item.nome, item.preco)} className="w-7 h-7 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center justify-center transition">
                <Plus className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
