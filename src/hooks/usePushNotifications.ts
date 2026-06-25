import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Cardapio } from '../types'

const STORAGE_KEY = 'cardapio_notif'

interface CardapioRow extends Cardapio {
  id?: number
  atualizado_em?: string
}

function buildNotificationBody(dados: CardapioRow): string {
  const op1 = dados.opcao1?.slice(0, 3).join(', ') ?? ''
  const op2 = dados.opcao2?.slice(0, 3).join(', ') ?? ''
  const preco = dados.marmitas?.[0]?.preco
  const precoStr = preco != null ? ` · a partir de R$ ${preco}` : ''
  return `🥘 Op. 1: ${op1}\n🥗 Op. 2: ${op2}${precoStr}`
}

async function dispararNotificacao(dados?: CardapioRow) {
  const title = 'Cardápio Atualizado! 🍽️'
  const body = dados
    ? buildNotificationBody(dados)
    : 'Confira as novidades do cardápio de hoje.'

  const options: NotificationOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'cardapio-update',
    renotify: true,
    data: {
      url: '/',
      urlPedido: '/',
    },
    actions: [
      { action: 'ver-cardapio', title: 'Ver Cardápio' },
      { action: 'fazer-pedido', title: 'Fazer Pedido' },
    ],
  } as NotificationOptions

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, options)
  } else {
    new Notification(title, options)
  }
}

export function usePushNotifications() {
  const supported = typeof window !== 'undefined' && 'Notification' in window

  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied'
  )
  const [enabled, setEnabled] = useState(
    () => !!supported && localStorage.getItem(STORAGE_KEY) === '1'
  )
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  async function ativar() {
    if (!supported) return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      setEnabled(true)
      localStorage.setItem(STORAGE_KEY, '1')
    }
  }

  function desativar() {
    setEnabled(false)
    localStorage.removeItem(STORAGE_KEY)
  }

  useEffect(() => {
    const ativo = enabled && permission === 'granted'

    if (!ativo) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    const channel = supabase
      .channel('cardapio-notif')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cardapio' },
        (payload) => {
          dispararNotificacao(payload.new as CardapioRow)
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [enabled, permission])

  return { supported, permission, enabled, ativar, desativar }
}
