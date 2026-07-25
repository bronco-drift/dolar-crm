import { useEffect, useRef, useState } from 'react'
import { getRecord, saveRecord } from '../lib/storage'

interface Bala {
  x: number
  y: number
  vx: number
  vy: number
}

interface Enemigo {
  x: number
  y: number
  lado: number
  vel: number
  giro: number
  vidas: number
}

interface Chispa {
  x: number
  y: number
  vx: number
  vy: number
  vida: number
}

interface Estado {
  balas: Bala[]
  enemigos: Enemigo[]
  chispas: Chispa[]
  vidas: number
  score: number
  angulo: number
  reloj: number
  proximo: number
  cooldown: number
  terminado: boolean
  flash: number
  flashTexto: string
}

const VEL_BALA = 620
const COOLDOWN = 0.22
const MARGEN_CANON = 54
// Ciclo del easter egg: 30 s normales y 10 s de madness, en loop.
const TRAMO_NORMAL = 30
const TRAMO_MADNESS = 10
const CICLO = TRAMO_NORMAL + TRAMO_MADNESS
const MADNESS_ENEMIGOS = 1.7
const MADNESS_BALAS = 1.5

const esMadness = (reloj: number) => reloj % CICLO >= TRAMO_NORMAL

const cronometro = (reloj: number) => {
  const s = Math.floor(reloj)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function nuevoEstado(): Estado {
  return {
    balas: [],
    enemigos: [],
    chispas: [],
    vidas: 3,
    score: 0,
    angulo: -Math.PI / 2,
    reloj: 0,
    proximo: 0.8,
    cooldown: 0,
    terminado: false,
    flash: 0,
    flashTexto: '',
  }
}

export default function Juego1() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const estadoRef = useRef<Estado>(nuevoEstado())
  // Solo lo que la UI necesita: el marcador vive dentro del canvas.
  const [score, setScore] = useState(0)
  const [terminado, setTerminado] = useState(false)
  const [record, setRecord] = useState(getRecord)
  const [jugando, setJugando] = useState(false)

  const reiniciar = () => {
    estadoRef.current = nuevoEstado()
    setScore(0)
    setTerminado(false)
    setJugando(true)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Colores del tema actual, para que el juego combine en claro y oscuro.
    const css = getComputedStyle(document.documentElement)
    const color = (v: string, fallback: string) => css.getPropertyValue(v).trim() || fallback
    const tinta = color('--ink', '#111')
    const suave = color('--soft', '#f5f5f7')
    const linea = color('--line', '#e8e8e8')
    const tenue = color('--muted', '#6e6e73')
    const acento = '#4cbc93'
    const rojo = '#c0452f'

    let ancho = 0
    let alto = 0
    let eraMadness = false
    const medir = () => {
      const dpr = window.devicePixelRatio || 1
      ancho = canvas.clientWidth
      alto = canvas.clientHeight
      canvas.width = ancho * dpr
      canvas.height = alto * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    medir()
    window.addEventListener('resize', medir)

    const canonX = () => ancho / 2
    const canonY = () => alto - MARGEN_CANON

    const apuntar = (x: number, y: number) => {
      const e = estadoRef.current
      const ang = Math.atan2(y - canonY(), x - canonX())
      // El cañón no apunta hacia abajo.
      e.angulo = Math.max(-Math.PI + 0.25, Math.min(-0.25, ang))
    }

    const disparar = () => {
      const e = estadoRef.current
      if (e.terminado || e.cooldown > 0) return
      e.cooldown = COOLDOWN
      const vel = esMadness(e.reloj) ? VEL_BALA * MADNESS_BALAS : VEL_BALA
      e.balas.push({
        x: canonX() + Math.cos(e.angulo) * 34,
        y: canonY() + Math.sin(e.angulo) * 34,
        vx: Math.cos(e.angulo) * vel,
        vy: Math.sin(e.angulo) * vel,
      })
    }

    const puntero = (ev: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      apuntar(ev.clientX - r.left, ev.clientY - r.top)
    }
    const tocar = (ev: PointerEvent) => {
      ev.preventDefault()
      puntero(ev)
      disparar()
    }
    canvas.addEventListener('pointermove', puntero)
    canvas.addEventListener('pointerdown', tocar)

    const explotar = (x: number, y: number) => {
      const e = estadoRef.current
      for (let i = 0; i < 7; i++) {
        const a = Math.random() * Math.PI * 2
        const v = 60 + Math.random() * 150
        e.chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0.5 })
      }
    }

    const actualizar = (dt: number) => {
      const e = estadoRef.current
      // Sin medidas todavía no hay cancha: evita que los enemigos
      // "crucen" una línea de defensa mal calculada.
      if (e.terminado || alto < 100) return
      e.reloj += dt
      e.cooldown = Math.max(0, e.cooldown - dt)

      // Cada vez que entra o sale del madness, un cartel breve.
      const ahoraMadness = esMadness(e.reloj)
      if (ahoraMadness !== eraMadness) {
        eraMadness = ahoraMadness
        e.flash = 1.4
        e.flashTexto = ahoraMadness ? 'MADNESS' : 'CALMA'
      }
      e.flash = Math.max(0, e.flash - dt)
      const furia = ahoraMadness ? MADNESS_ENEMIGOS : 1

      // Aparición de enemigos: más seguido a medida que avanza la partida.
      e.proximo -= dt
      if (e.proximo <= 0) {
        const nivel = Math.min(6, 1 + e.reloj / 25)
        const lado = 20 + Math.random() * 18
        e.enemigos.push({
          x: lado + Math.random() * (ancho - lado * 2),
          y: -lado,
          lado,
          vel: 26 + nivel * 11 + Math.random() * 14,
          giro: Math.random() * Math.PI,
          vidas: Math.random() < Math.min(0.35, nivel / 14) ? 2 : 1,
        })
        e.proximo = Math.max(0.45, 1.9 - nivel * 0.22)
      }

      for (const b of e.balas) {
        b.x += b.vx * dt
        b.y += b.vy * dt
      }
      e.balas = e.balas.filter((b) => b.y > -20 && b.x > -20 && b.x < ancho + 20)

      for (const c of e.chispas) {
        c.x += c.vx * dt
        c.y += c.vy * dt
        c.vida -= dt
      }
      e.chispas = e.chispas.filter((c) => c.vida > 0)

      for (const en of e.enemigos) {
        en.y += en.vel * furia * dt
        en.giro += dt * 0.7 * furia
      }

      // Impactos
      for (const b of e.balas) {
        for (const en of e.enemigos) {
          if (en.vidas <= 0) continue
          if (Math.abs(b.x - en.x) < en.lado / 2 + 5 && Math.abs(b.y - en.y) < en.lado / 2 + 5) {
            en.vidas--
            b.y = -999
            explotar(b.x, b.y)
            if (en.vidas <= 0) {
              e.score++
              setScore(e.score)
              explotar(en.x, en.y)
            }
          }
        }
      }
      e.balas = e.balas.filter((b) => b.y > -100)
      e.enemigos = e.enemigos.filter((en) => en.vidas > 0)

      // Enemigos que llegan a la línea del cañón
      const linea = canonY() - 10
      const llegaron = e.enemigos.filter((en) => en.y + en.lado / 2 >= linea)
      if (llegaron.length) {
        for (const en of llegaron) explotar(en.x, en.y)
        e.enemigos = e.enemigos.filter((en) => en.y + en.lado / 2 < linea)
        e.vidas -= llegaron.length
        if (e.vidas <= 0) {
          e.terminado = true
          setTerminado(true)
          saveRecord(e.score)
          setRecord(getRecord())
        }
      }
    }

    const dibujar = () => {
      const e = estadoRef.current
      ctx.clearRect(0, 0, ancho, alto)

      // Línea de defensa
      ctx.strokeStyle = linea
      ctx.lineWidth = 1
      ctx.setLineDash([5, 6])
      ctx.beginPath()
      ctx.moveTo(0, canonY() - 10)
      ctx.lineTo(ancho, canonY() - 10)
      ctx.stroke()
      ctx.setLineDash([])

      // Enemigos: cuadrados girados, low poly
      for (const en of e.enemigos) {
        ctx.save()
        ctx.translate(en.x, en.y)
        ctx.rotate(en.giro)
        ctx.fillStyle = en.vidas > 1 ? tinta : suave
        ctx.strokeStyle = tinta
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.rect(-en.lado / 2, -en.lado / 2, en.lado, en.lado)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      // Balas
      ctx.fillStyle = acento
      for (const b of e.balas) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Chispas
      for (const c of e.chispas) {
        ctx.globalAlpha = Math.max(0, c.vida * 2)
        ctx.fillStyle = tenue
        ctx.fillRect(c.x - 2, c.y - 2, 4, 4)
      }
      ctx.globalAlpha = 1

      // Cañón
      const cx = canonX()
      const cy = canonY()
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(e.angulo)
      ctx.fillStyle = tinta
      ctx.fillRect(0, -6, 34, 12)
      ctx.restore()
      ctx.fillStyle = tinta
      ctx.beginPath()
      ctx.moveTo(cx - 20, cy + 16)
      ctx.lineTo(cx + 20, cy + 16)
      ctx.lineTo(cx, cy - 16)
      ctx.closePath()
      ctx.fill()

      // ── Marcador dentro del tablero ──
      const loco = esMadness(e.reloj)
      if (loco) {
        ctx.strokeStyle = rojo
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, ancho - 2, alto - 2)
      }

      ctx.font = '600 13px system-ui, sans-serif'
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
      ctx.fillStyle = loco ? rojo : tenue
      ctx.fillText(cronometro(e.reloj), 12, 12)

      ctx.textAlign = 'right'
      ctx.font = '700 20px system-ui, sans-serif'
      ctx.fillStyle = tinta
      ctx.fillText(String(e.score), ancho - 12, 10)

      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(ancho - 16 - i * 12, 40, 4, 0, Math.PI * 2)
        ctx.fillStyle = i < e.vidas ? tinta : linea
        ctx.fill()
      }

      // Cartel de cambio de modo
      if (e.flash > 0) {
        ctx.globalAlpha = Math.min(1, e.flash * 1.6)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '600 32px Georgia, serif'
        ctx.fillStyle = e.flashTexto === 'MADNESS' ? rojo : tenue
        ctx.fillText(e.flashTexto, ancho / 2, alto / 2)
        ctx.globalAlpha = 1
        ctx.textBaseline = 'top'
      }
    }

    let raf = 0
    let ultimo = performance.now()
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - ultimo) / 1000)
      ultimo = t
      if (jugando) actualizar(dt)
      dibujar()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', medir)
      canvas.removeEventListener('pointermove', puntero)
      canvas.removeEventListener('pointerdown', tocar)
    }
  }, [jugando])

  return (
    <>
      <header className="crm-header">
        <h1>Juego 1</h1>
      </header>

      <div className="juego-wrap">
        <canvas ref={canvasRef} className="juego-canvas" />

        {!jugando && !terminado && (
          <div className="juego-overlay">
            <p className="juego-titulo">Defendé el cañón</p>
            <p className="juego-ayuda">
              Apuntá moviendo el dedo y tocá para disparar. Si un cuadrado cruza la línea, perdés
              una vida.
            </p>
            <button type="button" className="btn btn-primary" onClick={reiniciar}>
              Jugar
            </button>
          </div>
        )}

        {terminado && (
          <div className="juego-overlay">
            <p className="juego-titulo">Fin del juego</p>
            <p className="juego-ayuda">
              Derribaste {score} cuadrado{score === 1 ? '' : 's'}. Récord: {record}.
            </p>
            <button type="button" className="btn btn-primary" onClick={reiniciar}>
              Jugar de nuevo
            </button>
          </div>
        )}
      </div>

      <footer className="crm-footer">
        <span>Récord: {record}</span>
      </footer>
    </>
  )
}
