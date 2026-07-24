import type { ReactNode } from 'react'

export interface DiaRender {
  clases?: string
  titulo?: string
  extra?: ReactNode
}

// La celda no sabe nada de viajes ni feriados: todo lo decide `dia(fecha)`.
// Así estos calendarios se pueden reusar después para eventos del CRM u
// otras herramientas — alcanza con pasar otro `dia` y otros handlers.
export interface DiaHandlers {
  onDiaDown?: (fecha: string) => void
  onDiaEnter?: (fecha: string) => void
  onDiaContext?: (fecha: string) => void
  onDiaTouchStart?: (fecha: string) => void
  onDiaTouchMove?: (fecha: string) => void
  onDiaTouchEnd?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function nombresDias(inicioSemana: 0 | 1) {
  return inicioSemana === 1
    ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
}

function Celda({
  fecha,
  num,
  render,
  h,
}: {
  fecha: string
  num: number
  render: DiaRender
  h: DiaHandlers
}) {
  return (
    <div
      data-fecha={fecha}
      className={`cal-dia ${render.clases ?? ''}`}
      title={render.titulo}
      onMouseDown={(e) => {
        if (e.button !== 2) h.onDiaDown?.(fecha)
      }}
      onMouseEnter={() => h.onDiaEnter?.(fecha)}
      onContextMenu={(e) => {
        e.preventDefault()
        h.onDiaContext?.(fecha)
      }}
      onTouchStart={() => h.onDiaTouchStart?.(fecha)}
      onTouchEnd={() => h.onDiaTouchEnd?.()}
    >
      {num}
      {render.extra}
    </div>
  )
}

function Grid({ children, h }: { children: ReactNode; h: DiaHandlers }) {
  return (
    <div
      className="cal-grid"
      onTouchMove={(e) => {
        const t = e.touches[0]
        const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null
        const f = el?.dataset.fecha
        if (f) h.onDiaTouchMove?.(f)
      }}
    >
      {children}
    </div>
  )
}

// ── Calendario de un mes ──
export default function CalendarioMes({
  año,
  mes,
  inicioSemana,
  dia,
  ...h
}: {
  año: number
  mes: number // 0-based
  inicioSemana: 0 | 1
  dia: (fecha: string) => DiaRender
} & DiaHandlers) {
  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const vacios = inicioSemana === 1 ? (primerDia === 0 ? 6 : primerDia - 1) : primerDia

  return (
    <Grid h={h}>
      {nombresDias(inicioSemana).map((n) => (
        <div key={n} className="cal-nombre-dia">
          {n}
        </div>
      ))}
      {Array.from({ length: vacios }, (_, i) => (
        <div key={`v${i}`} className="cal-dia cal-vacio" />
      ))}
      {Array.from({ length: diasEnMes }, (_, i) => {
        const f = `${año}-${pad(mes + 1)}-${pad(i + 1)}`
        return <Celda key={f} fecha={f} num={i + 1} render={dia(f)} h={h} />
      })}
    </Grid>
  )
}

// ── Calendario continuo por semanas (desde..hasta, redondeado a semanas
// completas). La ventana la decide el caller — p. ej. el viaje ±1 semana.
export function CalendarioSemanas({
  desde,
  hasta,
  inicioSemana,
  dia,
  ...h
}: {
  desde: string
  hasta: string
  inicioSemana: 0 | 1
  dia: (fecha: string) => DiaRender
} & DiaHandlers) {
  const parse = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const inicio = parse(desde)
  const diaSemana = inicio.getDay()
  inicio.setDate(
    inicio.getDate() - (inicioSemana === 1 ? (diaSemana === 0 ? 6 : diaSemana - 1) : diaSemana),
  )
  const fin = parse(hasta)
  const finSemana = fin.getDay()
  fin.setDate(
    fin.getDate() + (inicioSemana === 1 ? (finSemana === 0 ? 0 : 7 - finSemana) : 6 - finSemana),
  )

  const celdas: ReactNode[] = []
  let i = 0
  for (const d = new Date(inicio); d <= fin && i < 400; d.setDate(d.getDate() + 1), i++) {
    const f = fmt(d)
    const r = dia(f)
    const etiquetaMes = d.getDate() === 1 || i === 0 ? MESES_CORTOS[d.getMonth()] : null
    celdas.push(
      <Celda
        key={f}
        fecha={f}
        num={d.getDate()}
        render={{
          ...r,
          extra: (
            <>
              {r.extra}
              {etiquetaMes && <span className="cal-mes-mini">{etiquetaMes}</span>}
            </>
          ),
        }}
        h={h}
      />,
    )
  }

  return (
    <Grid h={h}>
      {nombresDias(inicioSemana).map((n) => (
        <div key={n} className="cal-nombre-dia">
          {n}
        </div>
      ))}
      {celdas}
    </Grid>
  )
}
