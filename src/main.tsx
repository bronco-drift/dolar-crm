import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Herramientas from './pages/Herramientas'
import TabBar from './components/TabBar'
import './styles.css'

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
