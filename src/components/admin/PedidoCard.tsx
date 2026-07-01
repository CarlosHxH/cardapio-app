import {
  Trash2, CheckCircle2, ChevronDown, ChevronUp, Edit3, RotateCcw,
} from 'lucide-react'
import { formatBRL, formatHora } from '../../lib/utils'
import type { Pedido } from '../../types'

export default function PedidoCard({ pedido, expanded, isNovo, onToggle, onAcao, acaoLabel, acaoCor, onEditar, onExcluir }: {
  pedido: Pedido
  expanded: boolean; isNovo: boolean; onToggle: () => void
  onAcao?: () => void; acaoLabel?: string; acaoCor?: 'emerald' | 'amber'
  onEditar?: () => void; onExcluir?: () => void
}) {
  const hora = pedido.criado_em ? formatHora(pedido.criado_em) : '--:--'
  const totalItens = pedido.itens.reduce((acc, i) => acc + i.qtd, 0)
  const isPendente = pedido.status === 'pendente'
  const corBtn = acaoCor === 'amber' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'

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
          <p className="text-xs text-stone-500">{pedido.setor} · {hora} · {totalItens} item(s)</p>
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
