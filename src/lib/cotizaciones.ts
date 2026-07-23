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

interface RawCache<D> {
  data: D
  fetchedAt: number
  stale: boolean
}

type CacheState<T> = RawCache<T[]>

export type CotizacionesState = CacheState<Cotizacion>
export type BolivaresState = CacheState<CotizacionVe>

export interface CotizacionMoneda {
  moneda: string
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
}

export type MonedasState = CacheState<CotizacionMoneda>

// USDT real (Binance P2P y otros) vía CriptoYa: objeto exchange → precios
export interface UsdtExchange {
  ask: number
  totalAsk: number
  bid: number
  totalBid: number
  time: number
}

export type UsdtData = Record<string, UsdtExchange>
export type UsdtState = RawCache<UsdtData>

const TTL_MS = 5 * 60 * 1000
const AR_URL = 'https://dolarapi.com/v1/dolares'
const VE_URL = 'https://ve.dolarapi.com/v1/dolares'
const MON_URL = 'https://dolarapi.com/v1/cotizaciones'
const USDT_ARS_URL = 'https://criptoya.com/api/usdt/ars/1'
const USDT_VES_URL = 'https://criptoya.com/api/usdt/ves/1'
const AR_KEY = 'dolar-crm:cotizaciones'
const VE_KEY = 'dolar-crm:bolivares'
const MON_KEY = 'dolar-crm:monedas'
const USDT_ARS_KEY = 'dolar-crm:usdt-ars'
const USDT_VES_KEY = 'dolar-crm:usdt-ves'

function readCache<D>(key: string): { data: D; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function fetchCached<D>(url: string, key: string): Promise<RawCache<D>> {
  const cached = readCache<D>(key)
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return { ...cached, stale: false }
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data: D = await res.json()
    const fresh = { data, fetchedAt: Date.now() }
    localStorage.setItem(key, JSON.stringify(fresh))
    return { ...fresh, stale: false }
  } catch {
    // Sin red o API caída: servir el último valor conocido, marcado.
    if (cached) return { ...cached, stale: true }
    throw new Error('No hay conexión con la API ni datos guardados')
  }
}

export const getCotizaciones = () => fetchCached<Cotizacion[]>(AR_URL, AR_KEY)
export const getBolivares = () => fetchCached<CotizacionVe[]>(VE_URL, VE_KEY)
export const getMonedas = () => fetchCached<CotizacionMoneda[]>(MON_URL, MON_KEY)
export const getUsdtArs = () => fetchCached<UsdtData>(USDT_ARS_URL, USDT_ARS_KEY)
export const getUsdtVes = () => fetchCached<UsdtData>(USDT_VES_URL, USDT_VES_KEY)

// Precio de referencia USDT: Binance P2P si está, si no la mediana de asks.
export function valorUsdt(state: UsdtState | null): number | null {
  if (!state) return null
  const preferido = state.data.binancep2p ?? state.data.bybitp2p ?? state.data.okexp2p
  if (preferido && preferido.ask > 0) return preferido.ask
  const asks = Object.values(state.data)
    .map((e) => e?.ask)
    .filter((n): n is number => typeof n === 'number' && n > 0)
    .sort((a, b) => a - b)
  return asks.length ? asks[Math.floor(asks.length / 2)] : null
}

export function porCasa(state: CotizacionesState | null, casa: string) {
  return state?.data.find((c) => c.casa === casa) ?? null
}

export function porFuente(state: BolivaresState | null, fuente: string) {
  return state?.data.find((c) => c.fuente === fuente) ?? null
}

export function valorVe(c: CotizacionVe | null): number | null {
  return c ? (c.promedio ?? c.venta ?? c.compra) : null
}

export function porMoneda(state: MonedasState | null, moneda: string) {
  return state?.data.find((c) => c.moneda === moneda) ?? null
}

// ── Tasas secundarias elegibles de la landing ──
// La principal (ARS/USD blue) es fija; estas se eligen, hasta MAX_TASAS.
export interface TasaDef {
  id: string
  nombre: string
  descripcion: string
}

export const TASAS_DISPONIBLES: TasaDef[] = [
  { id: 've-paralelo', nombre: '🇻🇪 Dólar paralelo', descripcion: 'bolívares por dólar, paralelo' },
  { id: 've-bcv', nombre: '🇻🇪 BCV', descripcion: 'bolívares por dólar, oficial' },
  { id: 'ars-eur', nombre: '🇦🇷 Euro', descripcion: 'pesos argentinos por euro' },
  { id: 'ars-brl', nombre: '🇦🇷 Real', descripcion: 'pesos argentinos por real' },
  { id: 've-usdt', nombre: '🇻🇪 USDT', descripcion: 'bolívares por USDT, Binance P2P' },
]

export const MAX_TASAS = 4

const TASAS_KEY = 'dolar-crm:tasas-landing'
const TASAS_DEFAULT = ['ve-paralelo', 'ars-eur']

export function getTasasElegidas(): string[] {
  try {
    const raw = localStorage.getItem(TASAS_KEY)
    if (raw) return (JSON.parse(raw) as string[]).slice(0, MAX_TASAS)
  } catch {
    /* usar default */
  }
  return TASAS_DEFAULT
}

export function saveTasasElegidas(ids: string[]) {
  localStorage.setItem(TASAS_KEY, JSON.stringify(ids.slice(0, MAX_TASAS)))
}

function useCached<S>(fetcher: () => Promise<S>) {
  const [state, setState] = useState<S | null>(null)
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

export function useMonedas() {
  const { state, error } = useCached(getMonedas)
  return { monedas: state, error }
}

export function useUsdtArs() {
  const { state } = useCached(getUsdtArs)
  return { usdtArs: state }
}

export function useUsdtVes() {
  const { state } = useCached(getUsdtVes)
  return { usdtVes: state }
}
