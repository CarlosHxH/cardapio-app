import { useState } from 'react'
import { Plus, Trash2, Save, Edit3 } from 'lucide-react'
import { formatBRL } from '../../lib/utils'
import { getTotal } from '../../lib/cartService'
import Modal from '../Modal'
import type { Pedido, CartItem } from '../../types'

export default function EditarPedidoModal({ pedido, onSalvar, onFechar }: {
  pedido: Pedido
  onSalvar: (id: number, dados: { cliente_nome: string; setor: string; itens: CartItem[]; total: number }) => Promise<void>
  onFechar: () => void
}) {
  const [nome,   setNome]   = useState(pedido.cliente_nome)
  const [setor,  setSetor]  = useState(pedido.setor)
  const [itens,  setItens]  = useState<CartItem[]>(pedido.itens.map(i => ({ ...i })))
  const [saving, setSaving] = useState(false)

  const total = getTotal(itens)

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
    <Modal
      onClose={onFechar}
      title={
        <h2 className="flex items-center gap-2 text-lg font-bold font-display text-stone-800">
          <Edit3 className="w-4 h-4 text-brand-600"/> Editar Pedido #{pedido.id}
        </h2>
      }
      footer={
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
      }
    >
      <div className="p-4 space-y-4">
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
    </Modal>
  )
}
