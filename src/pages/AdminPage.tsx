import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import TabBtn from '../components/admin/TabBtn'
import PedidosTab from './admin/PedidosTab'
import CardapioTab from './admin/CardapioTab'
import ConfigTab from './admin/ConfigTab'
import { Link } from 'react-router-dom'
import { LogOut, UtensilsCrossed, ClipboardList, Settings, Key, ExternalLink } from 'lucide-react'

type Tab = 'pedidos' | 'cardapio' | 'config'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('pedidos')

  return (
    <div className="h-screen overflow-y-auto bg-stone-100">
      <header className="sticky top-0 z-40 text-white shadow-md bg-brand-700">
        <div className="flex items-center justify-between max-w-2xl px-4 py-3 mx-auto">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            <h1 className="text-lg font-black font-display">Tempero Cuiabano</h1>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-brand-100">Admin</span>
            <span className="text-xs text-brand-300 hidden sm:inline">v{__APP_VERSION__}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-brand-200 sm:block">{user?.email}</span>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-brand-200 hover:text-white transition" title="Ver cardápio">
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-brand-200 hover:text-white transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex max-w-2xl gap-1 px-4 pb-0 mx-auto overflow-x-auto scrollbar-hide">
          <TabBtn active={tab==='pedidos'}  onClick={()=>setTab('pedidos')}  icon={<ClipboardList className="w-4 h-4"/>} label="Pedidos" />
          <TabBtn active={tab==='cardapio'} onClick={()=>setTab('cardapio')} icon={<Settings className="w-4 h-4"/>}      label="Cardápio" />
          <TabBtn active={tab==='config'}   onClick={()=>setTab('config')}   icon={<Key className="w-4 h-4"/>}           label="Configurações" />
        </div>
      </header>

      <div className="max-w-2xl px-4 py-5 mx-auto">
        {tab === 'pedidos'  && <PedidosTab />}
        {tab === 'cardapio' && <CardapioTab />}
        {tab === 'config'   && <ConfigTab />}
      </div>
    </div>
  )
}
