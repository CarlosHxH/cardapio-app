import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePedidosPublic } from '../hooks/usePedidosPublic'
import { formatBRL, formatHora, formatDate, today } from '../lib/utils'
import type { Pedido } from '../types'
import { UtensilsCrossed, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'

export default function PedidosDiaPage() {
  const [dataSel, setDataSel] = useState(today())
  const { pedidos, loading } = usePedidosPublic(dataSel)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const isHoje = dataSel === today()

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 z-40 text-white shadow-md bg-brand-700">
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            <h1 className="text-lg font-black font-display">Tempero Cuiabano</h1>
          </div>
          <Link to="/" className="text-xs text-brand-200 hover:text-white transition-colors">
            ← Cardápio
          </Link>
        </div>
      </header>

      <div className="max-w-2xl px-4 py-5 mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-xl font-bold font-display text-stone-800">Pedidos do Dia</h2>
            <p className="text-sm text-stone-500 capitalize">
              {isHoje ? 'Hoje' : formatDate(dataSel)}
            </p>
          </div>
          <div className="ml-auto">
            <input
              type="date"
              value={dataSel}
              max={today()}
              onChange={e => setDataSel(e.target.value)}
              className="p-2 text-sm border rounded-xl border-stone-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white border-stone-200 p-3 text-center sm:w-32 shadow-sm">
          <p className="text-2xl font-black text-stone-800">{loading ? '—' : pedidos.length}</p>
          <p className="text-xs font-semibold mt-0.5 text-stone-500">Pedidos</p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 rounded-full border-brand-600 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && pedidos.length === 0 && (
          <div className="py-16 text-center text-stone-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              Nenhum pedido {isHoje ? 'ainda hoje' : 'nessa data'}.
            </p>
          </div>
        )}

        {!loading && pedidos.length > 0 && (
          <div className="space-y-2">
            {pedidos.map(p => (
              <PedidoCard
                key={p.id}
                pedido={p}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PedidoCard({
  pedido,
  expanded,
  onToggle,
}: {
  pedido: Pedido
  expanded: boolean
  onToggle: () => void
}) {
  const hora = pedido.criado_em ? formatHora(pedido.criado_em) : '--:--'

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-stone-800">{pedido.cliente_nome}</p>
          <p className="text-xs text-stone-500">
            {pedido.setor} · {hora} · {pedido.itens.length} item(s)
          </p>
        </div>
        <p className="text-sm font-black text-stone-700 shrink-0">{formatBRL(pedido.total)}</p>
        <span className="text-stone-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 space-y-1">
          {pedido.itens.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-stone-600">
                {item.qtd}× {item.detalhe ? `${item.nome} ${item.detalhe}` : item.nome}
              </span>
              <span className="font-semibold text-stone-700">{formatBRL(item.preco * item.qtd)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-sm font-black border-t border-stone-100 text-stone-800">
            <span>Total</span>
            <span>{formatBRL(pedido.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
