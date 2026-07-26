export interface Jugador {
  nombre: string
  puntos: number
}

const K_JUGADORES = 'dolar-crm:papel-jugadores'

export function getJugadores(): Jugador[] {
  try {
    const raw = localStorage.getItem(K_JUGADORES)
    if (raw) return JSON.parse(raw) as Jugador[]
  } catch {
    /* defaults */
  }
  return [
    { nombre: 'Jugador 1', puntos: 0 },
    { nombre: 'Jugador 2', puntos: 0 },
  ]
}

export function saveJugadores(js: Jugador[]) {
  localStorage.setItem(K_JUGADORES, JSON.stringify(js))
}
