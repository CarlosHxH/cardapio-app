import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Cardapio } from '../types'

export const DEFAULT_CARDAPIO: Cardapio = {
  opcao1:    [],
  opcao2:    [],
  marmitas:  [{tamanho:'N: 7',preco:15},{tamanho:'N: 8',preco:18},{tamanho:'N: 9',preco:23}],
  adicionais:[{nome:'Bife',preco:10},{nome:'Frango Grelhado',preco:10},{nome:'Ovo Frito',preco:2}],
  bebidas:   [
    {nome:'Coca 2 litros',preco:14},{nome:'Coca 1,5',preco:11},
    {nome:'Coca zero 2 litros',preco:14},{nome:'Guaraná Antártica 2 litros',preco:13},
    {nome:'Guaraná Antártica 1,5',preco:10},{nome:'Guaraná Antártica lata',preco:5},{nome:'Coca lata',preco:5},
  ],
  whatsapp: '5565992806693',
}

export function useCardapio() {
  const [cardapio, setCardapio] = useState<Cardapio>(DEFAULT_CARDAPIO)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function loadCardapio() {
      try {
        const { data } = await supabase
          .from('cardapio')
          .select('*')
          .eq('id', 1)
          .single()

        if (data) setCardapio(data as Cardapio)
      } finally {
        setLoading(false)
      }
    }

    void loadCardapio()
  }, [])

  async function salvarCardapio(novo: Cardapio) {
    const { error } = await supabase
      .from('cardapio')
      .upsert({ id: 1, ...novo, atualizado_em: new Date().toISOString() })
    if (error) throw new Error(error.message)
    setCardapio(novo)
  }

  return { cardapio, loading, salvarCardapio }
}
