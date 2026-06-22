import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import App from './App'
import { Toaster } from 'sonner';
// @ts-ignore: allow importing CSS as a side-effect in environments without CSS module declarations
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster toastOptions={{ unstyled: true, style: { padding: 0 } }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
