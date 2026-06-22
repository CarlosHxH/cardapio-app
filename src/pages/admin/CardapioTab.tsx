import { useState, useEffect } from 'react'
import { useCardapio, DEFAULT_CARDAPIO } from '../../hooks/useCardapio'
import { parsearCardapio } from '../../lib/utils'
import Modal from '../../components/Modal'
import { MenuOptionEditor, PricedEditor } from '../../components/admin/MenuEditors'
import type { Cardapio } from '../../types'
import { FileInput, Save, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'

export default function CardapioTab() {
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

      {modal && (
        <Modal
          onClose={()=>setModal(false)}
          title={<h2 className="flex items-center gap-2 text-lg font-bold font-display text-brand-700"><FileInput className="w-4 h-4"/>Importar Cardápio</h2>}
          footer={
            <div className="flex gap-2 p-4 border-t">
              <button onClick={()=>setModal(false)} className="flex-1 py-2 text-sm font-semibold border rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50">Cancelar</button>
              <button onClick={handleImport} className="flex-1 py-2 text-sm font-bold text-white rounded-xl bg-brand-600 hover:bg-brand-700">Importar</button>
            </div>
          }
        >
          <div className="p-4">
            <p className="mb-2 text-xs text-stone-500">Cole a mensagem do cardápio (WhatsApp, etc.):</p>
            <textarea rows={12} value={textoImp} onChange={e=>setTextoImp(e.target.value)}
              className="w-full p-3 font-mono text-sm border outline-none resize-none rounded-xl border-stone-200 focus:ring-2 focus:ring-brand-500"
              placeholder="Cole o texto aqui…"/>
            {impErr && <div className="flex items-center gap-2 p-2 mt-2 text-xs text-red-700 rounded-lg bg-red-50"><AlertCircle className="w-3.5 h-3.5"/>{impErr}</div>}
          </div>
        </Modal>
      )}
    </div>
  )
}
