// Catálogo de emojis para los juegos. En vez de una lista escrita a mano,
// se recorren los bloques Unicode y se filtra lo que el dispositivo puede
// dibujar: en un iPhone quedan todos los que Apple soporta, en Windows los
// que tenga Windows. Sin banderas ni tonos de piel: no se pueden dibujar.
const RANGOS: [number, number][] = [
  [0x1f300, 0x1f321], // clima y paisajes
  [0x1f324, 0x1f393], // más clima, celebraciones, objetos
  [0x1f396, 0x1f3f0], // deportes, edificios
  [0x1f3f4, 0x1f4fd], // varios, oficina, tecnología
  [0x1f4ff, 0x1f53d], // símbolos y herramientas
  [0x1f549, 0x1f5ff], // religión, mapas, escritorio
  [0x1f600, 0x1f64f], // caras y gestos
  [0x1f680, 0x1f6d2], // transporte
  [0x1f6d5, 0x1f6ec], // más transporte
  [0x1f900, 0x1f9ff], // suplemento: gente, animales, comida, objetos
  [0x1fa70, 0x1faf8], // extendido A: ropa, instrumentos, animales nuevos
  [0x2600, 0x26ff], // misceláneos (sol, paraguas, ajedrez…)
  [0x2700, 0x27bf], // dingbats (tijera, lápiz, estrellas…)
]

let cache: string[] | null = null

export function emojisDisponibles(): string[] {
  if (cache) return cache
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  const tam = 32
  ctx.font = `${tam}px sans-serif`
  // Ancho del carácter "no existe" (tofu): sirve de referencia negativa.
  const anchoTofu = ctx.measureText('\u{10FFFF}').width

  const lista: string[] = []
  for (const [desde, hasta] of RANGOS) {
    for (let cp = desde; cp <= hasta; cp++) {
      const ch = String.fromCodePoint(cp)
      const ancho = ctx.measureText(ch).width
      // Los emojis reales se dibujan cuadrados; los huecos, como tofu.
      if (ancho > tam * 0.7 && Math.abs(ancho - anchoTofu) > 0.5) lista.push(ch)
    }
  }
  cache = lista
  return lista
}
