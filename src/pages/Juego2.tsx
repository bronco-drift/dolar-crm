import { useEffect, useRef, useState } from 'react'
import { type Jugador, getJugadores, saveJugadores } from '../lib/storage'

type Vista = 'menu' | 'garabato' | 'memoria' | 'describir' | 'simultaneo'

// Generador con semilla: el mismo número reproduce el mismo dibujo,
// así se puede repetir una figura más adelante y comparar.
function prng(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const nuevaSemilla = () => Math.floor(Math.random() * 9000) + 1000

// ── Cronómetro ──
function Cronometro({ total }: { total: number }) {
  const [quedan, setQuedan] = useState(total)
  const [andando, setAndando] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!andando) return
    timer.current = window.setInterval(() => {
      setQuedan((q) => {
        if (q <= 1) {
          setAndando(false)
          pitido()
          return 0
        }
        return q - 1
      })
    }, 1000)
    return () => clearInterval(timer.current)
  }, [andando])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const poco = quedan <= 15 && quedan > 0

  return (
    <div className="jp-reloj">
      <div className="jp-reloj-fila">
        <span className={`jp-digitos ${poco ? 'is-poco' : ''}`}>{fmt(quedan)}</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (quedan <= 0) setQuedan(total)
            setAndando((a) => !a)
          }}
        >
          {andando ? 'Pausar' : quedan === total || quedan === 0 ? 'Arrancar' : 'Seguir'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setAndando(false)
            setQuedan(total)
          }}
        >
          Reiniciar
        </button>
      </div>
      <div className="jp-barra">
        <i className={poco ? 'is-poco' : ''} style={{ width: `${(quedan / total) * 100}%` }} />
      </div>
    </div>
  )
}

function pitido() {
  try {
    const Ctx = window.AudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    for (const t of [0, 0.28, 0.56]) {
      const osc = ctx.createOscillator()
      const gan = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gan.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      gan.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02)
      gan.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22)
      osc.connect(gan)
      gan.connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.24)
    }
    setTimeout(() => ctx.close(), 1400)
  } catch {
    /* sin audio, sin drama */
  }
}

