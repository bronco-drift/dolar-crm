import { useState } from 'react'
import Crm from './Crm'
import Gastos from './Gastos'

const TOOLS = [
  { id: 'crm', label: 'CRM' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'pto', label: 'PTO Planner' },
] as const

type ToolId = (typeof TOOLS)[number]['id']

const TOOL_KEY = 'dolar-crm:tool'

export default function Herramientas() {
  const [tool, setTool] = useState<ToolId>(() => {
    const guardada = localStorage.getItem(TOOL_KEY)
    return TOOLS.some((t) => t.id === guardada) ? (guardada as ToolId) : 'crm'
  })

  const elegir = (id: ToolId) => {
    setTool(id)
    localStorage.setItem(TOOL_KEY, id)
  }

  return (
    <div className="crm">
      <nav className="tools-tabs" aria-label="Herramientas">
        {TOOLS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`tool-tab ${tool === t.id ? 'is-active' : ''}`}
            onClick={() => elegir(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tool === 'crm' && <Crm />}
      {tool === 'gastos' && <Gastos />}
      {tool === 'pto' && (
        <>
          <header className="crm-header">
            <h1>PTO Planner</h1>
          </header>
          <div className="empty">
            <p>Próximamente. Acá va el planificador de días libres.</p>
          </div>
        </>
      )}
    </div>
  )
}
