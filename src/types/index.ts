export interface MarmitaSize { tamanho: string; preco: number }
export interface MenuItem    { nome: string;    preco: number }

export interface Cardapio {
  opcao1:        string[]
  opcao2:        string[]
  marmitas:      MarmitaSize[]
  adicionais:    MenuItem[]
  bebidas:       MenuItem[]
  whatsapp:      string
  atualizado_em?: string
}

export interface CartItem {
  nome:     string
  preco:    number
  qtd:      number
  detalhe?: string
}

export interface Pedido {
  id:          number
  cliente_nome: string
  setor:        string
  itens:        CartItem[]
  total:        number
  status:       'pendente' | 'visto'
  data:         string
  criado_em:    string
}

// Tipo gerado pelo Supabase (row crua)
export interface PedidoRow {
  id:           number
  cliente_nome: string
  setor:        string
  itens:        CartItem[]
  total:        number
  status:       'pendente' | 'visto'
  data:         string
  criado_em:    string
}
