import { read, write, upsert } from './core'

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
