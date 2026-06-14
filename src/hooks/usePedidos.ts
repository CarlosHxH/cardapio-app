import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { today } from '../lib/utils'
import type { Pedido, CartItem } from '../types'

// ── Hook: pedidos de uma data com Realtime ────────────────
export function usePedidosHoje(dataSelecionada?: string) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [novoIds, setNovoIds] = useState<Set<number>>(new Set())

  const data = dataSelecionada || today()

  useEffect(() => {
    setLoading(true)

    // Carrega pedidos iniciais
    supabase
      .from('pedidos')
      .select('*')
      .eq('data', data)
      .order('criado_em', { ascending: false })
      .then(({ data: rows }) => {
        setPedidos((rows ?? []) as Pedido[])
        setLoading(false)
      })

    // Só assina Realtime para "hoje" (não faz sentido para histórico)
    if (data !== today()) return

    const channel = supabase
      .channel(`pedidos-${data}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos', filter: `data=eq.${data}` },
        payload => {
          const novo = payload.new as Pedido
          setPedidos(prev => [novo, ...prev])
          // Destaca visualmente por 8s
          setNovoIds(prev => new Set(prev).add(novo.id))
          setTimeout(() => setNovoIds(prev => { const s = new Set(prev); s.delete(novo.id); return s }), 8000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `data=eq.${data}` },
        payload => {
          const atualizado = payload.new as Pedido
          setPedidos(prev => prev.map(p => p.id === atualizado.id ? atualizado : p))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [data])

  async function marcarVisto(id: number) {
    await supabase.from('pedidos').update({ status: 'visto' }).eq('id', id)
    // Realtime vai atualizar automaticamente, mas otimisticamente:
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: 'visto' } : p))
  }

  async function exportRelatorio(): Promise<void> {
    const card = await supabase.from('cardapio').select('*').single()
    if (!card.data) {
      alert('Não foi possível carregar o cardápio para exportar o relatório!')
      return
    }
    const text = `Pedidos de hoje (${data}):\n
    Cardápio:\n
    - Opção 1: ${card.data.opcao1.join(', ')}\n
    - Opção 2: ${card.data.opcao2.join(', ')}\n\nPedidos:\n`
    // Gera linhas individuais por item de cada pedido, incluindo nome do cliente
    const lines: string[] = []
    pedidos.forEach(p => {
      p.itens.forEach(i => {
        lines.push(`${i.qtd}× ${i.nome}${i.detalhe ? ` ${i.detalhe}` : ''} ${p.cliente_nome}`)
      })
    })
    const exportData = text + lines.join('\n')
    if (!exportData) {
      alert('Não há pedidos para exportar!')
      return
    }
    navigator.clipboard.writeText(exportData)
    alert('Pedido exportado para a área de transferência!')
  }

  async function exportPedidos(): Promise<void> {
    const grouped = pedidos.reduce((acc, p) => {
      p.itens.forEach(i => {
        const key = `${i.nome} ${i.detalhe ? ` ${i.detalhe}` : ''}`
        acc[key] = (acc[key] || 0) + i.qtd
      })
      return acc
    }, {} as Record<string, number>)

    const exportData = Object.entries(grouped).map(([item, qtd]) => `${qtd}× ${item}`).join('\n')
    if (!exportData) {
      alert('Não há pedidos para exportar!')
      return
    }
    navigator.clipboard.writeText(exportData)
    alert('Pedido exportado para a área de transferência!')
  }

  async function marcarPendente(id: number) {
    await supabase.from('pedidos').update({ status: 'pendente' }).eq('id', id)
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: 'pendente' } : p))
  }

  async function editarPedido(id: number, dados: { cliente_nome: string; setor: string; itens: CartItem[]; total: number }) {
    const { error } = await supabase.from('pedidos').update(dados).eq('id', id)
    if (error) throw new Error(error.message)
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p))
  }

  async function excluirPedido(id: number) {
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setPedidos(prev => prev.filter(p => p.id !== id))
  }

  return { pedidos, loading, novoIds, exportRelatorio, exportPedidos, marcarVisto, marcarPendente, editarPedido, excluirPedido }
}

// ── Listar datas com pedidos ──────────────────────────────
export async function buscarDatas(): Promise<{ data: string; total: number }[]> {
  const { data } = await supabase
    .from('pedidos')
    .select('data')
    .order('data', { ascending: false })

  if (!data) return []

  // Agrupa por data
  const map = new Map<string, number>()
  for (const row of data) {
    map.set(row.data, (map.get(row.data) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([data, total]) => ({ data, total }))
    .slice(0, 30)
}

// ── Enviar pedido (cliente) ───────────────────────────────
export async function enviarPedido(payload: {
  clienteNome: string
  setor: string
  itens: CartItem[]
  total: number
}) {
  const { error } = await supabase.from('pedidos').insert({
    cliente_nome: payload.clienteNome,
    setor:        payload.setor,
    itens:        payload.itens,
    total:        payload.total,
    data:         today(),
  })
  if (error) throw new Error(error.message)
}
