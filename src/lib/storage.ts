// Única puerta de acceso a la persistencia de contactos. Hoy es
// localStorage; cuando llegue el backend (Neon + Drizzle), se
// reescribe este archivo y el resto de la app no se entera.

export type Estado = 'nuevo' | 'contactado' | 'propuesta' | 'cerrado' | 'perdido'

export const ESTADOS: Estado[] = ['nuevo', 'contactado', 'propuesta', 'cerrado', 'perdido']

export const ESTADOS_ABIERTOS: Estado[] = ['nuevo', 'contactado', 'propuesta']

export interface Contact {
  id: string
  nombre: string
  empresa?: string
  email?: string
  estado: Estado
  montoUsd?: number
  nota: string
  ultimoContacto: string // ISO date
  createdAt: string // ISO date
}

const KEY = 'dolar-crm:contacts'

export function getContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Contact[]) : []
  } catch {
    return []
  }
}

function persist(contacts: Contact[]) {
  localStorage.setItem(KEY, JSON.stringify(contacts))
}

export function saveContact(contact: Contact): Contact[] {
  const contacts = getContacts()
  const i = contacts.findIndex((c) => c.id === contact.id)
  if (i >= 0) contacts[i] = contact
  else contacts.unshift(contact)
  persist(contacts)
  return contacts
}

export function deleteContact(id: string): Contact[] {
  const contacts = getContacts().filter((c) => c.id !== id)
  persist(contacts)
  return contacts
}

export function newContact(): Contact {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    nombre: '',
    estado: 'nuevo',
    nota: '',
    ultimoContacto: now,
    createdAt: now,
  }
}

export function exportJson(): void {
  const blob = new Blob([JSON.stringify(getContacts(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `contactos-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function diasSinContacto(c: Contact): number {
  const ms = Date.now() - new Date(c.ultimoContacto).getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}
