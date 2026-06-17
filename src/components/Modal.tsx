import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title:    React.ReactNode          // cabeçalho já estilizado (ex: <h2>…</h2>)
  onClose:  () => void
  children: React.ReactNode          // corpo (o caller controla padding/spacing)
  footer?:  React.ReactNode          // rodapé já estilizado (ex: <div className="… border-t">…)
  size?:    'sm' | 'md'
  align?:   'center' | 'bottom'      // 'bottom' = encaixa embaixo no mobile
}

const SIZE = { sm: 'max-w-sm', md: 'max-w-md' } as const

export default function Modal({ title, onClose, children, footer, size = 'md', align = 'center' }: ModalProps) {
  // Trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const alignCls = align === 'bottom' ? 'items-end sm:items-center' : 'items-center'

  return (
    <div className={`fixed inset-0 z-50 flex justify-center p-4 bg-black/60 ${alignCls}`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${SIZE[size]} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between p-4 border-b">
          {title}
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer}
      </div>
    </div>
  )
}
