import { write } from './core'

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
