import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'cardapio_notif'

async function dispararNotificacao() {
  const options: NotificationOptions = {
    body: 'O cardápio foi atualizado! Confira as novidades de hoje.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'cardapio-update',
  }
  // Usa SW quando disponível — funciona mesmo com a aba em segundo plano
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification('Tempero Cuiabano 🍽️', options)
  } else {
    new Notification('Tempero Cuiabano 🍽️', options)
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
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cardapio' }, () => {
        dispararNotificacao()
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [enabled, permission])

  return { supported, permission, enabled, ativar, desativar }
}
