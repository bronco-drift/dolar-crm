import { write } from './core'

// ── Mis tareas (kanban) ──

export interface KanbanColumna {
  id: string
  nombre: string
}

export interface Tarea {
  id: string
  titulo: string
  nota: string
  columnaId: string
  createdAt: string
}

export interface KanbanState {
  columnas: KanbanColumna[]
  tareas: Tarea[]
}

const K_KANBAN = 'dolar-crm:kanban'

const COLUMNAS_DEFAULT: KanbanColumna[] = [
  { id: 'todo', nombre: 'Por hacer' },
  { id: 'progreso', nombre: 'En progreso' },
  { id: 'hecho', nombre: 'Hecho' },
]

export function getKanban(): KanbanState {
  try {
    const raw = localStorage.getItem(K_KANBAN)
    if (raw) {
      const state = JSON.parse(raw) as KanbanState
      // Migración de la v1: nombres en inglés y columna "Cerrada".
      let cambio = false
      for (const c of state.columnas) {
        if (c.id === 'todo' && c.nombre === 'To do') {
          c.nombre = 'Por hacer'
          cambio = true
        }
        if (c.id === 'progreso' && c.nombre === 'In progress') {
          c.nombre = 'En progreso'
          cambio = true
        }
      }
      const cerradaVacia =
        state.columnas.some((c) => c.id === 'cerrada') &&
        !state.tareas.some((t) => t.columnaId === 'cerrada')
      if (cerradaVacia) {
        state.columnas = state.columnas.filter((c) => c.id !== 'cerrada')
        cambio = true
      }
      if (cambio) write(K_KANBAN, state)
      return state
    }
  } catch {
    /* usar defaults */
  }
  return { columnas: COLUMNAS_DEFAULT, tareas: [] }
}

export function saveKanban(state: KanbanState) {
  write(K_KANBAN, state)
}
