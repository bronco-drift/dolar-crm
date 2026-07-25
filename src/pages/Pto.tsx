import { useEffect, useRef, useState } from 'react'
import CalendarioMes, { type DiaRender } from '../components/CalendarioMes'
import { PAISES_FERIADOS, useFeriados } from '../lib/feriados'
import { type PtoState, getPto, savePto } from '../lib/storage'

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const pad = (n: number) => String(n).padStart(2, '0')

function hoyStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseF(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDias(s: string, n: number): string {
  const d = parseF(s)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function diffDias(a: string, b: string): number {
  return Math.round((parseF(b).getTime() - parseF(a).getTime()) / 86400000)
}

function esFinde(s: string): boolean {
  const dia = parseF(s).getDay()
  return dia === 0 || dia === 6
}

function etiquetaMes(mes: string): string {
  const [y, m] = mes.split('-').map(Number)
  return `${MESES[m - 1]} ${y}`
}

function sumarMes(mes: string, delta: number): string {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

interface Drag {
  modo: 'ini' | 'fin' | 'mover'
  offset: number
  snapIni: string
  snapFin: string
  snapRemotos: string[]
}

export default function Pto() {
  const [estado, setEstado] = useState<PtoState>(getPto)
  const estadoRef = useRef(estado)
  estadoRef.current = estado
  const hoy = hoyStr()
  const [vista, setVista] = useState<'mes' | 'continuo'>('mes')
  const [mesVista, setMesVista] = useState(() => hoy.slice(0, 7))
  const [contIni, setContIni] = useState(0)
  const [contFin, setContFin] = useState(3)
  const [ajustes, setAjustes] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)
  const drag = useRef<Drag | null>(null)
  const longPress = useRef<number | undefined>(undefined)

  const añoBase = Number(mesVista.slice(0, 4))
  const feriados = useFeriados(estado.pais, [
    ...new Set([
      añoBase,
      añoBase + 1,
      Number(estado.viajeInicio.slice(0, 4)),
      Number(estado.viajeFin.slice(0, 4)),
    ]),
  ])

  const guardar = (next: PtoState) => {
    setEstado(next)
    savePto(next)
  }

  const avisar = (m: string) => {
    setToast(m)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2200)
  }

  const esLibre = (f: string) => esFinde(f) || feriados.has(f)
  const enViaje = (f: string) => f >= estado.viajeInicio && f <= estado.viajeFin
  const remotosSet = new Set(estado.remotos)

  const toggleRemoto = (f: string) => {
    if (esLibre(f)) {
      avisar('Día no laborable: no necesita Home-Office')
      return
    }
    const remotos = new Set(estadoRef.current.remotos)
    if (remotos.has(f)) remotos.delete(f)
    else remotos.add(f)
    guardar({ ...estadoRef.current, remotos: [...remotos] })
  }

  // Llevar el viaje entero a otra fecha (misma duración), para no tener
  // que arrastrarlo a través de meses.
  const moverViajeA = (f: string): PtoState => {
    const e = estadoRef.current
    const duracion = diffDias(e.viajeInicio, e.viajeFin)
    let remotos = e.remotos
    if (e.fijarRemotos) {
      const corrimiento = diffDias(e.viajeInicio, f)
      remotos = e.remotos
        .map((r) => {
          if (r >= e.viajeInicio && r <= e.viajeFin) {
            const nr = addDias(r, corrimiento)
            return esFinde(nr) || feriados.has(nr) ? null : nr
          }
          return r
        })
        .filter((x): x is string => x != null)
    }
    const next = { ...e, viajeInicio: f, viajeFin: addDias(f, duracion), remotos }
    guardar(next)
    avisar('Viaje movido — arrastralo para ajustar')
    return next
  }

  // ── Drag: mover el viaje o estirar sus bordes ──
  const empezarDrag = (f: string) => {
    const e = estadoRef.current
    if (f < e.viajeInicio || f > e.viajeFin) return
    drag.current = {
      modo: f === e.viajeInicio ? 'ini' : f === e.viajeFin ? 'fin' : 'mover',
      offset: diffDias(e.viajeInicio, f),
      snapIni: e.viajeInicio,
      snapFin: e.viajeFin,
      snapRemotos: e.remotos,
    }
  }

  const moverDrag = (destino: string) => {
    const d = drag.current
    if (!d) return
    setEstado((prev) => {
      if (d.modo === 'ini') {
        return destino <= prev.viajeFin ? { ...prev, viajeInicio: destino } : prev
      }
      if (d.modo === 'fin') {
        return destino >= prev.viajeInicio ? { ...prev, viajeFin: destino } : prev
      }
      const duracion = diffDias(prev.viajeInicio, prev.viajeFin)
      const ini = addDias(destino, -d.offset)
      const fin = addDias(ini, duracion)
      let remotos = prev.remotos
      if (prev.fijarRemotos) {
        const corrimiento = diffDias(d.snapIni, ini)
        remotos = d.snapRemotos
          .map((f) => {
            if (f >= d.snapIni && f <= d.snapFin) {
              const nf = addDias(f, corrimiento)
              return esFinde(nf) || feriados.has(nf) ? null : nf
            }
            return f
          })
          .filter((x): x is string => x != null)
      }
      return { ...prev, viajeInicio: ini, viajeFin: fin, remotos }
    })
  }

  useEffect(() => {
    const soltar = () => {
      if (drag.current) {
        drag.current = null
        savePto(estadoRef.current)
      }
    }
    window.addEventListener('mouseup', soltar)
    window.addEventListener('touchend', soltar)
    return () => {
      window.removeEventListener('mouseup', soltar)
      window.removeEventListener('touchend', soltar)
    }
  }, [])

  // ── KPIs del viaje ──
  let totales = 0
  let consume = 0
  let libres = 0
  let remotosN = 0
  for (let f = estado.viajeInicio; f <= estado.viajeFin && totales < 1000; f = addDias(f, 1)) {
    totales++
    if (esLibre(f)) libres++
    else if (remotosSet.has(f)) remotosN++
    else consume++
  }
  const restan = estado.ptoDias - consume

  // Mensaje de fuera-de-oficina, siempre en sintonía con el viaje.
  // El regreso es el primer día hábil después del último día del viaje.
  const fmtEn = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const enFecha = (f: string) => fmtEn.format(parseF(f))
  let regreso = addDias(estado.viajeFin, 1)
  for (let i = 0; i < 30 && esLibre(regreso); i++) regreso = addDias(regreso, 1)

  // Días de home-office agrupados en tramos: los findes y feriados que
  // caen en el medio no cortan el tramo (no son días de trabajo).
  const tramosRemotos: [string, string][] = []
  for (const f of [...remotosSet].filter(enViaje).sort()) {
    const ultimo = tramosRemotos[tramosRemotos.length - 1]
    let sigue = false
    if (ultimo) {
      sigue = true
      for (let d = addDias(ultimo[1], 1); d < f; d = addDias(d, 1)) {
        if (!esLibre(d)) sigue = false
      }
    }
    if (sigue && ultimo) ultimo[1] = f
    else tramosRemotos.push([f, f])
  }

  const enTramo = ([a, b]: [string, string]) =>
    a === b ? `on ${enFecha(a)}` : `from ${enFecha(a)} to ${enFecha(b)}`
  const listaTramos = tramosRemotos.map(enTramo)
  const tramosTexto =
    listaTramos.length > 1
      ? `${listaTramos.slice(0, -1).join(', ')} and ${listaTramos[listaTramos.length - 1]}`
      : listaTramos[0]

  const mensajeOoo =
    `Dear sender, I'll be out of office from ${enFecha(estado.viajeInicio)} ` +
    `to ${enFecha(estado.viajeFin)}, and I'll be back on ${enFecha(regreso)}.` +
    (tramosTexto ? ` I'll be working remotely ${tramosTexto}.` : '')

  const copiarOoo = async () => {
    try {
      await navigator.clipboard.writeText(mensajeOoo)
      avisar('Mensaje copiado')
    } catch {
      avisar('No se pudo copiar')
    }
  }

  const renderDia = (f: string): DiaRender => {
    const clases: string[] = []
    if (esFinde(f)) clases.push('cal-finde')
    if (feriados.has(f)) clases.push('cal-feriado')
    if (f === hoy) clases.push('cal-hoy')
    // Días hábiles: 🏢 oficina, 💻 remoto — y el viaje los "borra" (PTO).
    if (!esLibre(f)) {
      if (remotosSet.has(f)) clases.push('cal-remoto')
      else if (!enViaje(f)) clases.push('cal-oficina')
    }
    if (enViaje(f)) {
      clases.push('cal-viaje')
      const esIni = f === estado.viajeInicio
      const esFin = f === estado.viajeFin
      const conBorde = estado.resaltarBordes && (esIni || esFin)
      clases.push(conBorde ? 'cal-viaje-borde' : 'cal-viaje-cuerpo')
      if (esIni && esFin) clases.push('cal-viaje-unico')
      else if (esIni) clases.push('cal-viaje-ini')
      else if (esFin) clases.push('cal-viaje-fin')
      if (esLibre(f)) clases.push('cal-viaje-off')
    }
    return { clases: clases.join(' '), titulo: feriados.has(f) ? 'Feriado' : undefined }
  }

  const reiniciarViaje = () => {
    if (!confirm('¿Reiniciar el viaje? Se borran también los Home-Office.')) return
    guardar({ ...estadoRef.current, viajeInicio: hoy, viajeFin: hoy, remotos: [] })
    avisar('Viaje reiniciado — tocá un día para empezar de nuevo')
  }

  // Mouse: dentro del viaje arrastra; fuera, lo muda ahí y sigue arrastrando.
  const mouseDownDia = (f: string) => {
    const e = estadoRef.current
    if (f >= e.viajeInicio && f <= e.viajeFin) {
      empezarDrag(f)
      return
    }
    const n = moverViajeA(f)
    drag.current = {
      modo: 'mover',
      offset: 0,
      snapIni: n.viajeInicio,
      snapFin: n.viajeFin,
      snapRemotos: n.remotos,
    }
  }

  // Touch: el tap corto fuera del viaje lo muda; la pulsación larga sigue
  // siendo Home-Office, y tocar dentro del viaje arrastra.
  const ultimoTouch = useRef<{ fecha: string; movido: boolean } | null>(null)

  const touchStartDia = (f: string) => {
    ultimoTouch.current = { fecha: f, movido: false }
    clearTimeout(longPress.current)
    longPress.current = window.setTimeout(() => {
      toggleRemoto(f)
      longPress.current = undefined
    }, 450)
    empezarDrag(f)
  }

  const touchEndDia = () => {
    const eraTap = longPress.current !== undefined
    clearTimeout(longPress.current)
    longPress.current = undefined
    const t = ultimoTouch.current
    ultimoTouch.current = null
    if (eraTap && t && !t.movido) {
      const e = estadoRef.current
      if (t.fecha < e.viajeInicio || t.fecha > e.viajeFin) moverViajeA(t.fecha)
    }
  }

  const propsCalendario = {
    inicioSemana: estado.inicioSemana,
    dia: renderDia,
    onDiaDown: mouseDownDia,
    onDiaEnter: moverDrag,
    onDiaContext: toggleRemoto,
    onDiaTouchStart: touchStartDia,
    onDiaTouchMove: (f: string) => {
      if (ultimoTouch.current) ultimoTouch.current.movido = true
      clearTimeout(longPress.current)
      longPress.current = undefined
      moverDrag(f)
    },
    onDiaTouchEnd: touchEndDia,
  }

  return (
    <>
      <header className="crm-header">
        <h1>PTO Planner</h1>
        <button type="button" className="btn btn-ghost" onClick={() => setAjustes(true)}>
          Ajustes
        </button>
      </header>

      <div className="pto-kpi-principal">
        <div className="pto-kpi-fila">
          <div>
            <span className="pto-consume">{consume}</span>
            <span className="pto-unidad"> días de vacaciones</span>
          </div>
          <span className={`pto-restan ${restan < 0 ? 'is-negativo' : ''}`}>
            te quedan {restan} de {estado.ptoDias}
          </span>
        </div>
        <div className="pto-kpi-detalle">
          {totales} totales · {libres} libres · {remotosN} remoto{remotosN === 1 ? '' : 's'} 💻
        </div>
      </div>

      <div className="segmented" role="tablist">
        {(['mes', 'continuo'] as const).map((v) => (
          <button
            type="button"
            role="tab"
            key={v}
            aria-selected={vista === v}
            className={`segment ${vista === v ? 'is-active' : ''}`}
            onClick={() => setVista(v)}
          >
            {v === 'mes' ? 'Mes' : 'Continuo'}
          </button>
        ))}
      </div>

      {vista === 'mes' ? (
        <>
          <div className="mes-nav">
            <button
              type="button"
              className="mes-flecha"
              onClick={() => setMesVista(sumarMes(mesVista, -1))}
            >
              ‹
            </button>
            <span className="mes-label">{etiquetaMes(mesVista)}</span>
            <button
              type="button"
              className="mes-flecha"
              onClick={() => setMesVista(sumarMes(mesVista, 1))}
            >
              ›
            </button>
            <button
              type="button"
              className="pto-reset"
              title="Reiniciar viaje"
              onClick={reiniciarViaje}
            >
              ↺
            </button>
          </div>
          <CalendarioMes
            año={Number(mesVista.slice(0, 4))}
            mes={Number(mesVista.slice(5, 7)) - 1}
            {...propsCalendario}
          />
        </>
      ) : (
        // Scroll interno del calendario: la página queda quieta y el drag
        // del viaje no pelea con el scroll.
        <>
        <div className="pto-reset-fila">
          <button
            type="button"
            className="pto-reset"
            title="Reiniciar viaje"
            onClick={reiniciarViaje}
          >
            ↺
          </button>
        </div>
        <div className="pto-scroll">
          <button
            type="button"
            className="btn btn-ghost pto-cargar"
            onClick={() => setContIni((n) => n - 1)}
          >
            ↑ Cargar mes anterior
          </button>
          {Array.from({ length: contFin - contIni + 1 }, (_, i) =>
            sumarMes(mesVista, contIni + i),
          ).map((m) => (
            <div key={m}>
              <h3 className="pto-mes-titulo">{etiquetaMes(m)}</h3>
              <CalendarioMes
                año={Number(m.slice(0, 4))}
                mes={Number(m.slice(5, 7)) - 1}
                {...propsCalendario}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-ghost pto-cargar"
            onClick={() => setContFin((n) => n + 1)}
          >
            ↓ Cargar mes siguiente
          </button>
        </div>
        </>
      )}

      <section className="ooo-block">
        <div className="ooo-head">
          <h3 className="ooo-titulo">Mensaje de ausencia</h3>
          <button type="button" className="btn btn-ghost ooo-copiar" onClick={copiarOoo}>
            Copiar
          </button>
        </div>
        <p className="ooo-texto" onClick={copiarOoo}>
          {mensajeOoo}
        </p>
      </section>

      <p className="conv-nota">
        Tocá un día para llevar el viaje ahí. Arrastralo para moverlo, tirá de los bordes para
        estirarlo. Mantené presionado (o clic derecho) un día hábil para marcar Home-Office 💻.
      </p>

      <footer className="crm-footer">
        <span>
          Feriados de {PAISES_FERIADOS.find((p) => p.id === estado.pais)?.nombre ?? estado.pais} ·
          guardado en este navegador
        </span>
      </footer>

      {toast && <div className="pto-toast">{toast}</div>}

      {ajustes && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setAjustes(false)}
        >
          <div className="modal">
            <h2>Ajustes</h2>
            <div className="field-row">
              <label>
                Días de vacaciones
                <input
                  type="number"
                  min="0"
                  value={estado.ptoDias || ''}
                  onChange={(e) => guardar({ ...estado, ptoDias: Number(e.target.value) })}
                />
              </label>
              <label>
                Inicio de semana
                <select
                  value={estado.inicioSemana}
                  onChange={(e) =>
                    guardar({ ...estado, inicioSemana: Number(e.target.value) as 0 | 1 })
                  }
                >
                  <option value={1}>Lunes</option>
                  <option value={0}>Domingo</option>
                </select>
              </label>
            </div>
            <label>
              País (feriados)
              <select
                value={estado.pais}
                onChange={(e) => guardar({ ...estado, pais: e.target.value })}
              >
                {PAISES_FERIADOS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="ajuste-check">
              <input
                type="checkbox"
                checked={estado.resaltarBordes}
                onChange={(e) => guardar({ ...estado, resaltarBordes: e.target.checked })}
              />
              Resaltar primer y último día del viaje
            </label>
            <label className="ajuste-check">
              <input
                type="checkbox"
                checked={estado.fijarRemotos}
                onChange={(e) => guardar({ ...estado, fijarRemotos: e.target.checked })}
              />
              Los Home-Office se mueven con el viaje
            </label>
            <button type="button" className="btn btn-primary" onClick={() => setAjustes(false)}>
              Listo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
