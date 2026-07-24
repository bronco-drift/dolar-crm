import { useState } from 'react'
import CalendarioMes, { CalendarioSemanas, type DiaRender } from '../components/CalendarioMes'
import { type Habito, type TipoHabito, deleteHabito, getHabitos, saveHabito } from '../lib/storage'

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

function etiquetaMes(mes: string): string {
  const [y, m] = mes.split('-').map(Number)
  return `${MESES[m - 1]} ${y}`
}

function sumarMes(mes: string, delta: number): string {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

function fechaCorta(f: string): string {
  const [, m, d] = f.split('-').map(Number)
  return `${d} de ${MESES[m - 1]}`
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

function lunesDe(f: string): string {
  const d = parseF(f)
  const dia = d.getDay()
  return addDias(f, -(dia === 0 ? 6 : dia - 1))
}

export default function Habitos() {
  const [habitos, setHabitos] = useState<Habito[]>(getHabitos)
  const hoy = hoyStr()
  const [vista, setVista] = useState<'mes' | 'semana'>('mes')
  const [mesVista, setMesVista] = useState(() => hoy.slice(0, 7))
  const [semana, setSemana] = useState(() => lunesDe(hoy))
  const [diaSel, setDiaSel] = useState(hoy)
  const [texto, setTexto] = useState('')

  const porDia = new Map<string, { bien: number; mal: number }>()
  for (const h of habitos) {
    const conteo = porDia.get(h.fecha) ?? { bien: 0, mal: 0 }
    conteo[h.tipo]++
    porDia.set(h.fecha, conteo)
  }

  const registrar = (tipo: TipoHabito) => {
    const habito: Habito = {
      id: crypto.randomUUID(),
      fecha: diaSel,
      tipo,
      texto: texto.trim(),
      createdAt: new Date().toISOString(),
    }
    setHabitos(saveHabito(habito))
    setTexto('')
  }

  const renderDia = (f: string): DiaRender => {
    const clases: string[] = []
    const conteo = porDia.get(f)
    if (conteo) {
      clases.push(
        conteo.bien && conteo.mal ? 'cal-hab-mixto' : conteo.bien ? 'cal-hab-bien' : 'cal-hab-mal',
      )
    }
    if (f === hoy) clases.push('cal-hoy')
    if (f === diaSel) clases.push('cal-sel')
    return { clases: clases.join(' ') }
  }

  const delDia = habitos
    .filter((h) => h.fecha === diaSel)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <header className="crm-header">
        <h1>Hábitos</h1>
      </header>

      <div className="hab-registro">
        <span className="hab-dia-label">{diaSel === hoy ? 'Hoy' : fechaCorta(diaSel)}</span>
        <input
          className="search"
          placeholder="¿Qué hiciste? (opcional)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="hab-botones">
          <button type="button" className="hab-btn hab-btn-bien" onClick={() => registrar('bien')}>
            ✓ Bien
          </button>
          <button type="button" className="hab-btn hab-btn-mal" onClick={() => registrar('mal')}>
            ✕ Mal
          </button>
        </div>
      </div>

      <div className="segmented" role="tablist">
        {(['mes', 'semana'] as const).map((v) => (
          <button
            type="button"
            role="tab"
            key={v}
            aria-selected={vista === v}
            className={`segment ${vista === v ? 'is-active' : ''}`}
            onClick={() => setVista(v)}
          >
            {v === 'mes' ? 'Mes' : 'Semana'}
          </button>
        ))}
      </div>

      <div className="mes-nav">
        <button
          type="button"
          className="mes-flecha"
          onClick={() =>
            vista === 'mes'
              ? setMesVista(sumarMes(mesVista, -1))
              : setSemana(addDias(semana, -7))
          }
        >
          ‹
        </button>
        <span className="mes-label">
          {vista === 'mes'
            ? etiquetaMes(mesVista)
            : `${fechaCorta(semana)} – ${fechaCorta(addDias(semana, 6))}`}
        </span>
        <button
          type="button"
          className="mes-flecha"
          onClick={() =>
            vista === 'mes' ? setMesVista(sumarMes(mesVista, 1)) : setSemana(addDias(semana, 7))
          }
        >
          ›
        </button>
      </div>

      {vista === 'mes' ? (
        <CalendarioMes
          año={Number(mesVista.slice(0, 4))}
          mes={Number(mesVista.slice(5, 7)) - 1}
          inicioSemana={1}
          dia={renderDia}
          onDiaDown={setDiaSel}
        />
      ) : (
        <CalendarioSemanas
          desde={semana}
          hasta={addDias(semana, 6)}
          inicioSemana={1}
          dia={renderDia}
          onDiaDown={setDiaSel}
        />
      )}

      {delDia.length > 0 && (
        <ul className="hab-lista">
          {delDia.map((h) => (
            <li key={h.id} className="hab-item">
              <span className={`dot hab-dot-${h.tipo}`} />
              <span className="hab-texto">
                {h.texto || (h.tipo === 'bien' ? 'Día bien' : 'Día mal')}
              </span>
              <button
                type="button"
                className="hab-borrar"
                title="Borrar registro"
                onClick={() => setHabitos(deleteHabito(h.id))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="crm-footer">
        <span>
          {habitos.length} registro{habitos.length === 1 ? '' : 's'} · guardado en este navegador
        </span>
      </footer>
    </>
  )
}
