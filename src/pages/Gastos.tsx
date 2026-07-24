import { useState } from 'react'
import { porCasa, useCotizaciones } from '../lib/cotizaciones'
import {
  CATEGORIAS_GASTO,
  type CategoriaGasto,
  type Gasto,
  deleteGasto,
  getGastos,
  newGasto,
  saveGasto,
} from '../lib/storage'

const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
const usd = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const mesActual = () => new Date().toISOString().slice(0, 7) // YYYY-MM

function etiquetaMes(mes: string): string {
  const [y, m] = mes.split('-').map(Number)
  return `${MESES[m - 1]} ${y}`
}

function sumarMes(mes: string, delta: number): string {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function GastoForm({
  initial,
  esNuevo,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Gasto
  esNuevo: boolean
  onSave: (g: Gasto) => void
  onCancel: () => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState(initial)
  const set = <K extends keyof Gasto>(key: K, value: Gasto[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          if (!(draft.monto > 0)) return
          onSave(draft)
        }}
      >
        <h2>{esNuevo ? 'Nuevo gasto' : 'Editar gasto'}</h2>
        <div className="field-row">
          <label>
            Monto
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={draft.monto || ''}
              autoFocus={esNuevo}
              required
              onChange={(e) => set('monto', Number(e.target.value))}
            />
          </label>
          <label>
            Moneda
            <select
              value={draft.moneda}
              onChange={(e) => set('moneda', e.target.value as Gasto['moneda'])}
            >
              <option value="ars">🇦🇷 Pesos</option>
              <option value="usd">🇺🇸 Dólares</option>
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            Categoría
            <select
              value={draft.categoria}
              onChange={(e) => set('categoria', e.target.value as CategoriaGasto)}
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input
              type="date"
              value={draft.fecha}
              required
              onChange={(e) => set('fecha', e.target.value)}
            />
          </label>
        </div>
        <label>
          Nota
          <input
            value={draft.nota}
            placeholder="Opcional"
            onChange={(e) => set('nota', e.target.value)}
          />
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
              if (confirm('¿Borrar este gasto?')) onDelete(draft.id)
            }}
          >
            Borrar gasto
          </button>
        )}
      </form>
    </div>
  )
}

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>(getGastos)
  const [vista, setVista] = useState<'gastos' | 'reporte'>('gastos')
  const [mes, setMes] = useState(mesActual)
  const [editing, setEditing] = useState<Gasto | null>(null)
  const { cotizaciones } = useCotizaciones()
  const blue = porCasa(cotizaciones, 'blue')

  const enArs = (g: Gasto): number | null =>
    g.moneda === 'usd' ? (blue ? g.monto * blue.venta : null) : g.monto

  const delMes = gastos
    .filter((g) => g.fecha.startsWith(mes))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const total = delMes.reduce((acc, g) => acc + (enArs(g) ?? 0), 0)

  const porCategoria = [...delMes.reduce((map, g) => {
    map.set(g.categoria, (map.get(g.categoria) ?? 0) + (enArs(g) ?? 0))
    return map
  }, new Map<CategoriaGasto, number>())].sort((a, b) => b[1] - a[1])
  const maxCategoria = porCategoria[0]?.[1] ?? 0

  const esNuevo = editing != null && !gastos.some((g) => g.id === editing.id)
  const diaDe = (fecha: string) => Number(fecha.slice(8, 10))

  return (
    <>
      <header className="crm-header">
        <h1>Gastos</h1>
        <button type="button" className="btn btn-primary" onClick={() => setEditing(newGasto())}>
          + Agregar
        </button>
      </header>

      <div className="segmented" role="tablist">
        {(['gastos', 'reporte'] as const).map((v) => (
          <button
            type="button"
            role="tab"
            key={v}
            aria-selected={vista === v}
            className={`segment ${vista === v ? 'is-active' : ''}`}
            onClick={() => setVista(v)}
          >
            {v === 'gastos' ? 'Gastos' : 'Reporte'}
          </button>
        ))}
      </div>

      <div className="mes-nav">
        <button type="button" className="mes-flecha" onClick={() => setMes(sumarMes(mes, -1))}>
          ‹
        </button>
        <span className="mes-label">{etiquetaMes(mes)}</span>
        <button type="button" className="mes-flecha" onClick={() => setMes(sumarMes(mes, 1))}>
          ›
        </button>
      </div>

      {delMes.length > 0 && <p className="gastos-total">{pesos.format(total)}</p>}

      {delMes.length === 0 ? (
        <div className="empty">
          <p>Sin gastos en {etiquetaMes(mes)}.</p>
          <button type="button" className="btn btn-primary" onClick={() => setEditing(newGasto())}>
            Registrar el primero
          </button>
        </div>
      ) : vista === 'gastos' ? (
        <ul className="lista">
          {delMes.map((g) => (
            <li key={g.id} className="fila">
              <button type="button" className="fila-info" onClick={() => setEditing(g)}>
                <span className="fila-nombre gasto-cat">{g.categoria}</span>
                {g.nota && <span className="fila-empresa">{g.nota}</span>}
              </button>
              <div className="fila-monto">
                <span className="monto-usd">
                  {g.moneda === 'usd' ? usd.format(g.monto) : pesos.format(g.monto)}
                </span>
                {g.moneda === 'usd' && enArs(g) != null && (
                  <span className="monto-ars">{pesos.format(enArs(g)!)}</span>
                )}
              </div>
              <span className="fila-fecha">{diaDe(g.fecha)} {etiquetaMes(mes).split(' ')[0].slice(0, 3)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="rep-lista">
          {porCategoria.map(([cat, monto]) => (
            <li key={cat} className="rep-item">
              <div className="rep-head">
                <span className="rep-cat">{cat}</span>
                <span className="rep-monto">{pesos.format(monto)}</span>
              </div>
              <div className="rep-barra">
                <div
                  className="rep-fill"
                  style={{ width: `${maxCategoria ? (monto / maxCategoria) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="crm-footer">
        <span>
          {delMes.length} gasto{delMes.length === 1 ? '' : 's'} en {etiquetaMes(mes)} · guardado en
          este navegador
        </span>
      </footer>

      {editing && (
        <GastoForm
          initial={editing}
          esNuevo={esNuevo}
          onSave={(g) => {
            setGastos(saveGasto(g))
            setEditing(null)
          }}
          onCancel={() => setEditing(null)}
          onDelete={(id) => {
            setGastos(deleteGasto(id))
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
