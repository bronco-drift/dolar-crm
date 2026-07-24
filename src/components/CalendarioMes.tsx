import type { ReactNode } from 'react'

export interface DiaRender {
  clases?: string
  titulo?: string
  extra?: ReactNode
}

interface Props {
  año: number
  mes: number // 0-based
  inicioSemana: 0 | 1
  // La celda no sabe nada de viajes ni feriados: todo lo decide `dia(fecha)`.
  // Así este calendario se puede reusar después para eventos del CRM u
  // otras herramientas — alcanza con pasar otro `dia` y otros handlers.
  dia: (fecha: string) => DiaRender
  onDiaDown?: (fecha: string) => void
  onDiaEnter?: (fecha: string) => void
  onDiaContext?: (fecha: string) => void
  onDiaTouchStart?: (fecha: string) => void
  onDiaTouchMove?: (fecha: string) => void
  onDiaTouchEnd?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function CalendarioMes({
  año,
  mes,
  inicioSemana,
  dia,
  onDiaDown,
  onDiaEnter,
  onDiaContext,
  onDiaTouchStart,
  onDiaTouchMove,
  onDiaTouchEnd,
}: Props) {
  const nombres =
    inicioSemana === 1
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const vacios = inicioSemana === 1 ? (primerDia === 0 ? 6 : primerDia - 1) : primerDia
  const fechaDe = (d: number) => `${año}-${pad(mes + 1)}-${pad(d)}`

  return (
    <div
      className="cal-grid"
      onTouchMove={(e) => {
        const t = e.touches[0]
        const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null
        const f = el?.dataset.fecha
        if (f) onDiaTouchMove?.(f)
      }}
    >
      {nombres.map((n) => (
        <div key={n} className="cal-nombre-dia">
          {n}
        </div>
      ))}
      {Array.from({ length: vacios }, (_, i) => (
        <div key={`v${i}`} className="cal-dia cal-vacio" />
      ))}
      {Array.from({ length: diasEnMes }, (_, i) => {
        const f = fechaDe(i + 1)
        const r = dia(f)
        return (
          <div
            key={f}
            data-fecha={f}
            className={`cal-dia ${r.clases ?? ''}`}
            title={r.titulo}
            onMouseDown={(e) => {
              if (e.button !== 2) onDiaDown?.(f)
            }}
            onMouseEnter={() => onDiaEnter?.(f)}
            onContextMenu={(e) => {
              e.preventDefault()
              onDiaContext?.(f)
            }}
            onTouchStart={() => onDiaTouchStart?.(f)}
            onTouchEnd={() => onDiaTouchEnd?.()}
          >
            {i + 1}
            {r.extra}
          </div>
        )
      })}
    </div>
  )
}
