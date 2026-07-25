// Única puerta de acceso a la persistencia. Hoy es localStorage;
// cuando llegue el backend (Neon + Drizzle), se reescribe este
// archivo y el resto de la app no se entera.

export type Estado = 'nuevo' | 'contactado' | 'propuesta' | 'cerrado' | 'perdido'

export const ESTADOS: Estado[] = ['nuevo', 'contactado', 'propuesta', 'cerrado', 'perdido']

export const ESTADOS_ABIERTOS: Estado[] = ['nuevo', 'contactado', 'propuesta']

export interface Cliente {
  id: string
  nombre: string
  empresa?: string
  email?: string
  telefono?: string
  nota: string
  createdAt: string
}

export interface Venta {
  id: string
  clienteId: string
  concepto: string
  estado: Estado
  montoUsd?: number
  nota: string
  ultimoContacto: string // ISO date
  createdAt: string
}

const K_CLIENTES = 'dolar-crm:clientes'
const K_VENTAS = 'dolar-crm:ventas'
const K_LEGACY = 'dolar-crm:contacts'

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Los "contactos" de la versión 1 eran clientes y ventas mezclados:
// se separan en un cliente + una venta vinculada, una sola vez.
function migrateLegacy() {
  const raw = localStorage.getItem(K_LEGACY)
  if (!raw) return
  try {
    interface Legacy {
      id: string
      nombre: string
      empresa?: string
      email?: string
      estado: Estado
      montoUsd?: number
      nota: string
      ultimoContacto: string
      createdAt: string
    }
    const legacy = JSON.parse(raw) as Legacy[]
    const clientes = read<Cliente>(K_CLIENTES)
    const ventas = read<Venta>(K_VENTAS)
    for (const c of legacy) {
      clientes.push({
        id: c.id,
        nombre: c.nombre,
        empresa: c.empresa,
        email: c.email,
        nota: c.nota,
        createdAt: c.createdAt,
      })
      ventas.push({
        id: crypto.randomUUID(),
        clienteId: c.id,
        concepto: '',
        estado: c.estado,
        montoUsd: c.montoUsd,
        nota: '',
        ultimoContacto: c.ultimoContacto,
        createdAt: c.createdAt,
      })
    }
    write(K_CLIENTES, clientes)
    write(K_VENTAS, ventas)
  } finally {
    localStorage.removeItem(K_LEGACY)
  }
}

migrateLegacy()

export function getClientes(): Cliente[] {
  return read<Cliente>(K_CLIENTES)
}

export function getVentas(): Venta[] {
  return read<Venta>(K_VENTAS)
}

function upsert<T extends { id: string }>(key: string, item: T): T[] {
  const items = read<T>(key)
  const i = items.findIndex((x) => x.id === item.id)
  if (i >= 0) items[i] = item
  else items.unshift(item)
  write(key, items)
  return items
}

export function saveCliente(cliente: Cliente): Cliente[] {
  return upsert(K_CLIENTES, cliente)
}

export function saveVenta(venta: Venta): Venta[] {
  return upsert(K_VENTAS, venta)
}

// Borra el cliente y, en cascada, sus ventas.
export function deleteCliente(id: string): { clientes: Cliente[]; ventas: Venta[] } {
  const clientes = getClientes().filter((c) => c.id !== id)
  const ventas = getVentas().filter((v) => v.clienteId !== id)
  write(K_CLIENTES, clientes)
  write(K_VENTAS, ventas)
  return { clientes, ventas }
}

export function deleteVenta(id: string): Venta[] {
  const ventas = getVentas().filter((v) => v.id !== id)
  write(K_VENTAS, ventas)
  return ventas
}

export function newCliente(): Cliente {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    nota: '',
    createdAt: new Date().toISOString(),
  }
}

export function newVenta(clienteId = ''): Venta {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    clienteId,
    concepto: '',
    estado: 'nuevo',
    nota: '',
    ultimoContacto: now,
    createdAt: now,
  }
}

