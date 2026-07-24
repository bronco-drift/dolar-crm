// Feriados por país. Para agregar un país nuevo alcanza con sumar una
// entrada a PROVEEDORES: el resto de la app (selector de país incluido)
// se arma solo a partir de este registro.
import { useEffect, useState } from 'react'

export interface Feriado {
  fecha: string // YYYY-MM-DD
  nombre?: string
}

interface Proveedor {
  nombre: string
  fetchAño: (año: number) => Promise<Feriado[]>
}

const PROVEEDORES: Record<string, Proveedor> = {
  AR: {
    nombre: 'Argentina',
    fetchAño: async (año) => {
      const res = await fetch(`https://api.argentinadatos.com/v1/feriados/${año}`)
      if (!res.ok) throw new Error(`ArgentinaDatos ${res.status}`)
      const data: { fecha: string; nombre?: string }[] = await res.json()
      return data.map((f) => ({ fecha: f.fecha, nombre: f.nombre }))
    },
  },
}

export const PAISES_FERIADOS = Object.entries(PROVEEDORES).map(([id, p]) => ({
  id,
  nombre: p.nombre,
}))

const TTL_MS = 30 * 24 * 60 * 60 * 1000 // los feriados casi no cambian

async function feriadosDeAño(pais: string, año: number): Promise<Feriado[]> {
  const proveedor = PROVEEDORES[pais]
  if (!proveedor) return []
  const key = `dolar-crm:feriados:${pais}:${año}`
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const cached = JSON.parse(raw) as { data: Feriado[]; fetchedAt: number }
      if (Date.now() - cached.fetchedAt < TTL_MS) return cached.data
    }
  } catch {
    /* refetch */
  }
  try {
    const data = await proveedor.fetchAño(año)
    localStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }))
    return data
  } catch {
    // Sin red: servir lo último conocido aunque esté vencido.
    try {
      const raw = localStorage.getItem(key)
      if (raw) return (JSON.parse(raw) as { data: Feriado[] }).data
    } catch {
      /* nada guardado */
    }
    return []
  }
}

// Set de fechas feriadas para los años pedidos.
export function useFeriados(pais: string, años: number[]): Set<string> {
  const [fechas, setFechas] = useState<Set<string>>(new Set())
  const clave = `${pais}:${[...años].sort().join(',')}`

  useEffect(() => {
    let alive = true
    Promise.all(años.map((a) => feriadosDeAño(pais, a))).then((res) => {
      if (alive) setFechas(new Set(res.flat().map((f) => f.fecha)))
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  return fechas
}
