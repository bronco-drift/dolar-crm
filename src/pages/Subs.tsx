import { useState } from 'react'
import { porCasa, useCotizaciones } from '../lib/cotizaciones'
import {
  CATEGORIAS,
  type PlanSub,
  SERVICIOS,
  type Servicio,
  type Sub,
  getMonedaVista,
  getSubs,
  saveMonedaVista,
  saveSubs,
} from '../lib/storage'

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
// Con decimales solo cuando hacen falta: los planes chatos convertidos a
// dólares (US$ 1,38) se distinguirían mal si se redondearan al entero.
const usdFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export default function Subs() {
  const [subs, setSubs] = useState<Sub[]>(getSubs)
  const [cat, setCat] = useState<string>('todas')
  const [vista, setVista] = useState<'ars' | 'usd'>(getMonedaVista)
  const [editando, setEditando] = useState<Sub | null>(null)
  const { cotizaciones } = useCotizaciones()
  const blue = porCasa(cotizaciones, 'blue')?.venta ?? null

  const guardar = (next: Sub[]) => {
    setSubs(next)
    saveSubs(next)
  }

  const cambiarVista = (m: 'ars' | 'usd') => {
    setVista(m)
    saveMonedaVista(m)
  }

  // Todo se lleva a pesos: lo que se paga en dólares va al blue.
  const enPesos = (s: Sub): number | null =>
    s.moneda === 'ars' ? s.precio : blue != null ? s.precio * blue : null

  // Un solo formateador para toda la pantalla: no importa en qué moneda
  // se cobre cada servicio, se lee todo en la moneda elegida arriba.
  const precio = (monto: number, moneda: 'ars' | 'usd'): string => {
    if (moneda === vista) return (vista === 'ars' ? ars : usdFmt).format(monto)
    if (blue == null) return '—'
    return vista === 'ars' ? ars.format(monto * blue) : usdFmt.format(monto / blue)
  }

  const activas = subs.filter((s) => !s.pausada)
  const totalMes = activas.reduce((acc, s) => acc + (enPesos(s) ?? 0), 0)
  const totalUsd = blue != null ? totalMes / blue : null
  const faltaCotizacion = blue == null

  const subDe = (servicioId: string) => subs.find((s) => s.servicioId === servicioId)

  // Las guardadas antes de que existiera planId se reconocen por el nombre.
  const esElPlan = (sub: Sub | undefined, plan: PlanSub) =>
    sub != null && (sub.planId ? sub.planId === plan.id : sub.plan === plan.nombre)

  // Un toque en el plan: lo activa, cambia de plan, o da de baja.
  const tocarPlan = (serv: Servicio, plan: PlanSub) => {
    const actual = subDe(serv.id)
    if (actual && esElPlan(actual, plan)) {
      guardar(subs.filter((s) => s.id !== actual.id))
      return
    }
    if (actual) {
      guardar(
        subs.map((s) =>
          s.id === actual.id
            ? { ...s, planId: plan.id, plan: plan.nombre, precio: plan.precio, moneda: plan.moneda }
            : s,
        ),
      )
      return
    }
    guardar([
      ...subs,
      {
        id: crypto.randomUUID(),
        servicioId: serv.id,
        nombre: serv.nombre,
        plan: plan.nombre,
        planId: plan.id,
        precio: plan.precio,
        moneda: plan.moneda,
      },
    ])
  }

  const propias = subs.filter((s) => s.servicioId === 'custom')
  const visibles = SERVICIOS.filter((s) => cat === 'todas' || s.cat === cat)

  return (
    <>
      <header className="crm-header">
        <h1>Suscripciones</h1>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            setEditando({
              id: crypto.randomUUID(),
              servicioId: 'custom',
              nombre: '',
              plan: '',
              precio: 0,
              moneda: 'ars',
            })
          }
        >
          + Otra
        </button>
      </header>

      <section className="subs-total">
        <div className="subs-total-fila">
          <span className="subs-monto">
            {vista === 'ars'
              ? ars.format(totalMes)
              : totalUsd != null
                ? usdFmt.format(totalUsd)
                : '—'}
          </span>
          <span className="subs-por">por mes</span>
          <div className="subs-moneda">
            {(['ars', 'usd'] as const).map((m) => (
              <button
                type="button"
                key={m}
                className={vista === m ? 'is-active' : ''}
                onClick={() => cambiarVista(m)}
              >
                {m === 'ars' ? 'ARS' : 'USD'}
              </button>
            ))}
          </div>
        </div>
        <div className="subs-detalle">
          {vista === 'ars'
            ? `${ars.format(totalMes * 12)} al año`
            : totalUsd != null
              ? `${usdFmt.format(totalUsd * 12)} al año`
              : 'sin cotización'}
          {` · ${activas.length} activa${activas.length === 1 ? '' : 's'}`}
          {subs.length > activas.length && ` · ${subs.length - activas.length} en pausa`}
        </div>
        {faltaCotizacion && (
          <div className="subs-aviso">Sin cotización del blue todavía: faltan precios por convertir.</div>
        )}
      </section>

      {propias.length > 0 && (
        <>
          <div className="jp-etiqueta">Tuyas</div>
          <ul className="lista">
            {propias.map((s) => (
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
                  <span className="monto-usd">{precio(s.precio, s.moneda)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="filtros">
        {[{ id: 'todas', nombre: 'Todas' }, ...CATEGORIAS].map((c) => (
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
        {visibles.map((serv) => {
          const sub = subDe(serv.id)
          const activa = sub != null && !sub.pausada
          return (
            <div key={serv.id} className={`subs-serv ${sub ? 'is-activa' : ''}`}>
              <div className="subs-serv-head">
                <span className="subs-serv-nombre">{serv.nombre}</span>
                {sub && (
                  <button
                    type="button"
                    className="subs-serv-precio"
                    title="Editar precio, día o pausar"
                    onClick={() => setEditando(sub)}
                  >
                    {precio(sub.precio, sub.moneda)}
                    {!activa && <span className="subs-serv-usd">en pausa</span>}
                  </button>
                )}
              </div>
              <div className="subs-planes">
                {serv.planes.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={`subs-plan ${esElPlan(sub, p) ? 'is-elegido' : ''}`}
                    onClick={() => tocarPlan(serv, p)}
                  >
                    <span>{p.nombre}</span>
                    <strong>{precio(p.precio, p.moneda)}</strong>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <footer className="crm-footer">
        <span>
          {SERVICIOS.length} servicios · precios de referencia Argentina, editables
          {blue != null && ` · lo que se cobra en USD va al blue de ${ars.format(blue)}`}
        </span>
      </footer>

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
        <h2>{esNueva ? 'Otra suscripción' : draft.nombre}</h2>
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
            Dar de baja
          </button>
        )}
      </form>
    </div>
  )
}