export function exportJson(): void {
  const payload = { clientes: getClientes(), ventas: getVentas() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `crm-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function diasSinContacto(v: Venta): number {
  const ms = Date.now() - new Date(v.ultimoContacto).getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

// ── Gastos ──

export const CATEGORIAS_GASTO = [
  'comida',
  'transporte',
  'servicios',
  'salud',
  'ocio',
  'hogar',
  'otros',
] as const

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number]

export interface Gasto {
  id: string
  fecha: string // YYYY-MM-DD
  monto: number
  moneda: 'ars' | 'usd'
  categoria: CategoriaGasto
  nota: string
  createdAt: string
}

const K_GASTOS = 'dolar-crm:gastos'

export function getGastos(): Gasto[] {
  return read<Gasto>(K_GASTOS)
}

export function saveGasto(gasto: Gasto): Gasto[] {
  return upsert(K_GASTOS, gasto)
}

export function deleteGasto(id: string): Gasto[] {
  const gastos = getGastos().filter((g) => g.id !== id)
  write(K_GASTOS, gastos)
  return gastos
}

export function newGasto(): Gasto {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    monto: 0,
    moneda: 'ars',
    categoria: 'comida',
    nota: '',
    createdAt: new Date().toISOString(),
  }
}

// ── PTO Planner ──

export interface PtoState {
  viajeInicio: string // YYYY-MM-DD
  viajeFin: string
  ptoDias: number
  inicioSemana: 0 | 1 // 0 domingo, 1 lunes
  resaltarBordes: boolean
  fijarRemotos: boolean
  pais: string // país para feriados (ver lib/feriados.ts)
  remotos: string[] // días home-office, YYYY-MM-DD
  accesoLimitado?: boolean // avisar en el mensaje de ausencia
}

const K_PTO = 'dolar-crm:pto'
const K_PTO_LEGACY = 'viajesProData' // prototipo standalone de Marcel

function fechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function hoyMas(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return fechaLocal(d)
}

export function getPto(): PtoState {
  const raw = localStorage.getItem(K_PTO)
  if (raw) {
    try {
      return JSON.parse(raw) as PtoState
    } catch {
      /* usar defaults */
    }
  }
  // Migración única desde el prototipo HTML standalone.
  const legacy = localStorage.getItem(K_PTO_LEGACY)
  if (legacy) {
    try {
      const d = JSON.parse(legacy)
      const state: PtoState = {
        viajeInicio: String(d.eventStart ?? '').slice(0, 10) || hoyMas(14),
        viajeFin: String(d.eventEnd ?? '').slice(0, 10) || hoyMas(21),
        ptoDias: Number(d.pto) || 14,
        inicioSemana: d.startOfWeek === 0 ? 0 : 1,
        resaltarBordes: d.highlightEdges ?? true,
        fijarRemotos: d.pinRemoteDays ?? true,
        pais: 'AR',
        remotos: Array.isArray(d.remoteDays) ? d.remoteDays : [],
      }
      write(K_PTO, state)
      return state
    } catch {
      /* usar defaults */
    }
  }
  return {
    viajeInicio: hoyMas(14),
    viajeFin: hoyMas(21),
    ptoDias: 14,
    inicioSemana: 1,
    resaltarBordes: true,
    fijarRemotos: true,
    pais: 'AR',
    remotos: [],
  }
}

export function savePto(state: PtoState) {
  write(K_PTO, state)
}

// ── Hábitos ──

export type TipoHabito = 'bien' | 'mal'

export interface Habito {
  id: string
  fecha: string // YYYY-MM-DD
  tipo: TipoHabito
  texto: string
  createdAt: string
}

const K_HABITOS = 'dolar-crm:habitos'

export function getHabitos(): Habito[] {
  return read<Habito>(K_HABITOS)
}

export function saveHabito(habito: Habito): Habito[] {
  return upsert(K_HABITOS, habito)
}

export function deleteHabito(id: string): Habito[] {
  const habitos = getHabitos().filter((h) => h.id !== id)
  write(K_HABITOS, habitos)
  return habitos
}

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
