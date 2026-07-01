// Cache do cardápio no localStorage para acesso offline
import type { Cardapio } from '../types'

const KEY = 'cardapio'

export function getCardapioCache(): Cardapio | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Cardapio) : null
  } catch {
    return null
  }
}

export function setCardapioCache(cardapio: Cardapio) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cardapio))
  } catch {
    // ignora falhas de escrita (ex.: modo privado / cota cheia)
  }
}
