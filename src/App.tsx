import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ClientePage    from './pages/ClientePage'
import AdminPage      from './pages/AdminPage'
import LoginPage      from './pages/LoginPage'
import PedidosDiaPage from './pages/PedidosDiaPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-400 text-sm">Carregando…</p>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/"        element={<ClientePage />} />
      <Route path="/pedidos" element={<PedidosDiaPage />} />
      <Route path="/login"   element={user ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/admin"   element={user ? <AdminPage /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
