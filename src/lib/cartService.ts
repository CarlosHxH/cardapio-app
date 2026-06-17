// Service do carrinho — funções puras sobre CartItem[]
import type { CartItem } from '../types'

// Dois itens são o mesmo quando nome e detalhe coincidem
function mesmoItem(i: CartItem, nome: string, detalhe?: string) {
  return i.nome === nome && i.detalhe === detalhe
}

export function addItem(cart: CartItem[], nome: string, preco: number, detalhe?: string): CartItem[] {
  const existe = cart.find(i => mesmoItem(i, nome, detalhe))
  if (existe) {
    return cart.map(i => mesmoItem(i, nome, detalhe) ? { ...i, qtd: i.qtd + 1 } : i)
  }
  return [...cart, { nome, preco, qtd: 1, detalhe }]
}

export function removeItem(cart: CartItem[], nome: string, detalhe?: string): CartItem[] {
  const existe = cart.find(i => mesmoItem(i, nome, detalhe))
  if (!existe) return cart
  if (existe.qtd === 1) return cart.filter(i => !mesmoItem(i, nome, detalhe))
  return cart.map(i => mesmoItem(i, nome, detalhe) ? { ...i, qtd: i.qtd - 1 } : i)
}

export function getQtd(cart: CartItem[], nome: string, detalhe?: string): number {
  return cart.find(i => mesmoItem(i, nome, detalhe))?.qtd ?? 0
}

export function getTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.preco * i.qtd, 0)
}

export function getTotalQtd(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.qtd, 0)
}
