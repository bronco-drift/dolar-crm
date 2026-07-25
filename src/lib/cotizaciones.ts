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
const USDT_EUR_URL = 'https://criptoya.com/api/usdt/eur/1'
const AR_KEY = 'dolar-crm:cotizaciones'
const VE_KEY = 'dolar-crm:bolivares'
const MON_KEY = 'dolar-crm:monedas'
const USDT_ARS_KEY = 'dolar-crm:usdt-ars'
const USDT_VES_KEY = 'dolar-crm:usdt-ves'
const USDT_EUR_KEY = 'dolar-crm:usdt-eur'

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
export const getUsdtEur = () => fetchCached<UsdtData>(USDT_EUR_URL, USDT_EUR_KEY)

// USDT contra cualquier fiat de CriptoYa. Los fetchers se memoizan por
// moneda para que los hooks tengan identidad estable.
const fetchersUsdt: Record<string, () => Promise<RawCache<UsdtData>>> = {}

export function getUsdtFiat(fiat: string) {
  fetchersUsdt[fiat] ??= () =>
    fetchCached<UsdtData>(`https://criptoya.com/api/usdt/${fiat}/1`, `dolar-crm:usdt-${fiat}`)
  return fetchersUsdt[fiat]
}

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

// El euro (AR y VE) ahora tiene fila fija en la landing, por eso no está acá.
export const TASAS_DISPONIBLES: TasaDef[] = [
  { id: 've-paralelo', nombre: '🇻🇪 Dólar paralelo', descripcion: 'bolívares por dólar, paralelo' },
  { id: 've-bcv', nombre: '🇻🇪 BCV', descripcion: 'bolívares por dólar, oficial' },
  { id: 'ars-brl', nombre: '🇦🇷 Real', descripcion: 'pesos argentinos por real' },
  { id: 've-usdt', nombre: '🇻🇪 USDT', descripcion: 'bolívares por USDT, Binance P2P' },
]

export const MAX_TASAS = 4

const TASAS_KEY = 'dolar-crm:tasas-landing'
const TASAS_DEFAULT = ['ve-paralelo', 'ars-eur']

export function getTasasElegidas(): string[] {
  try {
    const raw = localStorage.getItem(TASAS_KEY)
    if (raw) {
      // 'ars-eur' migró a la fila fija de euros
      return (JSON.parse(raw) as string[]).filter((t) => t !== 'ars-eur').slice(0, MAX_TASAS)
    }
  } catch {
    /* usar default */
  }
  return TASAS_DEFAULT
}

export function saveTasasElegidas(ids: string[]) {
  localStorage.setItem(TASAS_KEY, JSON.stringify(ids.slice(0, MAX_TASAS)))
}

// Orden de las filas de la pizarra, definido por el usuario.
const ORDEN_KEY = 'dolar-crm:pizarra-orden'

export function getOrdenPizarra(): string[] {
  try {
    const raw = localStorage.getItem(ORDEN_KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* sin orden guardado */
  }
  return []
}

export function saveOrdenPizarra(ids: string[]) {
  localStorage.setItem(ORDEN_KEY, JSON.stringify(ids))
}

// Tasa principal (el número grande de la landing), elegible por el usuario.
const PRINCIPAL_KEY = 'dolar-crm:principal'

export function getPrincipal(): string {
  return localStorage.getItem(PRINCIPAL_KEY) ?? 'blue'
}

export function savePrincipal(id: string) {
  localStorage.setItem(PRINCIPAL_KEY, id)
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

export function useUsdtEur() {
  const { state } = useCached(getUsdtEur)
  return { usdtEur: state }
}

export function useUsdtFiat(fiat: string) {
  const { state } = useCached(getUsdtFiat(fiat))
  return { usdtFiat: state }
}

// ── Envíos: países LATAM de destino ──
export interface PaisEnvio {
  id: string
  nombre: string
  bandera: string
  prefijo: string // símbolo de la moneda local
  fiat: string | null // código CriptoYa; null = el país usa USD
}

export const PAISES_ENVIO: PaisEnvio[] = [
  { id: 'ar', nombre: 'Argentina', bandera: '🇦🇷', prefijo: '$', fiat: 'ars' },
  { id: 've', nombre: 'Venezuela', bandera: '🇻🇪', prefijo: 'Bs', fiat: 'ves' },
  { id: 'co', nombre: 'Colombia', bandera: '🇨🇴', prefijo: 'COP', fiat: 'cop' },
  { id: 'br', nombre: 'Brasil', bandera: '🇧🇷', prefijo: 'R$', fiat: 'brl' },
  { id: 'cl', nombre: 'Chile', bandera: '🇨🇱', prefijo: 'CLP', fiat: 'clp' },
  { id: 'pe', nombre: 'Perú', bandera: '🇵🇪', prefijo: 'S/', fiat: 'pen' },
  { id: 'mx', nombre: 'México', bandera: '🇲🇽', prefijo: 'MX$', fiat: 'mxn' },
  { id: 'uy', nombre: 'Uruguay', bandera: '🇺🇾', prefijo: '$U', fiat: 'uyu' },
  { id: 'bo', nombre: 'Bolivia', bandera: '🇧🇴', prefijo: 'Bs.', fiat: 'bob' },
  { id: 'py', nombre: 'Paraguay', bandera: '🇵🇾', prefijo: '₲', fiat: 'pyg' },
  { id: 'ec', nombre: 'Ecuador', bandera: '🇪🇨', prefijo: 'US$', fiat: null },
  { id: 'pa', nombre: 'Panamá', bandera: '🇵🇦', prefijo: 'US$', fiat: null },
  { id: 'us', nombre: 'Estados Unidos', bandera: '🇺🇸', prefijo: 'US$', fiat: null },
  { id: 'es', nombre: 'España', bandera: '🇪🇸', prefijo: '€', fiat: 'eur' },
]

// País del usuario: define qué cotizaciones son relevantes para él.
const PAIS_USUARIO_KEY = 'dolar-crm:pais-usuario'

export function getPaisUsuario(): string {
  const guardado = localStorage.getItem(PAIS_USUARIO_KEY)
  if (guardado) return guardado
  const detectado = paisNavegador()
  return PAISES_ENVIO.some((p) => p.id === detectado) ? (detectado as string) : 'ar'
}

export function savePaisUsuario(id: string) {
  localStorage.setItem(PAIS_USUARIO_KEY, id)
}

const ENVIO_PAIS_KEY = 'dolar-crm:envio-pais'

// País del navegador (p. ej. 'es-AR' → 'ar'). Base para defaults
// inteligentes: destino de envío hoy, origen y "cambio relevante" después.
export function paisNavegador(): string | null {
  const region = navigator.language?.split('-')[1]
  return region ? region.toLowerCase() : null
}

export function getPaisEnvio(): string {
  return localStorage.getItem(ENVIO_PAIS_KEY) ?? 've'
}

export function savePaisEnvio(id: string) {
  localStorage.setItem(ENVIO_PAIS_KEY, id)
}
