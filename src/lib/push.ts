// Suscripción a notificaciones push. En iOS solo funciona con la PWA
// instalada en la pantalla de inicio (Compartir → Agregar a inicio).
const VAPID_PUBLIC =
  'BNHTUbVmO4Gt7OJZCUcFZXiU6BbEJsIoZ5_lOd_5BaEwdwKkD7_nlB4Fvdww0Rf7CINpbhTfJAGgPp9wbqQhGhY'

export function pushSoportado(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function esStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS marca la PWA instalada con esta propiedad no estándar
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function claveDesdeBase64(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const crudo = atob(b64)
  const salida = new Uint8Array(crudo.length)
  for (let i = 0; i < crudo.length; i++) salida[i] = crudo.charCodeAt(i)
  return salida
}

// Devuelve la suscripción en JSON, lista para pegar en Vercel.
export async function activarRecordatorio(): Promise<string> {
  if (!pushSoportado()) throw new Error('Este navegador no soporta notificaciones push.')
  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') throw new Error('No diste permiso para notificaciones.')

  const reg = await navigator.serviceWorker.ready
  const existente = await reg.pushManager.getSubscription()
  const sub =
    existente ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: claveDesdeBase64(VAPID_PUBLIC) as BufferSource,
    }))
  return JSON.stringify(sub)
}
