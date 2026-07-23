import { useEffect, useRef, useState } from 'react'
import { porCasa, useCotizaciones } from '../lib/cotizaciones'
import {
  type Cliente,
  type Estado,
  type Venta,
  ESTADOS,
  ESTADOS_ABIERTOS,
  deleteCliente,
  deleteVenta,
  diasSinContacto,
  exportJson,
  getClientes,
  getVentas,
  newCliente,
  newVenta,
  saveCliente,
  saveVenta,
} from '../lib/storage'

const usd = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
const fecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

const DIAS_ALERTA = 14

type Tab = 'clientes' | 'ventas'

function EstadoPill({ venta, onChange }: { venta: Venta; onChange: (estado: Estado) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="pill-wrap" ref={ref}>
      <button
        type="button"
        className={`pill pill-${venta.estado}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`dot dot-${venta.estado}`} />
        {venta.estado}
      </button>
      {open && (
        <div className="pill-menu">
          {ESTADOS.map((e) => (
            <button
              type="button"
              key={e}
              className={`pill-option ${e === venta.estado ? 'is-current' : ''}`}
              onClick={() => {
                onChange(e)
                setOpen(false)
              }}
            >
              <span className={`dot dot-${e}`} />
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ClienteForm({
  initial,
  esNuevo,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Cliente
  esNuevo: boolean
  onSave: (c: Cliente) => void
  onCancel: () => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Cliente>(key: K, value: Cliente[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.nombre.trim()) return
          onSave({ ...draft, nombre: draft.nombre.trim() })
        }}
      >
        <h2>{esNuevo ? 'Nuevo cliente' : 'Editar cliente'}</h2>
        <label>
          Nombre
          <input
            value={draft.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            autoFocus
            required
          />
        </label>
        <div className="field-row">
          <label>
            Empresa
            <input value={draft.empresa ?? ''} onChange={(e) => set('empresa', e.target.value)} />
          </label>
          <label>
            Teléfono
            <input
              type="tel"
              value={draft.telefono ?? ''}
              onChange={(e) => set('telefono', e.target.value)}
            />
          </label>
        </div>
        <label>
          Email
          <input
            type="email"
            value={draft.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>
        <label>
          Nota
          <textarea rows={3} value={draft.nota} onChange={(e) => set('nota', e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
        {!esNuevo && (
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (confirm(`¿Borrar a ${draft.nombre}? También se borran sus ventas.`))
                onDelete(draft.id)
            }}
          >
            Borrar cliente
          </button>
        )}
      </form>
    </div>
  )
}

function VentaForm({
  initial,
  esNueva,
  clientes,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Venta
  esNueva: boolean
  clientes: Cliente[]
  onSave: (v: Venta) => void
  onCancel: () => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Venta>(key: K, value: Venta[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.clienteId || !draft.concepto.trim()) return
          onSave({ ...draft, concepto: draft.concepto.trim() })
        }}
      >
        <h2>{esNueva ? 'Nueva venta' : 'Editar venta'}</h2>
        <label>
          Cliente
          <select
            value={draft.clienteId}
            onChange={(e) => set('clienteId', e.target.value)}
            required
            autoFocus={esNueva}
          >
            <option value="" disabled>
              Elegir cliente…
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.empresa ? ` — ${c.empresa}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Concepto
          <input
            value={draft.concepto}
            onChange={(e) => set('concepto', e.target.value)}
            placeholder="Qué le estás vendiendo"
            required
          />
        </label>
        <div className="field-row">
          <label>
            Estado
            <select value={draft.estado} onChange={(e) => set('estado', e.target.value as Estado)}>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <label>
            Monto (USD)
            <input
              type="number"
              min="0"
              step="any"
              value={draft.montoUsd ?? ''}
              onChange={(e) =>
                set('montoUsd', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />
          </label>
        </div>
        <label>
          Nota
          <textarea rows={3} value={draft.nota} onChange={(e) => set('nota', e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
        {!esNueva && (
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (confirm('¿Borrar esta venta?')) onDelete(draft.id)
            }}
          >
            Borrar venta
          </button>
        )}
      </form>
    </div>
  )
}

export default function Crm() {
  const [tab, setTab] = useState<Tab>('ventas')
  const [clientes, setClientes] = useState<Cliente[]>(getClientes)
  const [ventas, setVentas] = useState<Venta[]>(getVentas)
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<Estado | 'todos'>('todos')
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null)
  const { cotizaciones } = useCotizaciones()
  const blue = porCasa(cotizaciones, 'blue')

  const clientePorId = (id: string) => clientes.find((c) => c.id === id)
  const busqueda = q.trim().toLowerCase()

  const clientesVisibles = clientes.filter((c) => {
    const texto = `${c.nombre} ${c.empresa ?? ''} ${c.email ?? ''} ${c.nota}`.toLowerCase()
    return texto.includes(busqueda)
  })

  const ventasVisibles = ventas.filter((v) => {
    if (filtro !== 'todos' && v.estado !== filtro) return false
    const cliente = clientePorId(v.clienteId)
    const texto = `${cliente?.nombre ?? ''} ${cliente?.empresa ?? ''} ${v.concepto} ${v.nota}`.toLowerCase()
    return texto.includes(busqueda)
  })

  const agregar = () => {
    if (tab === 'clientes') setEditingCliente(newCliente())
    else if (clientes.length === 0) setEditingCliente(newCliente())
    else setEditingVenta(newVenta(clientes[0].id))
  }

  const esNuevoCliente = editingCliente != null && !clientes.some((c) => c.id === editingCliente.id)
  const esNuevaVenta = editingVenta != null && !ventas.some((v) => v.id === editingVenta.id)

  return (
    <div className="crm">
      <header className="crm-header">
        <h1>CRM</h1>
        <button type="button" className="btn btn-primary" onClick={agregar}>
          + Agregar
        </button>
      </header>

      <div className="segmented" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'clientes'}
          className={`segment ${tab === 'clientes' ? 'is-active' : ''}`}
          onClick={() => setTab('clientes')}
        >
          Mis clientes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'ventas'}
          className={`segment ${tab === 'ventas' ? 'is-active' : ''}`}
          onClick={() => setTab('ventas')}
        >
          Mis ventas
        </button>
      </div>

      <div className="crm-toolbar">
        <input
          className="search"
          placeholder={
            tab === 'clientes' ? 'Buscar cliente…' : 'Buscar por cliente, concepto, nota…'
          }
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {tab === 'ventas' && (
          <div className="filtros">
            {(['todos', ...ESTADOS] as const).map((f) => (
              <button
                type="button"
                key={f}
                className={`filtro ${filtro === f ? 'is-active' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'clientes' &&
        (clientesVisibles.length === 0 ? (
          <div className="empty">
            {clientes.length === 0 ? (
              <>
                <p>Todavía no hay clientes.</p>
                <button type="button" className="btn btn-primary" onClick={agregar}>
                  Agregar el primero
                </button>
              </>
            ) : (
              <p>Nada coincide con la búsqueda.</p>
            )}
          </div>
        ) : (
          <ul className="lista">
            {clientesVisibles.map((c) => {
              const abiertas = ventas.filter(
                (v) => v.clienteId === c.id && ESTADOS_ABIERTOS.includes(v.estado),
              ).length
              return (
                <li key={c.id} className="fila">
                  <button type="button" className="fila-info" onClick={() => setEditingCliente(c)}>
                    <span className="fila-nombre">{c.nombre}</span>
                    {(c.empresa || c.email) && (
                      <span className="fila-empresa">
                        {[c.empresa, c.email].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {c.nota && <span className="fila-nota">{c.nota}</span>}
                  </button>
                  <span className="fila-meta">
                    {abiertas > 0 && `${abiertas} venta${abiertas === 1 ? '' : 's'} abierta${abiertas === 1 ? '' : 's'}`}
                  </span>
                </li>
              )
            })}
          </ul>
        ))}

      {tab === 'ventas' &&
        (ventasVisibles.length === 0 ? (
          <div className="empty">
            {ventas.length === 0 ? (
              <>
                <p>
                  {clientes.length === 0
                    ? 'Para cargar una venta, primero agregá un cliente.'
                    : 'Todavía no hay ventas.'}
                </p>
                <button type="button" className="btn btn-primary" onClick={agregar}>
                  {clientes.length === 0 ? 'Agregar cliente' : 'Agregar la primera'}
                </button>
              </>
            ) : (
              <p>Nada coincide con la búsqueda.</p>
            )}
          </div>
        ) : (
          <ul className="lista">
            {ventasVisibles.map((v) => {
              const cliente = clientePorId(v.clienteId)
              const dias = diasSinContacto(v)
              const alerta = ESTADOS_ABIERTOS.includes(v.estado) && dias > DIAS_ALERTA
              return (
                <li key={v.id} className="fila">
                  <button type="button" className="fila-info" onClick={() => setEditingVenta(v)}>
                    <span className="fila-nombre">
                      {alerta && <span className="alerta-dot" title={`${dias} días sin contacto`} />}
                      {cliente?.nombre ?? 'Sin cliente'}
                    </span>
                    {v.concepto && <span className="fila-empresa">{v.concepto}</span>}
                    {v.nota && <span className="fila-nota">{v.nota}</span>}
                  </button>
                  <div className="fila-monto">
                    {v.montoUsd != null && (
                      <>
                        <span className="monto-usd">{usd.format(v.montoUsd)}</span>
                        {blue && (
                          <span className="monto-ars">{ars.format(v.montoUsd * blue.venta)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <EstadoPill
                    venta={v}
                    onChange={(estado) =>
                      setVentas(
                        saveVenta({ ...v, estado, ultimoContacto: new Date().toISOString() }),
                      )
                    }
                  />
                  <div className="fila-contacto">
                    <span className="fila-fecha">{fecha.format(new Date(v.ultimoContacto))}</span>
                    <button
                      type="button"
                      className="btn-ghost btn-base"
                      title="Marcar contacto hoy"
                      onClick={() =>
                        setVentas(saveVenta({ ...v, ultimoContacto: new Date().toISOString() }))
                      }
                    >
                      toqué base
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        ))}

      <footer className="crm-footer">
        <span>
          {tab === 'clientes'
            ? `${clientes.length} cliente${clientes.length === 1 ? '' : 's'}`
            : `${ventas.length} venta${ventas.length === 1 ? '' : 's'}`}{' '}
          · guardado en este navegador
        </span>
        {(clientes.length > 0 || ventas.length > 0) && (
          <button type="button" className="btn-ghost" onClick={exportJson}>
            Exportar JSON
          </button>
        )}
      </footer>

      {editingCliente && (
        <ClienteForm
          initial={editingCliente}
          esNuevo={esNuevoCliente}
          onSave={(c) => {
            setClientes(saveCliente(c))
            setEditingCliente(null)
          }}
          onCancel={() => setEditingCliente(null)}
          onDelete={(id) => {
            const res = deleteCliente(id)
            setClientes(res.clientes)
            setVentas(res.ventas)
            setEditingCliente(null)
          }}
        />
      )}

      {editingVenta && (
        <VentaForm
          initial={editingVenta}
          esNueva={esNuevaVenta}
          clientes={clientes}
          onSave={(v) => {
            setVentas(saveVenta({ ...v, ultimoContacto: new Date().toISOString() }))
            setEditingVenta(null)
          }}
          onCancel={() => setEditingVenta(null)}
          onDelete={(id) => {
            setVentas(deleteVenta(id))
            setEditingVenta(null)
          }}
        />
      )}
    </div>
  )
}
