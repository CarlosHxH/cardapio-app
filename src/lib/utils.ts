import type { Cardapio } from '../types'

export function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export const hoje = new Date().toISOString().split('T')[0];

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return new Date(Number(y), Number(m)-1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ── Parser de mensagem de cardápio (WhatsApp, etc.) ───────
export function parsearCardapio(texto: string): Partial<Cardapio> {
  const linhas = texto.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean)

  const r = {
    opcao1: [] as string[], opcao2: [] as string[],
    marmitas: [] as Cardapio['marmitas'],
    adicionais: [] as Cardapio['adicionais'],
    bebidas: [] as Cardapio['bebidas'],
    whatsapp: '',
  }

  const SEC = { NONE:0, OP1:1, OP2:2, MARM:3, ADIC:4, BEB:5 } as const
  type S = typeof SEC[keyof typeof SEC]
  let sec: S = SEC.NONE

  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()

  function detectar(ln: string): S | null {
    if (/^menu do dia/.test(ln))                                          return SEC.OP1
    if (/^2[a-z°ª.]?\s*(op|opc|opcao)|^segunda\s*(op|opc)/.test(ln))    return SEC.OP2
    if (/^1[a-z°ª.]?\s*(op|opc|opcao)|^primeira\s*(op|opc)/.test(ln))   return SEC.OP1
    if (/^marmit/.test(ln))                                               return SEC.MARM
    if (/^adicional/.test(ln))                                            return SEC.ADIC
    if (/^bebida/.test(ln))                                               return SEC.BEB
    return null
  }

  const extrairPreco = (l: string) => {
    const m = l.match(/(\d+[,.]?\d*)\s*(?:reais?)?\s*$/i)
    return m ? parseFloat(m[1].replace(',','.')) : null
  }
  const nomeItem = (l: string) => l.replace(/\s*\d+[,.]?\d*\s*(?:reais?)?\s*$/i,'').trim()
  const cap = (s: string) => s ? s[0].toUpperCase() + s.slice(1) : s
  const ignorar = /tempero cuiaban|faca seu pedido|entregamos|regiao do cpa|com taxa|whats/i

  for (const linha of linhas) {
    const ln = norm(linha)

    const mWa = ln.match(/whats[a-z]*\s*:?\s*([\d\s\-]+)/i)
    if (mWa) {
      let num = mWa[1].replace(/[\s\-]/g,'')
      if (!num.startsWith('55')) num = '55' + num
      r.whatsapp = num; continue
    }
    const nova = detectar(ln)
    if (nova !== null) { sec = nova; continue }
    if (ignorar.test(ln)) continue
    if (linha.replace(/[^\w]/g,'').length < 2) continue

    switch (sec) {
      case SEC.OP1: case SEC.OP2: {
        const item = cap(linha.trim())
        if (item.length > 2) sec === SEC.OP1 ? r.opcao1.push(item) : r.opcao2.push(item)
        break
      }
      case SEC.MARM: {
        const m = linha.match(/n[oº°:.\s]*\s*(\d)\s+([\d,]+)/i)
        if (m) r.marmitas.push({ tamanho: 'N: '+m[1], preco: parseFloat(m[2].replace(',','.')) })
        break
      }
      case SEC.ADIC: case SEC.BEB: {
        const preco = extrairPreco(linha)
        if (preco !== null) {
          const nome = cap(nomeItem(linha))
          if (nome.length > 1)
            sec === SEC.ADIC ? r.adicionais.push({nome,preco}) : r.bebidas.push({nome,preco})
        }
        break
      }
    }
  }
  return r
}
