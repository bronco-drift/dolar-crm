// Helpers compartidos por todos los dominios de datos.

export function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

export function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Los "contactos" de la versión 1 eran clientes y ventas mezclados:

export function upsert<T extends { id: string }>(key: string, item: T): T[] {
  const items = read<T>(key)
  const i = items.findIndex((x) => x.id === item.id)
  if (i >= 0) items[i] = item
  else items.unshift(item)
  write(key, items)
  return items
}
