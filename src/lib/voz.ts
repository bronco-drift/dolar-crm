// Lectura en voz alta de las consignas. Usa la voz del sistema: en el
// iPhone suena la de iOS en español, sin librerías ni pedidos a ningún lado.
const K_VOZ = 'dolar-crm:papel-voz'

let vozOn = localStorage.getItem(K_VOZ) === 'on'
let elegida: SpeechSynthesisVoice | null = null

export const vozDisponible = () => typeof window !== 'undefined' && 'speechSynthesis' in window
export const vozActiva = () => vozOn

export function alternarVoz() {
  vozOn = !vozOn
  localStorage.setItem(K_VOZ, vozOn ? 'on' : 'off')
  if (!vozOn) window.speechSynthesis?.cancel()
  return vozOn
}

// La lista de voces llega asincrónica en algunos navegadores.
function mejorVoz(): SpeechSynthesisVoice | null {
  if (elegida) return elegida
  const voces = window.speechSynthesis.getVoices()
  if (!voces.length) return null
  elegida =
    voces.find((v) => v.lang === 'es-AR') ??
    voces.find((v) => v.lang.startsWith('es-4') || v.lang === 'es-419') ??
    voces.find((v) => v.lang.startsWith('es')) ??
    null
  return elegida
}

export function hablar(texto: string) {
  if (!vozOn || !vozDisponible()) return
  const s = window.speechSynthesis
  s.cancel() // que no se encolen consignas viejas
  const u = new SpeechSynthesisUtterance(texto)
  const v = mejorVoz()
  if (v) u.voice = v
  u.lang = v?.lang ?? 'es-AR'
  u.rate = 0.95
  u.pitch = 1
  s.speak(u)
}

// iOS necesita un primer disparo dentro de un gesto para habilitar el audio.
export function despertarVoz() {
  if (!vozDisponible()) return
  mejorVoz()
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  window.speechSynthesis.speak(u)
}
