import { read, write, upsert } from './core'

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
