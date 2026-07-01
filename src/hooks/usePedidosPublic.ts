import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { today } from '../lib/utils'
import type { Pedido } from '../types'

export function usePedidosPublic(dataSelecionada?: string) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [totalQtd, setTotalQtd] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const data = dataSelecionada || today()

  useEffect(() => {
    setLoading(true)
    supabase
      .from('pedidos')
      .select('*')
      .eq('data', data)
      .order('criado_em', { ascending: false })
      .then(({ data: rows }) => {
        setPedidos((rows ?? []) as Pedido[])
        // Conta apenas marmitas (nome começa com "Marmita"), ignorando adicionais e bebidas
        const total = rows?.reduce((acc, pedido) => acc + pedido.itens
          .filter((i: any) => i.nome.startsWith('Marmita'))
          .reduce((sum: number, i: any) => sum + i.qtd, 0), 0) ?? 0
        setTotalQtd(total)
        setLoading(false)
      })
  }, [data])

  return { pedidos, totalQtd, loading }
}
