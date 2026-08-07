import { useState } from 'react'
import { porCasa, useCotizaciones } from '../lib/cotizaciones'
import {
  CATEGORIAS,
  SERVICIOS,
  type Sub,
  getSubs,
  saveSubs,
  servicioPorId,
} from '../lib/storage'

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
const usdFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function Subs() {
  const [subs, setSubs] = useState<Sub[]>(getSubs)
  const [catalogo, setCatalogo] = useState(false)
  const [cat, setCat] = useState<string>('video')
  const [editando, setEditando] = useState<Sub | null>(null)
  const { cotizaciones } = useCotizaciones()
  const blue = porCasa(cotizaciones, 'blue')?.venta ?? null

  const guardar = (next: Sub[]) => {
    setSubs(next)
    saveSubs(next)
  }

  // Todo se lleva a pesos: lo que se paga en dólares va al blue.
  const enPesos = (s: Sub): number | null =>
    s.moneda === 'ars' ? s.precio : blue != null ? s.precio * blue : null

  const activas = subs.filter((s) => !s.pausada)
  const totalMes = activas.reduce((acc, s) => acc + (enPesos(s) ?? 0), 0)
  const faltaCotizacion = activas.some((s) => s.moneda === 'usd' && blue == null)
  const totalUsd = blue != null ? totalMes / blue : null

  const agregar = (servicioId: string, planId: string) => {
    const serv = servicioPorId(servicioId)
    const plan = serv?.planes.find((p) => p.id === planId)
    if (!serv || !plan) return
    guardar([
      ...subs,
      {
        id: crypto.randomUUID(),
        servicioId: serv.id,
        nombre: serv.nombre,
        plan: plan.nombre,
        precio: plan.precio,
        moneda: plan.moneda,
      },
    ])
    setCatalogo(false)
  }

  const agregarPropia = () => {
    const nueva: Sub = {
      id: crypto.randomUUID(),
      servicioId: 'custom',
      nombre: '',
      plan: '',
      precio: 0,
      moneda: 'ars',
    }
    setCatalogo(false)
    setEditando(nueva)
  }

  const yaTengo = (id: string) => subs.some((s) => s.servicioId === id)

  return (
    <>
      <header className="crm-header">
        <h1>Suscripciones</h1>
        <button type="button" className="btn btn-primary" onClick={() => setCatalogo(true)}>
          + Agregar
        </button>
      </header>

      <section className="subs-total">
        <div className="subs-total-fila">
          <span className="subs-monto">{ars.format(totalMes)}</span>
          <span className="subs-por">por mes</span>
        </div>
        <div className="subs-detalle">
          {ars.format(totalMes * 12)} al año
          {totalUsd != null && ` · ${usdFmt.format(totalUsd)} al mes`}
          {` · ${activas.length} activa${activas.length === 1 ? '' : 's'}`}
          {subs.length > activas.length && ` · ${subs.length - activas.length} en pausa`}
        </div>
        {faltaCotizacion && (
          <div className="subs-aviso">Sin cotización del blue todavía: faltan las que van en USD.</div>
        )}
      </section>

      {subs.length === 0 ? (
        <div className="empty">
          <p>Todavía no cargaste ninguna suscripción.</p>
          <button type="button" className="btn btn-primary" onClick={() => setCatalogo(true)}>
            Elegir del catálogo
          </button>
        </div>
      ) : (
        <ul className="lista">
          {subs.map((s) => {
            const pesos = enPesos(s)
            return (
              <li key={s.id} className={`fila subs-fila ${s.pausada ? 'is-pausada' : ''}`}>
                <button type="button" className="fila-info" onClick={() => setEditando(s)}>
                  <span className="fila-nombre">{s.nombre || 'Sin nombre'}</span>
                  <span className="fila-empresa">
                    {[s.plan, s.dia ? `día ${s.dia}` : null, s.pausada ? 'en pausa' : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </button>
                <div className="fila-monto">
                  <span className="monto-usd">
                    {pesos != null ? ars.format(pesos) : '—'}
                  </span>
                  {s.moneda === 'usd' && (
                    <span className="monto-ars">{usdFmt.format(s.precio)}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <footer className="crm-footer">
        <span>Precios editables · guardado en este navegador</span>
        {subs.length > 0 && (
          <button type="button" className="btn-ghost" onClick={agregarPropia}>
            + Otra
          </button>
        )}
      </footer>

      {catalogo && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setCatalogo(false)}
        >
          <div className="modal">
            <h2>Agregar suscripción</h2>
            <div className="filtros">
              {CATEGORIAS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`filtro ${cat === c.id ? 'is-active' : ''}`}
                  onClick={() => setCat(c.id)}
                >
                  {c.nombre}
                </button>
              ))}
            </div>

            <div className="subs-catalogo">
              {SERVICIOS.filter((s) => s.cat === cat).map((serv) => (
                <div className="subs-serv" key={serv.id}>
                  <div className="subs-serv-nombre">
                    {serv.nombre}
                    {yaTengo(serv.id) && <span className="subs-tag">ya la tenés</span>}
                  </div>
                  <div className="subs-planes">
                    {serv.planes.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className="subs-plan"
                        onClick={() => agregar(serv.id, p.id)}
                      >
                        <span>{p.nombre}</span>
                        <strong>
                          {p.moneda === 'ars' ? ars.format(p.precio) : usdFmt.format(p.precio)}
                        </strong>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={agregarPropia}>
                Otra
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setCatalogo(false)}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <SubForm
          initial={editando}
          esNueva={!subs.some((s) => s.id === editando.id)}
          onSave={(s) => {
            guardar(
              subs.some((x) => x.id === s.id)
                ? subs.map((x) => (x.id === s.id ? s : x))
                : [...subs, s],
            )
            setEditando(null)
          }}
          onCancel={() => setEditando(null)}
          onDelete={(id) => {
            guardar(subs.filter((s) => s.id !== id))
            setEditando(null)
          }}
        />
      )}
    </>
  )
}

function SubForm({
  initial,
  esNueva,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Sub
  esNueva: boolean
  onSave: (s: Sub) => void
  onCancel: () => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Sub>(k: K, v: Sub[K]) => setDraft((d) => ({ ...d, [k]: v }))

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
        <h2>{esNueva ? 'Nueva suscripción' : draft.nombre}</h2>
        <div className="field-row">
          <label>
            Nombre
            <input
              value={draft.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              autoFocus={esNueva}
              required
            />
          </label>
          <label>
            Plan
            <input value={draft.plan} onChange={(e) => set('plan', e.target.value)} />
          </label>
        </div>
        <div className="field-row">
          <label>
            Precio
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={draft.precio || ''}
              onChange={(e) => set('precio', Number(e.target.value))}
            />
          </label>
          <label>
            Moneda
            <select
              value={draft.moneda}
              onChange={(e) => set('moneda', e.target.value as 'ars' | 'usd')}
            >
              <option value="ars">Pesos</option>
              <option value="usd">Dólares</option>
            </select>
          </label>
          <label>
            Día
            <input
              type="number"
              min="1"
              max="31"
              value={draft.dia ?? ''}
              onChange={(e) =>
                set('dia', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />
          </label>
        </div>
        <label className="ajuste-check">
          <input
            type="checkbox"
            checked={draft.pausada ?? false}
            onChange={(e) => set('pausada', e.target.checked)}
          />
          En pausa (no suma al total)
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
              if (confirm(`¿Dar de baja ${draft.nombre}?`)) onDelete(draft.id)
            }}
          >
            Borrar
          </button>
        )}
      </form>
    </div>
  )
}
