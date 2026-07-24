import { useState } from 'react'
import { type KanbanState, type Tarea, getKanban, saveKanban } from '../lib/storage'

function TareaForm({
  initial,
  esNueva,
  estado,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Tarea
  esNueva: boolean
  estado: KanbanState
  onSave: (t: Tarea) => void
  onCancel: () => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState(initial)

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.titulo.trim()) return
          onSave({ ...draft, titulo: draft.titulo.trim() })
        }}
      >
        <h2>{esNueva ? 'Nueva tarea' : 'Editar tarea'}</h2>
        <label>
          Título
          <input
            value={draft.titulo}
            onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
            autoFocus
            required
          />
        </label>
        <label>
          Columna
          <select
            value={draft.columnaId}
            onChange={(e) => setDraft({ ...draft, columnaId: e.target.value })}
          >
            {estado.columnas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nota
          <textarea
            rows={3}
            value={draft.nota}
            onChange={(e) => setDraft({ ...draft, nota: e.target.value })}
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
        {!esNueva && (
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (confirm('¿Borrar esta tarea?')) onDelete(draft.id)
            }}
          >
            Borrar tarea
          </button>
        )}
      </form>
    </div>
  )
}

export default function Tareas() {
  const [estado, setEstado] = useState<KanbanState>(getKanban)
  const [editando, setEditando] = useState<Tarea | null>(null)
  const [configurando, setConfigurando] = useState(false)
  const [nuevaCol, setNuevaCol] = useState('')

  const guardar = (next: KanbanState) => {
    setEstado(next)
    saveKanban(next)
  }

  const esNueva = editando != null && !estado.tareas.some((t) => t.id === editando.id)

  const nuevaTarea = (): Tarea => ({
    id: crypto.randomUUID(),
    titulo: '',
    nota: '',
    columnaId: estado.columnas[0]?.id ?? '',
    createdAt: new Date().toISOString(),
  })

  const moverTarea = (t: Tarea, dir: -1 | 1) => {
    const i = estado.columnas.findIndex((c) => c.id === t.columnaId)
    const destino = estado.columnas[i + dir]
    if (!destino) return
    guardar({
      ...estado,
      tareas: estado.tareas.map((x) => (x.id === t.id ? { ...x, columnaId: destino.id } : x)),
    })
  }

  const renombrarCol = (id: string, nombre: string) => {
    guardar({
      ...estado,
      columnas: estado.columnas.map((c) => (c.id === id ? { ...c, nombre } : c)),
    })
  }

  const moverCol = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= estado.columnas.length) return
    const columnas = [...estado.columnas]
    ;[columnas[i], columnas[j]] = [columnas[j], columnas[i]]
    guardar({ ...estado, columnas })
  }

  const borrarCol = (id: string) => {
    if (estado.tareas.some((t) => t.columnaId === id)) {
      alert('Antes movete o borrá las tarjetas de esta columna.')
      return
    }
    if (estado.columnas.length <= 1) return
    guardar({ ...estado, columnas: estado.columnas.filter((c) => c.id !== id) })
  }

  const agregarCol = () => {
    const nombre = nuevaCol.trim()
    if (!nombre) return
    guardar({
      ...estado,
      columnas: [...estado.columnas, { id: crypto.randomUUID(), nombre }],
    })
    setNuevaCol('')
  }

  return (
    <>
      <header className="crm-header">
        <h1>Mis tareas</h1>
        <div className="kb-acciones">
          <button type="button" className="btn btn-ghost" onClick={() => setConfigurando(true)}>
            Columnas
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setEditando(nuevaTarea())}>
            + Agregar
          </button>
        </div>
      </header>

      <div className="kb-board">
        {estado.columnas.map((c, i) => {
          const tareasCol = estado.tareas.filter((t) => t.columnaId === c.id)
          return (
            <div key={c.id} className="kb-col">
              <div className="kb-col-head">
                <span>{c.nombre}</span>
                <span className="kb-count">{tareasCol.length}</span>
              </div>
              <div className="kb-cards">
                {tareasCol.map((t) => (
                  <div
                    key={t.id}
                    className="kb-card"
                    onClick={() => setEditando(t)}
                    role="button"
                  >
                    <span className="kb-titulo">{t.titulo}</span>
                    {t.nota && <span className="kb-nota">{t.nota}</span>}
                    <div className="kb-mover" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Mover a la columna anterior"
                        disabled={i === 0}
                        onClick={() => moverTarea(t, -1)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        title="Mover a la columna siguiente"
                        disabled={i === estado.columnas.length - 1}
                        onClick={() => moverTarea(t, 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                ))}
                {tareasCol.length === 0 && <div className="kb-vacia">Sin tarjetas</div>}
              </div>
            </div>
          )
        })}
      </div>

      <footer className="crm-footer">
        <span>
          {estado.tareas.length} tarea{estado.tareas.length === 1 ? '' : 's'} · guardado en este
          navegador
        </span>
      </footer>

      {editando && (
        <TareaForm
          initial={editando}
          esNueva={esNueva}
          estado={estado}
          onSave={(t) => {
            guardar({
              ...estado,
              tareas: esNueva
                ? [t, ...estado.tareas]
                : estado.tareas.map((x) => (x.id === t.id ? t : x)),
            })
            setEditando(null)
          }}
          onCancel={() => setEditando(null)}
          onDelete={(id) => {
            guardar({ ...estado, tareas: estado.tareas.filter((t) => t.id !== id) })
            setEditando(null)
          }}
        />
      )}

      {configurando && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setConfigurando(false)}
        >
          <div className="modal">
            <h2>Columnas</h2>
            {estado.columnas.map((c, i) => (
              <div key={c.id} className="kbc-fila">
                <input value={c.nombre} onChange={(e) => renombrarCol(c.id, e.target.value)} />
                <button
                  type="button"
                  className="kbc-btn"
                  title="Subir"
                  disabled={i === 0}
                  onClick={() => moverCol(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="kbc-btn"
                  title="Bajar"
                  disabled={i === estado.columnas.length - 1}
                  onClick={() => moverCol(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="kbc-btn kbc-borrar"
                  title="Borrar columna"
                  onClick={() => borrarCol(c.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="kbc-fila">
              <input
                placeholder="Nueva columna…"
                value={nuevaCol}
                onChange={(e) => setNuevaCol(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    agregarCol()
                  }
                }}
              />
              <button type="button" className="kbc-btn" title="Agregar" onClick={agregarCol}>
                +
              </button>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setConfigurando(false)}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
