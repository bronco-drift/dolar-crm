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
