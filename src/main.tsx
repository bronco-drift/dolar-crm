import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Herramientas from './pages/Herramientas'
import TabBar from './components/TabBar'
// El orden importa: define la cascada. Sistema de diseño primero,
// después cada vista, lo compartido, y al final tema oscuro y responsive.
import './styles/base.css'
import './styles/landing.css'
import './styles/crm.css'
import './styles/pto.css'
import './styles/tareas.css'
import './styles/habitos.css'
import './styles/compartido.css'
import './styles/dark.css'
import './styles/responsive.css'
import { aplicarTema, temaInicial } from './lib/tema'

// Antes del primer render, para que no haya destello del tema anterior.
aplicarTema(temaInicial(), false)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/herramientas" element={<Herramientas />} />
        <Route path="/crm" element={<Navigate to="/herramientas" replace />} />
      </Routes>
      <TabBar />
    </BrowserRouter>
  </StrictMode>,
)
