import { useMemo, useState } from 'react'
import * as cartService from '../lib/cartService'
import type { CartItem } from '../types'

// ── Hook: estado e operações do carrinho ──────────────────
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const total    = useMemo(() => cartService.getTotal(cart), [cart])
  const totalQtd = useMemo(() => cartService.getTotalQtd(cart), [cart])

  function addItem(nome: string, preco: number, detalhe?: string) {
    setCart(prev => cartService.addItem(prev, nome, preco, detalhe))
  }
  function removeItem(nome: string, detalhe?: string) {
    setCart(prev => cartService.removeItem(prev, nome, detalhe))
  }
  function qtd(nome: string, detalhe?: string) {
    return cartService.getQtd(cart, nome, detalhe)
  }
  function clear() {
    setCart([])
  }

  return { cart, total, totalQtd, addItem, removeItem, qtd, clear }
}
