import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { porCasa, useCotizaciones } from '../lib/cotizaciones'
import {
  type Contact,
  type Estado,
  ESTADOS,
  ESTADOS_ABIERTOS,
  deleteContact,
  diasSinContacto,
  exportJson,
  getContacts,
  newContact,
  saveContact,
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

function EstadoPill({
  contact,
  onChange,
}: {
  contact: Contact
  onChange: (estado: Estado) => void
}) {
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
        className={`pill pill-${contact.estado}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`dot dot-${contact.estado}`} />
        {contact.estado}
      </button>
      {open && (
        <div className="pill-menu">
          {ESTADOS.map((e) => (
            <button
              type="button"
              key={e}
              className={`pill-option ${e === contact.estado ? 'is-current' : ''}`}
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

function ContactForm({
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Contact
  onSave: (c: Contact) => void
  onCancel: () => void
  onDelete?: (id: string) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Contact>(key: K, value: Contact[K]) =>
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
        <h2>{onDelete ? 'Editar contacto' : 'Nuevo contacto'}</h2>
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
            Email
            <input
              type="email"
              value={draft.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
            />
          </label>
        </div>
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
        {onDelete && (
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (confirm(`¿Borrar a ${draft.nombre}?`)) onDelete(draft.id)
            }}
          >
            Borrar contacto
          </button>
        )}
      </form>
    </div>
  )
}

export default function Crm() {
  const [contacts, setContacts] = useState<Contact[]>(getContacts)
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<Estado | 'todos'>('todos')
  const [editing, setEditing] = useState<Contact | null>(null)
  const { cotizaciones } = useCotizaciones()
  const blue = porCasa(cotizaciones, 'blue')

  const visibles = contacts.filter((c) => {
    if (filtro !== 'todos' && c.estado !== filtro) return false
    const texto = `${c.nombre} ${c.empresa ?? ''} ${c.email ?? ''} ${c.nota}`.toLowerCase()
    return texto.includes(q.trim().toLowerCase())
  })

  const guardar = (c: Contact) => {
    setContacts(saveContact({ ...c, ultimoContacto: new Date().toISOString() }))
    setEditing(null)
  }

  const cambiarEstado = (c: Contact, estado: Estado) => {
    setContacts(saveContact({ ...c, estado, ultimoContacto: new Date().toISOString() }))
  }

  const toqueBase = (c: Contact) => {
    setContacts(saveContact({ ...c, ultimoContacto: new Date().toISOString() }))
  }

  return (
    <div className="crm">
      <header className="crm-header">
        <div className="crm-title">
          <Link to="/" className="nav-link">
            ← Dólar
          </Link>
          <h1>Contactos</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing(newContact())}>
          + Agregar
        </button>
      </header>

      <div className="crm-toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre, empresa, nota…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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
      </div>

      {visibles.length === 0 ? (
        <div className="empty">
          {contacts.length === 0 ? (
            <>
              <p>Todavía no hay contactos.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditing(newContact())}
              >
                Agregar el primero
              </button>
            </>
          ) : (
            <p>Nada coincide con la búsqueda.</p>
          )}
        </div>
      ) : (
        <ul className="lista">
          {visibles.map((c) => {
            const dias = diasSinContacto(c)
            const alerta = ESTADOS_ABIERTOS.includes(c.estado) && dias > DIAS_ALERTA
            return (
              <li key={c.id} className="fila">
                <button type="button" className="fila-info" onClick={() => setEditing(c)}>
                  <span className="fila-nombre">
                    {alerta && <span className="alerta-dot" title={`${dias} días sin contacto`} />}
                    {c.nombre}
                  </span>
                  {c.empresa && <span className="fila-empresa">{c.empresa}</span>}
                  {c.nota && <span className="fila-nota">{c.nota}</span>}
                </button>
                <div className="fila-monto">
                  {c.montoUsd != null && (
                    <>
                      <span className="monto-usd">{usd.format(c.montoUsd)}</span>
                      {blue && (
                        <span className="monto-ars">{ars.format(c.montoUsd * blue.venta)}</span>
                      )}
                    </>
                  )}
                </div>
                <EstadoPill contact={c} onChange={(e) => cambiarEstado(c, e)} />
                <div className="fila-contacto">
                  <span className="fila-fecha">{fecha.format(new Date(c.ultimoContacto))}</span>
                  <button
                    type="button"
                    className="btn-ghost btn-base"
                    title="Marcar contacto hoy"
                    onClick={() => toqueBase(c)}
                  >
                    toqué base
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <footer className="crm-footer">
        <span>
          {contacts.length} contacto{contacts.length === 1 ? '' : 's'} · guardados en este
          navegador
        </span>
        {contacts.length > 0 && (
          <button type="button" className="btn-ghost" onClick={exportJson}>
            Exportar JSON
          </button>
        )}
      </footer>

      {editing && (
        <ContactForm
          initial={editing}
          onSave={guardar}
          onCancel={() => setEditing(null)}
          onDelete={
            contacts.some((c) => c.id === editing.id)
              ? (id) => {
                  setContacts(deleteContact(id))
                  setEditing(null)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
