// El tema vive en el documento (no en una vista): así el fondo del body
// pinta también la zona de la status bar del iPhone y no queda franja
// blanca, y todas las pantallas comparten el modo.

const KEY = 'dolar-crm:tema'

export function temaInicial(): boolean {
  const guardado = localStorage.getItem(KEY)
  if (guardado) return guardado === 'oscuro'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function aplicarTema(oscuro: boolean, persistir = true) {
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', oscuro ? '#000000' : '#ffffff')
  if (persistir) localStorage.setItem(KEY, oscuro ? 'oscuro' : 'claro')
}
