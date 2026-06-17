import { useState, useEffect } from 'react'
import { usePedidosHoje, buscarDatas } from '../../hooks/usePedidos'
import { today, formatDate } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/Modal'
import StatCard from '../../components/admin/StatCard'
import PedidoCard from '../../components/admin/PedidoCard'
import EditarPedidoModal from '../../components/admin/EditarPedidoModal'
import type { Pedido } from '../../types'
import {
  ClipboardList, Printer, CheckCircle2, Clock,
  Calendar, Wifi, WifiOff,
} from 'lucide-react'

export default function PedidosTab() {
  const [dataSel, setDataSel] = useState(today())
  const [datas,   setDatas]   = useState<{ data: string; total: number }[]>([])
  const [showDatas, setShowDatas] = useState(false)
  const [realtimeOk, setRealtimeOk] = useState(true)

  const { pedidos, loading, novoIds, marcarVisto, marcarPendente, exportPedidos, editarPedido, excluirPedido, exportRelatorio } = usePedidosHoje(dataSel)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editandoPedido, setEditandoPedido] = useState<Pedido | null>(null)

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
        <Modal
          size="sm"
          onClose={() => setShowDatas(false)}
          title={<h2 className="text-lg font-bold font-display text-stone-800">Histórico</h2>}
        >
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
        </Modal>
      )}
    </div>
  )
}
