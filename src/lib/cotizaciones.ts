// Única fuente de verdad para cotizaciones (Argentina y Venezuela).
// El resto de la app nunca llama a DolarAPI directo: el día que exista
// backend propio, solo cambia este archivo.
import { useEffect, useState } from 'react'

export interface Cotizacion {
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export interface CotizacionVe {
  fuente: string
  nombre: string
  compra: number | null
  venta: number | null
  promedio: number | null
  fechaActualizacion: string
}

interface CacheState<T> {
  data: T[]
  fetchedAt: number
  stale: boolean
}

export type CotizacionesState = CacheState<Cotizacion>
export type BolivaresState = CacheState<CotizacionVe>

const TTL_MS = 5 * 60 * 1000
const AR_URL = 'https://dolarapi.com/v1/dolares'
const VE_URL = 'https://ve.dolarapi.com/v1/dolares'
const AR_KEY = 'dolar-crm:cotizaciones'
const VE_KEY = 'dolar-crm:bolivares'

function readCache<T>(key: string): { data: T[]; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function fetchCached<T>(url: string, key: string): Promise<CacheState<T>> {
  const cached = readCache<T>(key)
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return { ...cached, stale: false }
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`DolarAPI ${res.status}`)
    const data: T[] = await res.json()
    const fresh = { data, fetchedAt: Date.now() }
    localStorage.setItem(key, JSON.stringify(fresh))
    return { ...fresh, stale: false }
  } catch {
    // Sin red o API caída: servir el último valor conocido, marcado.
    if (cached) return { ...cached, stale: true }
    throw new Error('No hay conexión con DolarAPI ni datos guardados')
  }
}

export const getCotizaciones = () => fetchCached<Cotizacion>(AR_URL, AR_KEY)
export const getBolivares = () => fetchCached<CotizacionVe>(VE_URL, VE_KEY)

export function porCasa(state: CotizacionesState | null, casa: string) {
  return state?.data.find((c) => c.casa === casa) ?? null
}

export function porFuente(state: BolivaresState | null, fuente: string) {
  return state?.data.find((c) => c.fuente === fuente) ?? null
}

export function valorVe(c: CotizacionVe | null): number | null {
  return c ? (c.promedio ?? c.venta ?? c.compra) : null
}

function useCached<T>(fetcher: () => Promise<CacheState<T>>) {
  const [state, setState] = useState<CacheState<T> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      fetcher()
        .then((s) => {
          if (alive) {
            setState(s)
            setError(null)
          }
        })
        .catch((e: Error) => {
          if (alive) setError(e.message)
        })
    load()
    const id = setInterval(load, TTL_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [fetcher])

  return { state, error }
}

export function useCotizaciones() {
  const { state, error } = useCached(getCotizaciones)
  return { cotizaciones: state, error }
}

export function useBolivares() {
  const { state, error } = useCached(getBolivares)
  return { bolivares: state, error }
}
