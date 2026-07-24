import { useEffect, useRef, useState } from 'react'
import CalendarioMes, { CalendarioSemanas, type DiaRender } from '../components/CalendarioMes'
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

  const renderDia = (f: string): DiaRender => {
    const clases: string[] = []
    if (esFinde(f)) clases.push('cal-finde')
    if (feriados.has(f)) clases.push('cal-feriado')
    if (f === hoy) clases.push('cal-hoy')
    if (remotosSet.has(f)) clases.push('cal-remoto')
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

  const touchStartDia = (f: string) => {
    clearTimeout(longPress.current)
    longPress.current = window.setTimeout(() => {
      toggleRemoto(f)
      longPress.current = undefined
    }, 450)
    empezarDrag(f)
  }

  const propsCalendario = {
    inicioSemana: estado.inicioSemana,
    dia: renderDia,
    onDiaDown: empezarDrag,
    onDiaEnter: moverDrag,
    onDiaContext: toggleRemoto,
    onDiaTouchStart: touchStartDia,
    onDiaTouchMove: (f: string) => {
      clearTimeout(longPress.current)
      moverDrag(f)
    },
    onDiaTouchEnd: () => clearTimeout(longPress.current),
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
        <div>
          <span className="pto-consume">{consume}</span>
          <span className="pto-unidad"> días de vacaciones</span>
        </div>
        <span className={`pto-restan ${restan < 0 ? 'is-negativo' : ''}`}>
          te quedan {restan} de {estado.ptoDias}
        </span>
      </div>

      <div className="pto-minis">
        <div className="pto-mini">
          <strong>{totales}</strong>
          <span>totales</span>
        </div>
        <div className="pto-mini">
          <strong>{libres}</strong>
          <span>libres</span>
        </div>
        <div className="pto-mini">
          <strong>{remotosN}</strong>
          <span>remotos 💻</span>
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
          </div>
          <CalendarioMes
            año={Number(mesVista.slice(0, 4))}
            mes={Number(mesVista.slice(5, 7)) - 1}
            {...propsCalendario}
          />
        </>
      ) : (
        // La ventana sigue al viaje: una semana antes y una después.
        // Al arrastrar el viaje hacia un borde, la ventana se extiende sola.
        <CalendarioSemanas
          desde={addDias(estado.viajeInicio, -7)}
          hasta={addDias(estado.viajeFin, 7)}
          {...propsCalendario}
        />
      )}

      <p className="conv-nota">
        Arrastrá el viaje para moverlo, tirá de los bordes para estirarlo. Mantené presionado (o
        clic derecho) un día hábil para marcar Home-Office 💻.
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