// ── Marcador de jugadores ──
function Marcador({
  jugadores,
  guardar,
}: {
  jugadores: Jugador[]
  guardar: (js: Jugador[]) => void
}) {
  const cambiar = (i: number, cambio: Partial<Jugador>) =>
    guardar(jugadores.map((j, k) => (k === i ? { ...j, ...cambio } : j)))

  return (
    <section className="jp-jugadores">
      {jugadores.map((j, i) => (
        <div className="jp-jug" key={i}>
          <input
            value={j.nombre}
            aria-label={`Nombre del jugador ${i + 1}`}
            onChange={(e) => cambiar(i, { nombre: e.target.value })}
          />
          <button
            type="button"
            className="jp-mini"
            aria-label="Restar punto"
            onClick={() => cambiar(i, { puntos: Math.max(0, j.puntos - 1) })}
          >
            −
          </button>
          <span className="jp-pts">{j.puntos}</span>
          <button
            type="button"
            className="jp-mini"
            aria-label="Sumar punto"
            onClick={() => cambiar(i, { puntos: j.puntos + 1 })}
          >
            +
          </button>
          {jugadores.length > 2 && (
            <button
              type="button"
              className="jp-quitar"
              aria-label="Quitar jugador"
              onClick={() => guardar(jugadores.filter((_, k) => k !== i))}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <div className="jp-jug-acciones">
        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            guardar([...jugadores, { nombre: `Jugador ${jugadores.length + 1}`, puntos: 0 }])
          }
        >
          + Jugador
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => guardar(jugadores.map((j) => ({ ...j, puntos: 0 })))}
        >
          Poner en cero
        </button>
      </div>
    </section>
  )
}

// ── 01 · Garabato ──
function trazoGarabato(semilla: number, dificultad: number) {
  const r = prng(semilla)
  const W = 640
  const H = 340
  const m = 55
  const cant = [5, 7, 10][dificultad - 1]
  const pts: [number, number][] = []
  for (let i = 0; i < cant; i++) pts.push([m + r() * (W - 2 * m), m + r() * (H - 2 * m)])
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  const t = dificultad === 1 ? 0.14 : dificultad === 2 ? 0.26 : 0.42
  for (let j = 0; j < pts.length - 1; j++) {
    const p0 = pts[j - 1] || pts[j]
    const p1 = pts[j]
    const p2 = pts[j + 1]
    const p3 = pts[j + 2] || pts[j + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return { d, W, H }
}

// ── 03 · Figura para describir ──
function figuraSvg(semilla: number, nFormas: number) {
  const r = prng(semilla)
  const W = 640
  const H = 420
  const m = 55
  const tipos = ['circulo', 'cuadrado', 'triangulo', 'linea', 'arco', 'zigzag', 'cruz', 'estrella']
  const partes: string[] = []
  for (let i = 0; i < nFormas; i++) {
    const tipo = tipos[Math.floor(r() * tipos.length)]
    const cx = m + r() * (W - 2 * m)
    const cy = m + r() * (H - 2 * m)
    const s = 32 + r() * 76
    const rot = Math.floor(r() * 360)
    let g = ''
    if (tipo === 'circulo') g = `<circle cx="0" cy="0" r="${(s / 2).toFixed(1)}"/>`
    else if (tipo === 'cuadrado')
      g = `<rect x="${(-s / 2).toFixed(1)}" y="${(-s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${(s * (0.6 + r() * 0.8)).toFixed(1)}"/>`
    else if (tipo === 'triangulo')
      g = `<path d="M 0 ${(-s / 2).toFixed(1)} L ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)} L ${(-s / 2).toFixed(1)} ${(s / 2).toFixed(1)} Z"/>`
    else if (tipo === 'linea')
      g = `<line x1="${(-s).toFixed(1)}" y1="0" x2="${s.toFixed(1)}" y2="0"/>`
    else if (tipo === 'arco')
      g = `<path d="M ${(-s / 2).toFixed(1)} 0 A ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)} 0 0 1 ${(s / 2).toFixed(1)} 0"/>`
    else if (tipo === 'zigzag') {
      let d = `M ${(-s).toFixed(1)} 0`
      const dx = (2 * s) / 4
      for (let z = 1; z <= 4; z++)
        d += ` L ${(-s + dx * z).toFixed(1)} ${(z % 2 ? -s / 2.4 : s / 2.4).toFixed(1)}`
      g = `<path d="${d}"/>`
    } else if (tipo === 'cruz')
      g = `<line x1="${(-s / 2).toFixed(1)}" y1="0" x2="${(s / 2).toFixed(1)}" y2="0"/><line x1="0" y1="${(-s / 2).toFixed(1)}" x2="0" y2="${(s / 2).toFixed(1)}"/>`
    else {
      let pd = ''
      const R = s / 2
      const rr = R * 0.42
      for (let k = 0; k < 10; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI) / 5
        const rad = k % 2 ? rr : R
        pd += `${k ? ' L ' : 'M '}${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`
      }
      g = `<path d="${pd} Z"/>`
    }
    partes.push(
      `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${rot})" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${g}</g>`,
    )
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figura para describir">${partes.join('')}</svg>`
}

const BANCO: Record<string, string[]> = {
  objetos: [
    'Una bicicleta completa',
    'Un sacacorchos de dos brazos',
    'Una cafetera italiana',
    'Un mate con bombilla',
    'Un teléfono de disco',
    'Un ventilador de techo',
    'Una tijera abierta',
    'Un candado con la llave puesta',
    'Un paraguas abierto',
    'Una guitarra criolla',
    'Una octava de piano con sus teclas negras',
    'Un colectivo de costado',
    'Un avión visto de frente',
    'Una carretilla',
    'Un semáforo con su poste',
    'Un teclado completo con todas sus letras',
    'Un billete con su cara y sus números',
    'Un sacapuntas',
  ],
  marcas: [
    'El logo de Nike',
    'El logo de Adidas',
    'El logo de Starbucks',
    'El logo de Mercado Libre',
    'El logo de Apple',
    'El escudo de Ferrari',
    'El león de Peugeot',
    'El logo de YPF',
    'El logo de Havanna',
    'El logo de Polar',
    'El logo de Windows',
    'El símbolo de Bluetooth',
    'El logo de Michelin',
    'El logo de Volkswagen',
  ],
  mapas: [
    'El mapa de Argentina',
    'El mapa de Venezuela',
    'El mapa de Sudamérica',
    'El mapa de Italia (dicen que es fácil)',
    'El mapa de África',
    'La red de subtes de Buenos Aires',
    'El Obelisco con la 9 de Julio',
    'La Torre Eiffel',
    'El mapa de España',
    'Esta casa vista desde arriba',
    'La bandera de Brasil',
    'La bandera de Uruguay',
  ],
  bichos: [
    'La cara del de al lado, sin mirarlo',
    'Tu propia cara, sin espejo',
    'Un caballo de perfil',
    'Una vaca entera',
    'Un cangrejo',
    'Un pulpo',
    'Una jirafa de cuerpo entero',
    'Un escarabajo desde arriba',
    'Una mano abierta con las uñas',
    'Un pingüino',
    'Un caracol',
    'Una hormiga con sus seis patas',
  ],
}

const NOMBRE_CAT: Record<string, string> = {
  objetos: 'objeto cotidiano',
  marcas: 'marca conocida',
  mapas: 'mapa o lugar',
  bichos: 'ser vivo',
}

// Consignas del modo simultáneo: sujeto + situación, combinables.
// Poco contenido, muchísimas combinaciones y siempre absurdas.
const SUJETOS = [
  'Un pingüino',
  'Un pulpo',
  'Una jirafa',
  'Un cocodrilo',
  'Un astronauta',
  'Una abuela',
  'Un vampiro',
  'Un robot',
  'Un chef',
  'Un dinosaurio',
  'Una sirena',
  'Un fantasma',
  'Un pirata',
  'Un caballo',
  'Un mimo',
  'Un dentista',
  'Una hormiga',
  'Un yeti',
  'Un mago',
  'Un caracol',
]

const SITUACIONES = [
  'tomando mate',
  'andando en monopatín',
  'cortándose el pelo',
  'esperando el colectivo',
  'haciendo yoga',
  'lavando los platos',
  'en una entrevista de trabajo',
  'jugando al tenis',
  'con dolor de muelas',
  'sacándose una selfie',
  'armando un mueble',
  'perdido en el supermercado',
  'bailando tango',
  'pintando una pared',
  'atendiendo el teléfono',
  'en la playa con frío',
  'cocinando un asado',
  'corriendo una maratón',
  'mudándose de casa',
  'aprendiendo a andar en bici',
]

const consignaAlAzar = () =>
  `${SUJETOS[Math.floor(Math.random() * SUJETOS.length)]} ${
    SITUACIONES[Math.floor(Math.random() * SITUACIONES.length)]
  }`

export default function Juego2() {
  const [vista, setVista] = useState<Vista>('menu')
  const [jugadores, setJugadores] = useState<Jugador[]>(getJugadores)
  const guardarJugadores = (js: Jugador[]) => {
    setJugadores(js)
    saveJugadores(js)
  }

  // Modo simultáneo: reparto secreto → todos dibujan → adivinanza
  const [fase, setFase] = useState<'reparto' | 'dibujo' | 'adivinar'>('reparto')
  const [turno, setTurno] = useState(0)
  const [verConsigna, setVerConsigna] = useState(false)
  const [consignas, setConsignas] = useState<string[]>([])
  const [revelado, setRevelado] = useState<number[]>([])

  const nuevaRonda = () => {
    const nuevas: string[] = []
    while (nuevas.length < jugadores.length) {
      const c = consignaAlAzar()
      if (!nuevas.includes(c)) nuevas.push(c)
    }
    setConsignas(nuevas)
    setFase('reparto')
    setTurno(0)
    setVerConsigna(false)
    setRevelado([])
  }

  // Garabato
  const [dif, setDif] = useState(2)
  const [semillaG, setSemillaG] = useState(nuevaSemilla)
  const garabato = trazoGarabato(semillaG, dif)

  // Memoria
  const [cat, setCat] = useState('todas')
  const [ronda, setRonda] = useState(1)
  const [consigna, setConsigna] = useState<{ cat: string; txt: string } | null>(null)
  const usadas = useRef<string[]>([])

  const sacarConsigna = () => {
    const pool =
      cat === 'todas'
        ? Object.entries(BANCO).flatMap(([k, v]) => v.map((txt) => ({ cat: k, txt })))
        : BANCO[cat].map((txt) => ({ cat, txt }))
    let libres = pool.filter((p) => !usadas.current.includes(p.txt))
    if (!libres.length) {
      usadas.current = []
      libres = pool
    }
    const el = libres[Math.floor(Math.random() * libres.length)]
    usadas.current.push(el.txt)
    setConsigna(el)
    setRonda((r) => r + 1)
  }

  // Describir
  const [formas, setFormas] = useState(3)
  const [semillaF, setSemillaF] = useState(nuevaSemilla)
  const [tapada, setTapada] = useState(true)

  const chip = (activo: boolean) => `filtro ${activo ? 'is-active' : ''}`

  if (vista === 'menu') {
    return (
      <>
        <header className="crm-header">
          <h1>Juegos de papel</h1>
        </header>
        <p className="conv-nota jp-bajada">
          Tres juegos para una mesa con hojas y lápices. La pantalla solo reparte consignas y
          controla el tiempo.
        </p>

        <div className="jp-menu">
          <button type="button" className="jp-card" onClick={() => setVista('garabato')}>
            <span className="jp-num">01</span>
            <span className="jp-card-titulo">Garabato</span>
            <span className="jp-card-txt">
              Todos copian el mismo trazo y lo convierten en un dibujo. Gana la idea más
              inesperada.
            </span>
          </button>
          <button type="button" className="jp-card" onClick={() => setVista('memoria')}>
            <span className="jp-num">02</span>
            <span className="jp-card-titulo">De memoria</span>
            <span className="jp-card-txt">
              Dibujar de memoria algo que viste mil veces. Spoiler: nadie sabe dónde va la cadena
              de la bici.
            </span>
          </button>
          <button type="button" className="jp-card" onClick={() => setVista('describir')}>
            <span className="jp-num">03</span>
            <span className="jp-card-titulo">Describí y dibujá</span>
            <span className="jp-card-txt">
              Uno ve una figura y la describe sin nombrarla. El resto dibuja a ciegas.
            </span>
          </button>
          <button
            type="button"
            className="jp-card"
            onClick={() => {
              nuevaRonda()
              setVista('simultaneo')
            }}
          >
            <span className="jp-num">04</span>
            <span className="jp-card-titulo">Todos a la vez</span>
            <span className="jp-card-txt">
              Cada uno recibe su consigna en secreto, dibujan al mismo tiempo y después adivinan
              qué dibujó el otro.
            </span>
          </button>
        </div>

        <Marcador jugadores={jugadores} guardar={guardarJugadores} />
      </>
    )
  }

  return (
    <>
      <header className="crm-header">
        <button type="button" className="btn-ghost jp-volver" onClick={() => setVista('menu')}>
          ← Los tres juegos
        </button>
      </header>

      {vista === 'garabato' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Garabato</h2>
          <p className="jp-sub">Mismo trazo para todos: cada uno lo convierte en otra cosa.</p>

          <div className="jp-etiqueta">Dificultad</div>
          <div className="filtros">
            {[1, 2, 3].map((d) => (
              <button
                type="button"
                key={d}
                className={chip(dif === d)}
                onClick={() => {
                  setDif(d)
                  setSemillaG(nuevaSemilla())
                }}
              >
                {['suave', 'normal', 'caos'][d - 1]}
              </button>
            ))}
          </div>

          <div className="jp-lienzo">
            <svg viewBox={`0 0 ${garabato.W} ${garabato.H}`} role="img" aria-label="Garabato">
              <path
                d={garabato.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="jp-codigo">garabato n.º {semillaG}</div>

          <div className="jp-acciones">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSemillaG(nuevaSemilla())}
            >
              Otro garabato
            </button>
          </div>

          <Cronometro total={180} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'memoria' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">De memoria</h2>
          <p className="jp-sub">Sin mirar nada ni a nadie. Después comparan y se ríen.</p>

          <div className="jp-etiqueta">De dónde sale la consigna</div>
          <div className="filtros">
            {['todas', ...Object.keys(BANCO)].map((c) => (
              <button
                type="button"
                key={c}
                className={chip(cat === c)}
                onClick={() => {
                  setCat(c)
                  usadas.current = []
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="jp-consigna">
            <div className="jp-consigna-cat">
              {consigna ? NOMBRE_CAT[consigna.cat] : 'esperando'}
            </div>
            <div className="jp-consigna-txt">{consigna?.txt ?? 'Sacá una consigna'}</div>
          </div>
          <div className="jp-codigo">ronda {consigna ? ronda - 1 : '—'}</div>

          <div className="jp-acciones">
            <button type="button" className="btn btn-primary" onClick={sacarConsigna}>
              {consigna ? 'Otra consigna' : 'Sacar consigna'}
            </button>
          </div>

          <Cronometro total={120} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'describir' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Describí y dibujá</h2>
          <p className="jp-sub">Solo formas, tamaños y posiciones. Prohibido decir a qué se parece.</p>

          <div className="jp-etiqueta">Cuántas formas</div>
          <div className="filtros">
            {[3, 5, 8].map((n) => (
              <button
                type="button"
                key={n}
                className={chip(formas === n)}
                onClick={() => {
                  setFormas(n)
                  setSemillaF(nuevaSemilla())
                  setTapada(true)
                }}
              >
                {n} · {['suave', 'normal', 'caos'][[3, 5, 8].indexOf(n)]}
              </button>
            ))}
          </div>

          <div className="jp-lienzo">
            <div dangerouslySetInnerHTML={{ __html: figuraSvg(semillaF, formas) }} />
            {tapada && (
              <div className="jp-escudo">
                <strong>Solo mira quien describe</strong>
                <span>Girá la pantalla antes de destapar.</span>
                <button type="button" className="btn btn-primary" onClick={() => setTapada(false)}>
                  Destapar figura
                </button>
              </div>
            )}
          </div>
          <div className="jp-codigo">
            figura F-{semillaF} · {formas} formas
          </div>

          <div className="jp-acciones">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSemillaF(nuevaSemilla())
                setTapada(true)
              }}
            >
              Figura nueva
            </button>
            {!tapada && (
              <button type="button" className="btn btn-ghost" onClick={() => setTapada(true)}>
                Tapar
              </button>
            )}
          </div>

          <Cronometro total={240} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'simultaneo' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Todos a la vez</h2>

          {fase === 'reparto' && (
            <>
              <p className="jp-sub">
                Pasá el teléfono. Cada uno mira su consigna sin que nadie más la vea.
              </p>
              <div className="jp-consigna jp-secreto">
                <div className="jp-consigna-cat">
                  {turno + 1} de {jugadores.length}
                </div>
                {verConsigna ? (
                  <>
                    <div className="jp-consigna-txt">{consignas[turno]}</div>
                    <p className="jp-aviso">Memorizala y pasá el teléfono.</p>
                  </>
                ) : (
                  <div className="jp-consigna-txt">Turno de {jugadores[turno]?.nombre}</div>
                )}
              </div>

              <div className="jp-acciones">
                {verConsigna ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setVerConsigna(false)
                      if (turno + 1 < jugadores.length) setTurno(turno + 1)
                      else setFase('dibujo')
                    }}
                  >
                    {turno + 1 < jugadores.length ? 'Listo, siguiente' : 'Listo, a dibujar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setVerConsigna(true)}
                  >
                    Ver mi consigna
                  </button>
                )}
              </div>
            </>
          )}

          {fase === 'dibujo' && (
            <>
              <p className="jp-sub">
                Todos dibujan al mismo tiempo, cada uno lo suyo. Sin espiar, sin hablar.
              </p>
              <Cronometro total={180} />
              <div className="jp-acciones">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setFase('adivinar')}
                >
                  Terminamos, a adivinar
                </button>
              </div>
            </>
          )}

          {fase === 'adivinar' && (
            <>
              <p className="jp-sub">
                Uno muestra su dibujo, el resto tira. Después revelás y sumás punto al que acertó
                (y al dibujante si alguien le acertó).
              </p>
              <ul className="jp-revelar">
                {jugadores.map((j, i) => (
                  <li key={i} className="jp-revelar-fila">
                    <span className="jp-revelar-nombre">{j.nombre}</span>
                    {revelado.includes(i) ? (
                      <span className="jp-revelar-txt">{consignas[i]}</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setRevelado([...revelado, i])}
                      >
                        Revelar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="jp-acciones">
                <button type="button" className="btn btn-primary" onClick={nuevaRonda}>
                  Ronda nueva
                </button>
              </div>
            </>
          )}

          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}
    </>
  )
}
