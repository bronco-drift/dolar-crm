import { NavLink } from 'react-router-dom'

const IconDolar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9.5c-.6-1-1.6-1.5-3-1.5-1.7 0-2.8.9-2.8 2.1 0 3 6 1.6 6 4.6 0 1.3-1.2 2.3-3.2 2.3-1.5 0-2.6-.6-3.2-1.6M12 6.5v11" strokeLinecap="round" />
  </svg>
)

const IconHerramientas = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
)

export default function TabBar() {
  return (
    <nav className="tabbar" aria-label="Secciones">
      <NavLink to="/" end className={({ isActive }) => `tab ${isActive ? 'is-active' : ''}`}>
        {IconDolar}
        <span>Dólar</span>
      </NavLink>
      <NavLink
        to="/herramientas"
        className={({ isActive }) => `tab ${isActive ? 'is-active' : ''}`}
      >
        {IconHerramientas}
        <span>Herramientas</span>
      </NavLink>
    </nav>
  )
}
