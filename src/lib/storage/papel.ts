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

// Juegos archivados: salen del menú principal y quedan guardados en
// "Juegos archivados". Se guarda solo la lista de archivados, así un
// juego nuevo entra siempre activo sin tener que migrar nada.
const K_ARCHIVADOS = 'dolar-crm:papel-archivados'

export function getArchivados(): string[] {
  try {
    const raw = localStorage.getItem(K_ARCHIVADOS)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    /* ninguno */
  }
  return []
}

export function saveArchivados(ids: string[]) {
  localStorage.setItem(K_ARCHIVADOS, JSON.stringify(ids))
}
