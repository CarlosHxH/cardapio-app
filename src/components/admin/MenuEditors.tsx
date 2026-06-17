import { useState } from 'react'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import type { MenuItem } from '../../types'

// Editor de lista simples de strings (1ª/2ª opção)
export function MenuOptionEditor({ title, color, items, onChange }: {
  title: string; color: 'amber' | 'blue'; items: string[]; onChange: (i: string[]) => void
}) {
  const [novo, setNovo] = useState('')
  const cls = color === 'amber' ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-blue-700 bg-blue-50 border-blue-100'
  const add = () => { const v = novo.trim(); if (v) { onChange([...items, v]); setNovo('') } }
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

// Editor de itens com preço (marmitas, adicionais, bebidas)
export function PricedEditor({ title, items, onChange, nomePlaceholder }: {
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
