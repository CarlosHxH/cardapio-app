import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { today } from '../lib/utils'
import type { Pedido } from '../types'

export function usePedidosPublic(dataSelecionada?: string) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
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
        setLoading(false)
      })
  }, [data])

  return { pedidos, loading }
}
