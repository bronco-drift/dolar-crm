import { useEffect, useState } from 'react'
import {
  MAX_TASAS,
  TASAS_DISPONIBLES,
  getTasasElegidas,
  porCasa,
  porFuente,
  porMoneda,
  saveTasasElegidas,
  useBolivares,
  useCotizaciones,
  useMonedas,
  valorVe,
} from '../lib/cotizaciones'

const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const bolivares = new Intl.NumberFormat('es-VE', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

function haceCuanto(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'recién actualizado'
  if (min === 1) return 'hace 1 minuto'
  if (min < 60) return `hace ${min} minutos`
  const h = Math.floor(min / 60)
  return h === 1 ? 'hace 1 hora' : `hace ${h} horas`
}

export default function Landing() {
  const { cotizaciones, error } = useCotizaciones()
  const { bolivares: ve } = useBolivares()
  const { monedas } = useMonedas()
  const [tasas, setTasas] = useState<string[]>(getTasasElegidas)
  const [editando, setEditando] = useState(false)
  // Re-render por minuto para que el "hace X minutos" no quede congelado.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const blue = porCasa(cotizaciones, 'blue')
  const oficial = porCasa(cotizaciones, 'oficial')
  const mep = porCasa(cotizaciones, 'bolsa')
  const cripto = porCasa(cotizaciones, 'cripto')

  const valorTasa = (id: string): { nombre: string; valor: string } | null => {
    switch (id) {
      case 've-bcv': {
        const v = valorVe(porFuente(ve, 'oficial'))
        return v != null ? { nombre: '🇻🇪 BCV', valor: `Bs ${bolivares.format(v)}` } : null
      }
      case 've-paralelo': {
        const v = valorVe(porFuente(ve, 'paralelo'))
        return v != null
          ? { nombre: '🇻🇪 Dólar paralelo', valor: `Bs ${bolivares.format(v)}` }
          : null
      }
      case 'ars-eur': {
        const c = porMoneda(monedas, 'EUR')
        return c ? { nombre: '🇦🇷 Euro', valor: pesos.format(c.venta) } : null
      }
      case 'ars-brl': {
        const c = porMoneda(monedas, 'BRL')
        return c ? { nombre: '🇦🇷 Real', valor: pesos.format(c.venta) } : null
      }
      default:
        return null
    }
  }

  const toggleTasa = (id: string) => {
    setTasas((prev) => {
      const next = prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length < MAX_TASAS
          ? [...prev, id]
          : prev
      saveTasasElegidas(next)
      return next
    })
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="wordmark">Dólar hoy</span>
      </header>

      <main className="landing-main">
        {error && !blue && <p className="landing-error">{error}</p>}

        {blue && (
          <section className="blue-hero">
            <h1 className="blue-label">🇦🇷 Dólar blue</h1>
            <p className="blue-venta">{pesos.format(blue.venta)}</p>
            <p className="blue-compra">compra {pesos.format(blue.compra)}</p>
          </section>
        )}

        {cotizaciones && (
          <section className="secundarias">
            {oficial && (
              <div className="cotiz-card">
                <span className="cotiz-nombre">Oficial</span>
                <span className="cotiz-valor">{pesos.format(oficial.venta)}</span>
              </div>
            )}
            {mep && (
              <div className="cotiz-card">
                <span className="cotiz-nombre">MEP</span>
                <span className="cotiz-valor">{pesos.format(mep.venta)}</span>
              </div>
            )}
            {cripto && (
              <div className="cotiz-card">
                <span className="cotiz-nombre">Cripto</span>
                <span className="cotiz-valor">{pesos.format(cripto.venta)}</span>
              </div>
            )}
          </section>
        )}

        <section className="tasas-block">
          <div className="tasas-head">
            <h2 className="tasas-titulo">Otras tasas</h2>
            <button type="button" className="tasas-editar" onClick={() => setEditando((e) => !e)}>
              {editando ? 'Listo' : 'Editar'}
            </button>
          </div>

          {editando && (
            <div className="tasas-picker">
              {TASAS_DISPONIBLES.map((t) => {
                const on = tasas.includes(t.id)
                const bloqueada = !on && tasas.length >= MAX_TASAS
                return (
                  <button
                    type="button"
                    key={t.id}
                    className={`tasa-opcion ${on ? 'is-on' : ''}`}
                    disabled={bloqueada}
                    onClick={() => toggleTasa(t.id)}
                  >
                    <span className="tasa-check" aria-hidden="true">
                      {on ? '✓' : ''}
                    </span>
                    <span className="tasa-textos">
                      <strong>{t.nombre}</strong>
                      <em>{t.descripcion}</em>
                    </span>
                  </button>
                )
              })}
              <p className="tasas-limite">Hasta {MAX_TASAS} tasas.</p>
            </div>
          )}

          {tasas.length > 0 && (
            <div className="secundarias">
              {tasas.map((id) => {
                const t = valorTasa(id)
                return (
                  t && (
                    <div className="cotiz-card" key={id}>
                      <span className="cotiz-nombre">{t.nombre}</span>
                      <span className="cotiz-valor">{t.valor}</span>
                    </div>
                  )
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="landing-footer">
        {blue && <span>{haceCuanto(blue.fechaActualizacion)}</span>}
        {cotizaciones?.stale && <span className="stale-badge">desactualizado</span>}
      </footer>
    </div>
  )
}
