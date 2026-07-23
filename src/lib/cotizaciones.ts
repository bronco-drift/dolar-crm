// Única fuente de verdad para cotizaciones. El resto de la app nunca
// llama a DolarAPI directo: el día que exista backend propio, solo
// cambia este archivo.
import { useEffect, useState } from 'react'

export interface Cotizacion {
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export interface CotizacionesState {
  data: Cotizacion[]
  fetchedAt: number
  stale: boolean
}

const API_URL = 'https://dolarapi.com/v1/dolares'
const CACHE_KEY = 'dolar-crm:cotizaciones'
const TTL_MS = 5 * 60 * 1000

function readCache(): { data: Cotizacion[]; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function getCotizaciones(): Promise<CotizacionesState> {
  const cached = readCache()
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return { ...cached, stale: false }
  }
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`DolarAPI ${res.status}`)
    const data: Cotizacion[] = await res.json()
    const fresh = { data, fetchedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
    return { ...fresh, stale: false }
  } catch {
    // Sin red o API caída: servir el último valor conocido, marcado.
    if (cached) return { ...cached, stale: true }
    throw new Error('No hay conexión con DolarAPI ni datos guardados')
  }
}

export function porCasa(state: CotizacionesState | null, casa: string) {
  return state?.data.find((c) => c.casa === casa) ?? null
}

export function useCotizaciones() {
  const [state, setState] = useState<CotizacionesState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      getCotizaciones()
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
  }, [])

  return { cotizaciones: state, error }
}
