import { read, write } from './core'

// Catálogo de servicios con precios de referencia. Los precios cambian
// seguido: son un punto de partida, cada uno se puede editar y el valor
// editado es el que manda.
export type CatSub = 'video' | 'musica' | 'gaming' | 'ia' | 'nube' | 'otros'

export interface PlanSub {
  id: string
  nombre: string
  precio: number
  moneda: 'ars' | 'usd'
}

export interface Servicio {
  id: string
  nombre: string
  cat: CatSub
  planes: PlanSub[]
}

export const CATEGORIAS: { id: CatSub; nombre: string }[] = [
  { id: 'video', nombre: 'Video' },
  { id: 'musica', nombre: 'Música' },
  { id: 'gaming', nombre: 'Gaming' },
  { id: 'ia', nombre: 'IA' },
  { id: 'nube', nombre: 'Nube' },
  { id: 'otros', nombre: 'Otros' },
]

// Precios de referencia para Argentina, agosto 2026 (con impuestos).
export const SERVICIOS: Servicio[] = [
  {
    id: 'netflix',
    nombre: 'Netflix',
    cat: 'video',
    planes: [
      { id: 'anuncios', nombre: 'Con anuncios', precio: 7250, moneda: 'ars' },
      { id: 'estandar', nombre: 'Estándar', precio: 10750, moneda: 'ars' },
      { id: 'premium', nombre: 'Premium 4K', precio: 15500, moneda: 'ars' },
    ],
  },
  {
    id: 'disney',
    nombre: 'Disney+',
    cat: 'video',
    planes: [
      { id: 'anuncios', nombre: 'Con anuncios', precio: 15000, moneda: 'ars' },
      { id: 'estandar', nombre: 'Estándar', precio: 19500, moneda: 'ars' },
      { id: 'premium', nombre: 'Premium 4K', precio: 30000, moneda: 'ars' },
    ],
  },
  {
    id: 'hbo',
    nombre: 'HBO Max',
    cat: 'video',
    planes: [
      { id: 'basico', nombre: 'Básico con anuncios', precio: 7390, moneda: 'ars' },
      { id: 'estandar', nombre: 'Estándar', precio: 9590, moneda: 'ars' },
      { id: 'platino', nombre: 'Platino 4K', precio: 11900, moneda: 'ars' },
    ],
  },
  {
    id: 'prime',
    nombre: 'Prime Video',
    cat: 'video',
    planes: [{ id: 'unico', nombre: 'Mensual', precio: 7954, moneda: 'ars' }],
  },
  {
    id: 'appletv',
    nombre: 'Apple TV+',
    cat: 'video',
    planes: [{ id: 'unico', nombre: 'Mensual', precio: 9000, moneda: 'ars' }],
  },
  {
    id: 'paramount',
    nombre: 'Paramount+',
    cat: 'video',
    planes: [{ id: 'unico', nombre: 'Mensual', precio: 6000, moneda: 'ars' }],
  },
  {
    id: 'crunchyroll',
    nombre: 'Crunchyroll',
    cat: 'video',
    planes: [{ id: 'fan', nombre: 'Mega Fan', precio: 5500, moneda: 'ars' }],
  },
  {
    id: 'spotify',
    nombre: 'Spotify',
    cat: 'musica',
    planes: [
      { id: 'individual', nombre: 'Individual', precio: 3299, moneda: 'ars' },
      { id: 'duo', nombre: 'Dúo', precio: 4399, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 5499, moneda: 'ars' },
    ],
  },
  {
    id: 'ytpremium',
    nombre: 'YouTube Premium',
    cat: 'musica',
    planes: [
      { id: 'individual', nombre: 'Individual', precio: 7000, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 12000, moneda: 'ars' },
    ],
  },
  {
    id: 'applemusic',
    nombre: 'Apple Music',
    cat: 'musica',
    planes: [
      { id: 'individual', nombre: 'Individual', precio: 5000, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 7500, moneda: 'ars' },
    ],
  },
  {
    id: 'gamepass',
    nombre: 'Xbox Game Pass',
    cat: 'gaming',
    planes: [
      { id: 'essential', nombre: 'Essential', precio: 8999, moneda: 'ars' },
      { id: 'premium', nombre: 'Premium', precio: 11999, moneda: 'ars' },
      { id: 'pc', nombre: 'PC Game Pass', precio: 13999, moneda: 'ars' },
      { id: 'ultimate', nombre: 'Ultimate', precio: 18999, moneda: 'ars' },
    ],
  },
  {
    id: 'psplus',
    nombre: 'PlayStation Plus',
    cat: 'gaming',
    planes: [
      { id: 'essential', nombre: 'Essential', precio: 9000, moneda: 'ars' },
      { id: 'extra', nombre: 'Extra', precio: 15000, moneda: 'ars' },
      { id: 'deluxe', nombre: 'Deluxe', precio: 17000, moneda: 'ars' },
    ],
  },
  {
    id: 'eaplay',
    nombre: 'EA Play',
    cat: 'gaming',
    planes: [
      { id: 'basico', nombre: 'EA Play', precio: 4000, moneda: 'ars' },
      { id: 'pro', nombre: 'EA Play Pro', precio: 12000, moneda: 'ars' },
    ],
  },
  {
    id: 'nintendo',
    nombre: 'Nintendo Switch Online',
    cat: 'gaming',
    planes: [
      { id: 'individual', nombre: 'Individual', precio: 3500, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 6000, moneda: 'ars' },
    ],
  },
  {
    id: 'ubisoft',
    nombre: 'Ubisoft+',
    cat: 'gaming',
    planes: [{ id: 'premium', nombre: 'Premium', precio: 18, moneda: 'usd' }],
  },
  {
    id: 'chatgpt',
    nombre: 'ChatGPT Plus',
    cat: 'ia',
    planes: [
      { id: 'plus', nombre: 'Plus', precio: 20, moneda: 'usd' },
      { id: 'pro', nombre: 'Pro', precio: 200, moneda: 'usd' },
    ],
  },
  {
    id: 'claude',
    nombre: 'Claude',
    cat: 'ia',
    planes: [
      { id: 'pro', nombre: 'Pro', precio: 20, moneda: 'usd' },
      { id: 'max', nombre: 'Max', precio: 100, moneda: 'usd' },
    ],
  },
  {
    id: 'gemini',
    nombre: 'Google AI',
    cat: 'ia',
    planes: [{ id: 'pro', nombre: 'AI Pro', precio: 20, moneda: 'usd' }],
  },
  {
    id: 'cursor',
    nombre: 'Cursor',
    cat: 'ia',
    planes: [{ id: 'pro', nombre: 'Pro', precio: 20, moneda: 'usd' }],
  },
  {
    id: 'icloud',
    nombre: 'iCloud+',
    cat: 'nube',
    planes: [
      { id: '50', nombre: '50 GB', precio: 1500, moneda: 'ars' },
      { id: '200', nombre: '200 GB', precio: 4500, moneda: 'ars' },
      { id: '2tb', nombre: '2 TB', precio: 15000, moneda: 'ars' },
    ],
  },
  {
    id: 'googleone',
    nombre: 'Google One',
    cat: 'nube',
    planes: [
      { id: '100', nombre: '100 GB', precio: 3000, moneda: 'ars' },
      { id: '200', nombre: '200 GB', precio: 4500, moneda: 'ars' },
      { id: '2tb', nombre: '2 TB', precio: 14000, moneda: 'ars' },
    ],
  },
  {
    id: 'dropbox',
    nombre: 'Dropbox',
    cat: 'nube',
    planes: [{ id: 'plus', nombre: 'Plus 2 TB', precio: 12, moneda: 'usd' }],
  },
  {
    id: 'microsoft365',
    nombre: 'Microsoft 365',
    cat: 'otros',
    planes: [
      { id: 'personal', nombre: 'Personal', precio: 6000, moneda: 'ars' },
      { id: 'familia', nombre: 'Familia', precio: 8500, moneda: 'ars' },
    ],
  },
  {
    id: 'canva',
    nombre: 'Canva',
    cat: 'otros',
    planes: [{ id: 'pro', nombre: 'Pro', precio: 8000, moneda: 'ars' }],
  },
  {
    id: 'adobe',
    nombre: 'Adobe Creative Cloud',
    cat: 'otros',
    planes: [
      { id: 'foto', nombre: 'Fotografía', precio: 12, moneda: 'usd' },
      { id: 'todo', nombre: 'Todas las apps', precio: 60, moneda: 'usd' },
    ],
  },
  {
    id: 'notion',
    nombre: 'Notion',
    cat: 'otros',
    planes: [{ id: 'plus', nombre: 'Plus', precio: 10, moneda: 'usd' }],
  },
]

// ── Suscripciones activas del usuario ──
export interface Sub {
  id: string
  servicioId: string // 'custom' para las propias
  nombre: string
  plan: string
  precio: number
  moneda: 'ars' | 'usd'
  dia?: number // día del mes en que se cobra
  pausada?: boolean
}

const K_SUBS = 'dolar-crm:subs'

export function getSubs(): Sub[] {
  return read<Sub>(K_SUBS)
}

export function saveSubs(subs: Sub[]) {
  write(K_SUBS, subs)
}

export function servicioPorId(id: string) {
  return SERVICIOS.find((s) => s.id === id)
}
