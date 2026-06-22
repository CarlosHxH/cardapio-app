import { Plus, Minus } from 'lucide-react'
import { formatBRL } from '../lib/utils'

// Lista de itens com botões +/- (adicionais, bebidas)
export default function ItemList({ items, onAdd, onRemove, getQtd }: {
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
