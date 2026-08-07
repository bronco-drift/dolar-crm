import { read, write } from './core'

// Catálogo de servicios con precios de referencia. Los precios cambian
// seguido: son un punto de partida, cada uno se puede editar y el valor
// editado es el que manda.
export type CatSub = 'video' | 'musica' | 'gaming' | 'ia' | 'nube' | 'internet' | 'otros'

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
  { id: 'internet', nombre: 'Internet' },
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
    planes: [
      { id: 'mensual', nombre: 'Mensual', precio: 7954, moneda: 'ars' },
      { id: 'anual', nombre: 'Anual (por mes)', precio: 6600, moneda: 'ars' },
    ],
  },
  {
    id: 'appletv',
    nombre: 'Apple TV+',
    cat: 'video',
    planes: [
      { id: 'mensual', nombre: 'Mensual', precio: 9000, moneda: 'ars' },
      { id: 'anual', nombre: 'Anual (por mes)', precio: 7500, moneda: 'ars' },
    ],
  },
  {
    id: 'paramount',
    nombre: 'Paramount+',
    cat: 'video',
    planes: [
      { id: 'esencial', nombre: 'Esencial', precio: 6000, moneda: 'ars' },
      { id: 'premium', nombre: 'Premium', precio: 8500, moneda: 'ars' },
    ],
  },
  {
    id: 'crunchyroll',
    nombre: 'Crunchyroll',
    cat: 'video',
    planes: [
      { id: 'fan', nombre: 'Fan', precio: 4500, moneda: 'ars' },
      { id: 'megafan', nombre: 'Mega Fan', precio: 5500, moneda: 'ars' },
      { id: 'ultimate', nombre: 'Ultimate Fan', precio: 7500, moneda: 'ars' },
    ],
  },
  {
    id: 'mubi',
    nombre: 'Mubi',
    cat: 'video',
    planes: [
      { id: 'mensual', nombre: 'Mensual', precio: 7000, moneda: 'ars' },
      { id: 'anual', nombre: 'Anual (por mes)', precio: 5000, moneda: 'ars' },
    ],
  },
  {
    id: 'flow',
    nombre: 'Flow',
    cat: 'internet',
    planes: [
      { id: 'flex', nombre: 'Flex', precio: 9000, moneda: 'ars' },
      { id: 'full', nombre: 'Full', precio: 16000, moneda: 'ars' },
      { id: 'futbol', nombre: 'Full + Fútbol', precio: 26000, moneda: 'ars' },
    ],
  },
  {
    id: 'spotify',
    nombre: 'Spotify',
    cat: 'musica',
    planes: [
      { id: 'estudiante', nombre: 'Estudiante', precio: 1799, moneda: 'ars' },
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
      { id: 'estudiante', nombre: 'Estudiante', precio: 4000, moneda: 'ars' },
      { id: 'individual', nombre: 'Individual', precio: 7000, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 12000, moneda: 'ars' },
    ],
  },
  {
    id: 'applemusic',
    nombre: 'Apple Music',
    cat: 'musica',
    planes: [
      { id: 'estudiante', nombre: 'Estudiante', precio: 2500, moneda: 'ars' },
      { id: 'individual', nombre: 'Individual', precio: 5000, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 7500, moneda: 'ars' },
    ],
  },
  {
    id: 'deezer',
    nombre: 'Deezer',
    cat: 'musica',
    planes: [
      { id: 'individual', nombre: 'Individual', precio: 3500, moneda: 'ars' },
      { id: 'familiar', nombre: 'Familiar', precio: 5800, moneda: 'ars' },
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
      { id: 'expansion', nombre: 'Individual + Expansión', precio: 8000, moneda: 'ars' },
    ],
  },
  {
    id: 'ubisoft',
    nombre: 'Ubisoft+',
    cat: 'gaming',
    planes: [
      { id: 'classics', nombre: 'Classics', precio: 8, moneda: 'usd' },
      { id: 'premium', nombre: 'Premium', precio: 18, moneda: 'usd' },
    ],
  },
  {
    id: 'geforce',
    nombre: 'GeForce Now',
    cat: 'gaming',
    planes: [
      { id: 'performance', nombre: 'Performance', precio: 10, moneda: 'usd' },
      { id: 'ultimate', nombre: 'Ultimate', precio: 20, moneda: 'usd' },
    ],
  },
  {
    id: 'arcade',
    nombre: 'Apple Arcade',
    cat: 'gaming',
    planes: [{ id: 'mensual', nombre: 'Mensual', precio: 4500, moneda: 'ars' }],
  },
  {
    id: 'chatgpt',
    nombre: 'ChatGPT',
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
      { id: 'max5', nombre: 'Max 5x', precio: 100, moneda: 'usd' },
      { id: 'max20', nombre: 'Max 20x', precio: 200, moneda: 'usd' },
    ],
  },
  {
    id: 'gemini',
    nombre: 'Google AI',
    cat: 'ia',
    planes: [
      { id: 'pro', nombre: 'AI Pro', precio: 20, moneda: 'usd' },
      { id: 'ultra', nombre: 'AI Ultra', precio: 250, moneda: 'usd' },
    ],
  },
  {
    id: 'cursor',
    nombre: 'Cursor',
    cat: 'ia',
    planes: [
      { id: 'pro', nombre: 'Pro', precio: 20, moneda: 'usd' },
      { id: 'ultra', nombre: 'Ultra', precio: 200, moneda: 'usd' },
    ],
  },
  {
    id: 'copilot',
    nombre: 'GitHub Copilot',
    cat: 'ia',
    planes: [
      { id: 'pro', nombre: 'Pro', precio: 10, moneda: 'usd' },
      { id: 'proplus', nombre: 'Pro+', precio: 39, moneda: 'usd' },
    ],
  },
  {
    id: 'perplexity',
    nombre: 'Perplexity',
    cat: 'ia',
    planes: [
      { id: 'pro', nombre: 'Pro', precio: 20, moneda: 'usd' },
      { id: 'max', nombre: 'Max', precio: 200, moneda: 'usd' },
    ],
  },
  {
    id: 'icloud',
    nombre: 'iCloud+',
    cat: 'nube',
    planes: [
      { id: '50', nombre: '50 GB', precio: 1500, moneda: 'ars' },
      { id: '200', nombre: '200 GB', precio: 4500, moneda: 'ars' },
      { id: '2tb', nombre: '2 TB', precio: 15000, moneda: 'ars' },
      { id: '6tb', nombre: '6 TB', precio: 45000, moneda: 'ars' },
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
      { id: '5tb', nombre: '5 TB', precio: 32000, moneda: 'ars' },
    ],
  },
  {
    id: 'dropbox',
    nombre: 'Dropbox',
    cat: 'nube',
    planes: [
      { id: 'plus', nombre: 'Plus 2 TB', precio: 12, moneda: 'usd' },
      { id: 'essentials', nombre: 'Essentials 3 TB', precio: 18, moneda: 'usd' },
      { id: 'family', nombre: 'Family 2 TB', precio: 20, moneda: 'usd' },
    ],
  },
  {
    id: 'onedrive',
    nombre: 'OneDrive',
    cat: 'nube',
    planes: [
      { id: '100', nombre: '100 GB', precio: 2500, moneda: 'ars' },
      { id: '1tb', nombre: '1 TB (con 365)', precio: 6000, moneda: 'ars' },
    ],
  },
  {
    id: 'personalfibra',
    nombre: 'Personal Fibra',
    cat: 'internet',
    planes: [
      { id: '100', nombre: '100 Mb', precio: 32000, moneda: 'ars' },
      { id: '300', nombre: '300 Mb', precio: 40000, moneda: 'ars' },
      { id: '500', nombre: '500 Mb', precio: 47000, moneda: 'ars' },
      { id: '300flow', nombre: '300 Mb + Flow', precio: 55000, moneda: 'ars' },
    ],
  },
  {
    id: 'telecentro',
    nombre: 'Telecentro',
    cat: 'internet',
    planes: [
      { id: '200', nombre: '200 Mb', precio: 34000, moneda: 'ars' },
      { id: '500', nombre: '500 Mb', precio: 44000, moneda: 'ars' },
      { id: '500cable', nombre: '500 Mb + Cable', precio: 58000, moneda: 'ars' },
    ],
  },
  {
    id: 'movistarfibra',
    nombre: 'Movistar Fibra',
    cat: 'internet',
    planes: [
      { id: '100', nombre: '100 Mb', precio: 31000, moneda: 'ars' },
      { id: '300', nombre: '300 Mb', precio: 39000, moneda: 'ars' },
      { id: '500', nombre: '500 Mb', precio: 46000, moneda: 'ars' },
    ],
  },
  {
    id: 'clarohogar',
    nombre: 'Claro Hogar',
    cat: 'internet',
    planes: [
      { id: '300', nombre: 'Internet 300 Mb', precio: 36000, moneda: 'ars' },
      { id: 'cable', nombre: 'Internet + Cable', precio: 52000, moneda: 'ars' },
    ],
  },
  {
    id: 'starlink',
    nombre: 'Starlink',
    cat: 'internet',
    planes: [
      { id: 'residencial', nombre: 'Residencial', precio: 55000, moneda: 'ars' },
      { id: 'roam', nombre: 'Roam', precio: 75000, moneda: 'ars' },
    ],
  },
  {
    id: 'personalmovil',
    nombre: 'Personal (móvil)',
    cat: 'internet',
    planes: [
      { id: '8', nombre: '8 GB', precio: 14000, moneda: 'ars' },
      { id: '20', nombre: '20 GB', precio: 19000, moneda: 'ars' },
      { id: '40', nombre: '40 GB', precio: 25000, moneda: 'ars' },
    ],
  },
  {
    id: 'claromovil',
    nombre: 'Claro (móvil)',
    cat: 'internet',
    planes: [
      { id: '10', nombre: '10 GB', precio: 15000, moneda: 'ars' },
      { id: '25', nombre: '25 GB', precio: 20000, moneda: 'ars' },
      { id: '50', nombre: '50 GB', precio: 27000, moneda: 'ars' },
    ],
  },
  {
    id: 'movistarmovil',
    nombre: 'Movistar (móvil)',
    cat: 'internet',
    planes: [
      { id: '10', nombre: '10 GB', precio: 14500, moneda: 'ars' },
      { id: '25', nombre: '25 GB', precio: 19500, moneda: 'ars' },
      { id: '45', nombre: '45 GB', precio: 26000, moneda: 'ars' },
    ],
  },
  {
    id: 'tuenti',
    nombre: 'Tuenti',
    cat: 'internet',
    planes: [
      { id: '6', nombre: '6 GB', precio: 9000, moneda: 'ars' },
      { id: '15', nombre: '15 GB', precio: 13000, moneda: 'ars' },
      { id: '30', nombre: '30 GB', precio: 18000, moneda: 'ars' },
    ],
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
    planes: [
      { id: 'pro', nombre: 'Pro', precio: 8000, moneda: 'ars' },
      { id: 'equipos', nombre: 'Equipos', precio: 15000, moneda: 'ars' },
    ],
  },
  {
    id: 'adobe',
    nombre: 'Adobe',
    cat: 'otros',
    planes: [
      { id: 'foto', nombre: 'Fotografía', precio: 12, moneda: 'usd' },
      { id: 'unaapp', nombre: 'Una app', precio: 23, moneda: 'usd' },
      { id: 'todo', nombre: 'Todas las apps', precio: 60, moneda: 'usd' },
    ],
  },
  {
    id: 'notion',
    nombre: 'Notion',
    cat: 'otros',
    planes: [
      { id: 'plus', nombre: 'Plus', precio: 10, moneda: 'usd' },
      { id: 'business', nombre: 'Business', precio: 20, moneda: 'usd' },
    ],
  },
  {
    id: 'linkedin',
    nombre: 'LinkedIn Premium',
    cat: 'otros',
    planes: [
      { id: 'carrera', nombre: 'Carrera', precio: 30, moneda: 'usd' },
      { id: 'business', nombre: 'Business', precio: 60, moneda: 'usd' },
    ],
  },
  {
    id: 'duolingo',
    nombre: 'Duolingo',
    cat: 'otros',
    planes: [
      { id: 'super', nombre: 'Super', precio: 6000, moneda: 'ars' },
      { id: 'max', nombre: 'Max', precio: 12000, moneda: 'ars' },
    ],
  },
  {
    id: 'strava',
    nombre: 'Strava',
    cat: 'otros',
    planes: [{ id: 'premium', nombre: 'Premium', precio: 12, moneda: 'usd' }],
  },
]

// ── Suscripciones activas del usuario ──
export interface Sub {
  id: string
  servicioId: string // 'custom' para las propias
  nombre: string
  plan: string
  planId?: string // qué plan del catálogo está activo
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

// Moneda en la que se muestra TODO: los precios nativos se guardan como
// son, pero la pantalla se lee siempre en una sola moneda.
const K_MONEDA = 'dolar-crm:subs-moneda'

export function getMonedaVista(): 'ars' | 'usd' {
  return localStorage.getItem(K_MONEDA) === 'usd' ? 'usd' : 'ars'
}

export function saveMonedaVista(m: 'ars' | 'usd') {
  localStorage.setItem(K_MONEDA, m)
}

export function servicioPorId(id: string) {
  return SERVICIOS.find((s) => s.id === id)
}
