import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import App from './App'
import { Toaster } from 'sonner';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster toastOptions={{
          style: {
            background: 'none',
            border: 'none',
          },
        }}/>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
