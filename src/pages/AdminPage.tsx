import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCardapio, DEFAULT_CARDAPIO } from '../hooks/useCardapio'
import { usePedidosHoje, buscarDatas } from '../hooks/usePedidos'
import { parsearCardapio, formatBRL, today, formatDate, formatHora } from '../lib/utils'
import type { Cardapio, MenuItem, CartItem, Pedido } from '../types'
import {
  LogOut, UtensilsCrossed, ClipboardList, Settings, FileInput,
  Printer, Plus, Trash2, Save, X, CheckCircle2, Clock,
  AlertCircle, ChevronDown, ChevronUp, Edit3, Calendar,
  Key, RotateCcw, Wifi, WifiOff
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type Tab = 'pedidos' | 'cardapio' | 'config'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('pedidos')

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-40 text-white shadow-md bg-brand-700">
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            <h1 className="text-lg font-black font-display">Tempero Cuiabano</h1>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-brand-100">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-brand-200 sm:block">{user?.email}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-brand-200 hover:text-white transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex max-w-2xl gap-1 px-4 pb-0 mx-auto overflow-x-auto scrollbar-hide">
          <TabBtn active={tab==='pedidos'}  onClick={()=>setTab('pedidos')}  icon={<ClipboardList className="w-4 h-4"/>} label="Pedidos" />
          <TabBtn active={tab==='cardapio'} onClick={()=>setTab('cardapio')} icon={<Settings className="w-4 h-4"/>}      label="Cardápio" />
          <TabBtn active={tab==='config'}   onClick={()=>setTab('config')}   icon={<Key className="w-4 h-4"/>}           label="Configurações" />
        </div>
      </header>

      <div className="max-w-2xl px-4 py-5 mx-auto">
        {tab === 'pedidos'  && <PedidosTab />}
        {tab === 'cardapio' && <CardapioTab />}
        {tab === 'config'   && <ConfigTab />}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: ()=>void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${active ? 'bg-stone-100 text-brand-700 border-brand-400' : 'text-brand-200 hover:text-white border-transparent'}`}>
      {icon} {label}
    </button>
  )
}

// ── PEDIDOS ──────────────────────────────────────────────
function PedidosTab() {
  const [dataSel, setDataSel] = useState(today())
  const [datas,   setDatas]   = useState<{ data: string; total: number }[]>([])
  const [showDatas, setShowDatas] = useState(false)
  const [realtimeOk, setRealtimeOk] = useState(true)

  const { pedidos, loading, novoIds, marcarVisto, marcarPendente, exportPedidos, editarPedido, excluirPedido, exportRelatorio } = usePedidosHoje(dataSel)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editandoPedido, setEditandoPedido] = useState<(typeof pedidos)[0] | null>(null)

  // Monitora status do Realtime
  useEffect(() => {
    const ch = supabase.channel('health-check')
      .subscribe(status => setRealtimeOk(status === 'SUBSCRIBED'))
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function handleShowDatas() {
    const d = await buscarDatas()
    setDatas(d)
    setShowDatas(true)
  }

  const pendentes = pedidos.filter(p => p.status === 'pendente')
  const vistos    = pedidos.filter(p => p.status === 'visto')
  const isHoje    = dataSel === today()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-800">Pedidos</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm capitalize text-stone-500">{isHoje ? 'Hoje' : formatDate(dataSel)}</p>
            {isHoje && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${realtimeOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {realtimeOk ? <><Wifi className="w-3 h-3"/>Ao vivo</> : <><WifiOff className="w-3 h-3"/>Reconectando…</>}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={handleShowDatas}
            className="no-print flex items-center gap-1.5 border border-stone-200 text-stone-600 font-semibold text-sm py-2 px-3 rounded-xl hover:bg-stone-50 transition">
            <Calendar className="w-3.5 h-3.5" /> Histórico
          </button>
          <button onClick={exportRelatorio}
            className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-white transition bg-red-800 shadow-sm no-print hover:bg-red-900 rounded-xl">
            <Printer className="w-4 h-4" /> Relatório
          </button>
          <button onClick={exportPedidos}
            className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-white transition shadow-sm no-print bg-stone-800 hover:bg-stone-900 rounded-xl">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 no-print">
        <StatCard label="Total"    value={pedidos.length}   color="stone" />
        <StatCard label="Pendente" value={pendentes.length} color="amber" />
        <StatCard label="Vistos"   value={vistos.length}    color="emerald" />
      </div>

      {/* Print header */}
      <div className="hidden mb-4 print:block">
        <h1 className="text-2xl font-bold">Tempero Cuiabano — Pedidos</h1>
        <p className="text-sm text-gray-500">{isHoje ? 'Hoje' : formatDate(dataSel)} · {pedidos.length} pedido(s)</p>
        <hr className="mt-2"/>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 rounded-full border-brand-600 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && pedidos.length === 0 && (
        <div className="py-16 text-center text-stone-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40"/>
          <p className="font-medium">Nenhum pedido {isHoje ? 'ainda hoje' : 'nessa data'}.</p>
          {isHoje && <p className="flex items-center justify-center gap-1 mt-1 text-sm"><Wifi className="w-3.5 h-3.5"/>Novos pedidos aparecem automaticamente.</p>}
        </div>
      )}

      {pendentes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5"/> Pendentes ({pendentes.length})
          </h3>
          {pendentes.map(p => (
            <PedidoCard key={p.id} pedido={p}
              isNovo={novoIds.has(p.id)}
              expanded={expandedId===p.id}
              onToggle={() => setExpandedId(expandedId===p.id ? null : p.id)}
              onAcao={() => marcarVisto(p.id)} acaoLabel="Marcar como Visto" acaoCor="emerald"
              onEditar={() => setEditandoPedido(p)}
              onExcluir={() => excluirPedido(p.id)} />
          ))}
        </div>
      )}

      {vistos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5"/> Vistos ({vistos.length})
          </h3>
          {vistos.map(p => (
            <PedidoCard key={p.id} pedido={p}
              isNovo={false}
              expanded={expandedId===p.id}
              onToggle={() => setExpandedId(expandedId===p.id ? null : p.id)}
              onAcao={() => marcarPendente(p.id)} acaoLabel="Reabrir" acaoCor="amber"
              onEditar={() => setEditandoPedido(p)}
              onExcluir={() => excluirPedido(p.id)} />
          ))}
        </div>
      )}

      {/* Modal Editar Pedido */}
      {editandoPedido && (
        <EditarPedidoModal
          pedido={editandoPedido}
          onSalvar={editarPedido}
          onFechar={() => setEditandoPedido(null)}
        />
      )}

      {/* Modal Histórico */}
      {showDatas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold font-display text-stone-800">Histórico</h2>
              <button onClick={() => setShowDatas(false)}><X className="w-5 h-5 text-stone-400"/></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {datas.length === 0
                ? <p className="py-8 text-sm text-center text-stone-400">Nenhum registro.</p>
                : datas.map(d => (
                  <button key={d.data} onClick={() => { setDataSel(d.data); setShowDatas(false) }}
                    className={`w-full flex justify-between items-center px-4 py-3 hover:bg-stone-50 transition border-b border-stone-100 ${dataSel===d.data?'bg-brand-50':''}`}>
                    <span className="text-sm font-medium capitalize text-stone-700">{formatDate(d.data)}</span>
                    <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{d.total} pedido(s)</span>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'stone'|'amber'|'emerald' }) {
  const cls = {stone:'bg-stone-50 text-stone-800 border-stone-200',amber:'bg-amber-50 text-amber-800 border-amber-200',emerald:'bg-emerald-50 text-emerald-800 border-emerald-200'}
  return (
    <div className={`rounded-xl border p-3 text-center ${cls[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold mt-0.5 opacity-70">{label}</p>
    </div>
  )
}

function PedidoCard({ pedido, expanded, isNovo, onToggle, onAcao, acaoLabel, acaoCor, onEditar, onExcluir }: {
  pedido: ReturnType<typeof usePedidosHoje>['pedidos'][0]
  expanded: boolean; isNovo: boolean; onToggle: ()=>void
  onAcao?: ()=>void; acaoLabel?: string; acaoCor?: 'emerald'|'amber'
  onEditar?: ()=>void; onExcluir?: ()=>void
}) {
  const hora = pedido.criado_em ? formatHora(pedido.criado_em) : '--:--'
  const isPendente = pedido.status === 'pendente'
  const corBtn = acaoCor==='amber' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden print:shadow-none print:border print:mb-4 transition-all ${
      isNovo ? 'border-brand-400 ring-2 ring-brand-200 animate-slide-in' : isPendente ? 'border-amber-200' : 'border-stone-200'
    }`}>
      {isNovo && (
        <div className="bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1">
          🔔 Novo pedido!
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onToggle}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${isPendente ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-stone-800">{pedido.cliente_nome}</p>
          <p className="text-xs text-stone-500">{pedido.setor} · {hora} · {pedido.itens.length} item(s)</p>
        </div>
        <p className="text-sm font-black text-stone-700 shrink-0">{formatBRL(pedido.total)}</p>
        <span className="text-stone-400 no-print">{expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}</span>
      </div>
      <div className={`border-t border-stone-100 px-4 py-3 space-y-1 ${!expanded ? 'hidden print:block' : ''}`}>
        {pedido.itens.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-stone-600">{item.qtd}× {item.detalhe ? `${item.nome} ${item.detalhe}` : item.nome}</span>
            <span className="font-semibold text-stone-700">{formatBRL(item.preco * item.qtd)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 text-sm font-black border-t border-stone-100">
          <span>Total</span><span>{formatBRL(pedido.total)}</span>
        </div>
        <div className="flex gap-2 mt-2 no-print">
          {onExcluir && (
            <button onClick={e=>{e.stopPropagation();if(confirm('Excluir este pedido?'))onExcluir()}}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold border border-red-200 rounded-xl text-red-500 hover:bg-red-50 transition">
              <Trash2 className="w-3.5 h-3.5"/> Excluir
            </button>
          )}
          {onEditar && (
            <button onClick={e=>{e.stopPropagation();onEditar()}}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition">
              <Edit3 className="w-3.5 h-3.5"/> Editar
            </button>
          )}
          {onAcao && (
            <button onClick={e=>{e.stopPropagation();onAcao()}}
              className={`flex-1 py-2 rounded-xl ${corBtn} text-white font-semibold text-sm transition flex items-center justify-center gap-2`}>
              {acaoCor==='emerald' ? <CheckCircle2 className="w-4 h-4"/> : <RotateCcw className="w-4 h-4"/>}
              {acaoLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── CARDÁPIO ─────────────────────────────────────────────
function CardapioTab() {
  const { cardapio, salvarCardapio } = useCardapio()
  const [draft, setDraft] = useState<Cardapio>({ ...cardapio })
  const [modal, setModal] = useState(false)
  const [textoImp, setTextoImp] = useState('')
  const [impErr,   setImpErr]   = useState('')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // Sync quando cardapio carregar do Supabase
  useEffect(() => { setDraft({ ...cardapio }) }, [cardapio.atualizado_em])

  async function handleSave() {
    setSaving(true)
    try { await salvarCardapio(draft); setSaved(true); setTimeout(()=>setSaved(false),2500) }
    catch (e: any) { alert('Erro ao salvar: ' + e.message) }
    finally { setSaving(false) }
  }

  function handleImport() {
    setImpErr('')
    try {
      const r = parsearCardapio(textoImp)
      setDraft(prev => ({
        ...prev,
        ...(r.opcao1?.length     ? {opcao1:r.opcao1}         : {}),
        ...(r.opcao2?.length     ? {opcao2:r.opcao2}         : {}),
        ...(r.marmitas?.length   ? {marmitas:r.marmitas}     : {}),
        ...(r.adicionais?.length ? {adicionais:r.adicionais} : {}),
        ...(r.bebidas?.length    ? {bebidas:r.bebidas}       : {}),
        ...(r.whatsapp           ? {whatsapp:r.whatsapp}     : {}),
      }))
      setModal(false); setTextoImp('')
    } catch (e: any) { setImpErr('Erro: ' + e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition border-2 border-dashed border-brand-300 text-brand-700 rounded-xl hover:bg-brand-50">
          <FileInput className="w-4 h-4"/> Importar via Mensagem
        </button>
        <button onClick={()=>{if(confirm('Restaurar padrão?'))setDraft({...DEFAULT_CARDAPIO})}}
          className="flex items-center gap-1.5 border border-stone-200 text-stone-600 font-semibold text-sm py-2 px-3 rounded-xl hover:bg-stone-50 transition ml-auto">
          <RotateCcw className="w-3.5 h-3.5"/> Padrão
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition shadow-sm bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-60">
          {saving ? <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"/> : <Save className="w-4 h-4"/>}
          {saved ? 'Salvo! ✓' : 'Salvar'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 text-sm border rounded-xl bg-emerald-50 border-emerald-200 text-emerald-700">
          <CheckCircle2 className="w-4 h-4"/> Cardápio publicado — clientes já veem as mudanças!
        </div>
      )}

      <MenuOptionEditor title="1ª Opção" color="amber" items={draft.opcao1} onChange={items=>setDraft(d=>({...d,opcao1:items}))} />
      <MenuOptionEditor title="2ª Opção" color="blue"  items={draft.opcao2} onChange={items=>setDraft(d=>({...d,opcao2:items}))} />
      <PricedEditor title="Tamanhos de Marmita"
        items={draft.marmitas.map(m=>({nome:m.tamanho,preco:m.preco}))}
        onChange={items=>setDraft(d=>({...d,marmitas:items.map(i=>({tamanho:i.nome,preco:i.preco}))}))}
        nomePlaceholder="Ex: N: 7" />
      <PricedEditor title="Adicionais" items={draft.adicionais} onChange={items=>setDraft(d=>({...d,adicionais:items}))} nomePlaceholder="Ex: Bife" />
      <PricedEditor title="Bebidas"    items={draft.bebidas}    onChange={items=>setDraft(d=>({...d,bebidas:items}))}    nomePlaceholder="Ex: Coca 2 litros" />

      {/* <div className="p-4 bg-white border shadow-sm rounded-2xl border-stone-100">
        <h3 className="mb-3 font-bold font-display text-stone-800">WhatsApp do Restaurante</h3>
        <input type="text" value={draft.whatsapp} onChange={e=>setDraft(d=>({...d,whatsapp:e.target.value}))}
          placeholder="5565999999999"
          className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"/>
        <p className="mt-1 text-xs text-stone-400">Formato: 55 + DDD + número</p>
      </div> */}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="flex items-center gap-2 text-lg font-bold font-display text-brand-700"><FileInput className="w-4 h-4"/>Importar Cardápio</h2>
              <button onClick={()=>setModal(false)}><X className="w-5 h-5 text-stone-400"/></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="mb-2 text-xs text-stone-500">Cole a mensagem do cardápio (WhatsApp, etc.):</p>
              <textarea rows={12} value={textoImp} onChange={e=>setTextoImp(e.target.value)}
                className="w-full p-3 font-mono text-sm border outline-none resize-none rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"
                placeholder="Cole o texto aqui…"/>
              {impErr && <div className="flex items-center gap-2 p-2 mt-2 text-xs text-red-700 rounded-lg bg-red-50"><AlertCircle className="w-3.5 h-3.5"/>{impErr}</div>}
            </div>
            <div className="flex gap-2 p-4 border-t">
              <button onClick={()=>setModal(false)} className="flex-1 py-2 text-sm font-semibold border rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={handleImport} className="flex-1 py-2 text-sm font-bold text-white rounded-xl bg-brand-600 hover:bg-brand-700">Importar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CONFIG ────────────────────────────────────────────────
function ConfigTab() {
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

// ── MODAL EDITAR PEDIDO ───────────────────────────────────
function EditarPedidoModal({ pedido, onSalvar, onFechar }: {
  pedido: Pedido
  onSalvar: (id: number, dados: { cliente_nome: string; setor: string; itens: CartItem[]; total: number }) => Promise<void>
  onFechar: () => void
}) {
  const [nome,   setNome]   = useState(pedido.cliente_nome)
  const [setor,  setSetor]  = useState(pedido.setor)
  const [itens,  setItens]  = useState<CartItem[]>(pedido.itens.map(i => ({ ...i })))
  const [saving, setSaving] = useState(false)

  const total = itens.reduce((s, i) => s + i.preco * i.qtd, 0)

  function updateItem(idx: number, campo: keyof CartItem, valor: string | number) {
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [campo]: valor } : it))
  }

  function addItem() {
    setItens(prev => [...prev, { nome: '', preco: 0, qtd: 1 }])
  }

  function removeItem(idx: number) {
    setItens(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    if (!nome.trim() || !setor.trim()) return
    setSaving(true)
    try {
      await onSalvar(pedido.id, { cliente_nome: nome.trim(), setor: setor.trim(), itens, total })
      onFechar()
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="flex items-center gap-2 text-lg font-bold font-display text-stone-800">
            <Edit3 className="w-4 h-4 text-brand-600"/> Editar Pedido #{pedido.id}
          </h2>
          <button onClick={onFechar}><X className="w-5 h-5 text-stone-400"/></button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Cliente / Setor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-stone-500">Cliente</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"/>
            </div>
            <div>
              <label className="block mb-1 text-xs font-semibold tracking-wider uppercase text-stone-500">Setor</label>
              <input value={setor} onChange={e => setSetor(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"/>
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold tracking-wider uppercase text-stone-500">Itens</label>
              <button onClick={addItem}
                className="flex items-center gap-1 text-xs font-semibold transition text-brand-600 hover:text-brand-700">
                <Plus className="w-3.5 h-3.5"/> Adicionar item
              </button>
            </div>
            <div className="space-y-2">
              {itens.map((item, i) => (
                <div key={i} className="p-2.5 border border-stone-100 rounded-xl bg-stone-50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} value={item.qtd}
                      onChange={e => updateItem(i, 'qtd', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 p-1.5 text-sm text-center border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white"/>
                    <input value={item.nome} onChange={e => updateItem(i, 'nome', e.target.value)}
                      placeholder="Nome do item"
                      className="flex-1 p-1.5 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white"/>
                    <div className="relative w-20 shrink-0">
                      <span className="absolute text-xs -translate-y-1/2 left-2 top-1/2 text-stone-400">R$</span>
                      <input type="number" step="0.5" min={0} value={item.preco}
                        onChange={e => updateItem(i, 'preco', parseFloat(e.target.value) || 0)}
                        className="w-full py-1.5 pr-1.5 pl-6 text-sm border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white"/>
                    </div>
                    <button onClick={() => removeItem(i)} className="text-red-400 transition hover:text-red-600 shrink-0">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <input value={item.detalhe || ''} onChange={e => updateItem(i, 'detalhe', e.target.value)}
                    placeholder="Detalhe (ex: Opção 1)"
                    className="w-full p-1.5 text-xs border border-stone-200 rounded-lg outline-none text-stone-500 focus:ring-1 focus:ring-brand-400 bg-white placeholder-stone-300"/>
                </div>
              ))}
              {itens.length === 0 && (
                <p className="py-4 text-sm text-center text-stone-400">Nenhum item. Clique em "Adicionar item".</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-stone-100 rounded-xl">
            <span className="text-sm font-bold text-stone-700">Total calculado</span>
            <span className="text-lg font-black text-stone-800">{formatBRL(total)}</span>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t">
          <button onClick={onFechar}
            className="flex-1 py-2.5 text-sm font-semibold border rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50 transition">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !nome.trim() || !setor.trim()}
            className="flex-1 py-2.5 text-sm font-bold text-white transition rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"/>Salvando…</>
              : <><Save className="w-4 h-4"/>Salvar</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Editors ───────────────────────────────────────────────
function MenuOptionEditor({ title, color, items, onChange }: {
  title: string; color: 'amber'|'blue'; items: string[]; onChange: (i: string[]) => void
}) {
  const [novo, setNovo] = useState('')
  const cls = color==='amber' ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-blue-700 bg-blue-50 border-blue-100'
  const add = () => { const v=novo.trim(); if(v){ onChange([...items,v]); setNovo('') } }
  return (
    <div className="p-4 bg-white border shadow-sm rounded-2xl border-stone-100">
      <h3 className={`font-display font-bold text-base mb-3 ${color==='amber'?'text-amber-700':'text-blue-700'}`}>{title}</h3>
      <div className="space-y-1.5 mb-3">
        {items.map((item,i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cls}`}>
            <Edit3 className="w-3 h-3 opacity-40 shrink-0"/>
            <input value={item} onChange={e=>onChange(items.map((x,idx)=>idx===i?e.target.value:x))}
              className="flex-1 text-sm bg-transparent outline-none"/>
            <button onClick={()=>onChange(items.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 className="w-3.5 h-3.5"/>
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={novo} onChange={e=>setNovo(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
          placeholder="Adicionar item…"
          className="flex-1 p-2 text-sm border outline-none rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"/>
        <button onClick={add} className="p-2 text-white transition rounded-xl bg-stone-800 hover:bg-stone-900"><Plus className="w-4 h-4"/></button>
      </div>
    </div>
  )
}

function PricedEditor({ title, items, onChange, nomePlaceholder }: {
  title: string; items: MenuItem[]; onChange: (i: MenuItem[]) => void; nomePlaceholder: string
}) {
  const [nn,setNn]=useState(''); const [np,setNp]=useState('')
  const add = () => { const n=nn.trim(),p=parseFloat(np.replace(',','.')); if(n&&!isNaN(p)){onChange([...items,{nome:n,preco:p}]);setNn('');setNp('')} }
  return (
    <div className="p-4 bg-white border shadow-sm rounded-2xl border-stone-100">
      <h3 className="mb-3 text-base font-bold font-display text-stone-800">{title}</h3>
      <div className="space-y-1.5 mb-3">
        {items.map((item,i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={item.nome} onChange={e=>onChange(items.map((x,idx)=>idx===i?{...x,nome:e.target.value}:x))}
              className="flex-1 p-2 text-sm border outline-none rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"/>
            <div className="relative w-24">
              <span className="absolute text-xs -translate-y-1/2 left-2 top-1/2 text-stone-400">R$</span>
              <input type="number" step="0.5" value={item.preco}
                onChange={e=>{const p=parseFloat(e.target.value);if(!isNaN(p))onChange(items.map((x,idx)=>idx===i?{...x,preco:p}:x))}}
                className="w-full py-2 pr-2 text-sm border outline-none pl-7 rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"/>
            </div>
            <button onClick={()=>onChange(items.filter((_,idx)=>idx!==i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={nn} onChange={e=>setNn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
          placeholder={nomePlaceholder} className="flex-1 p-2 text-sm border outline-none rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"/>
        <div className="relative w-24">
          <span className="absolute text-xs -translate-y-1/2 left-2 top-1/2 text-stone-400">R$</span>
          <input type="number" step="0.5" value={np} onChange={e=>setNp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
            placeholder="0,00" className="w-full py-2 pr-2 text-sm border outline-none pl-7 rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"/>
        </div>
        <button onClick={add} className="p-2 text-white transition rounded-xl bg-stone-800 hover:bg-stone-900"><Plus className="w-4 h-4"/></button>
      </div>
    </div>
  )
}
