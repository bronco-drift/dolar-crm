import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { porCasa, useCotizaciones } from '../lib/cotizaciones'

const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
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
  // Re-render por minuto para que el "hace X minutos" no quede congelado.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const blue = porCasa(cotizaciones, 'blue')
  const oficial = porCasa(cotizaciones, 'oficial')
  const mep = porCasa(cotizaciones, 'bolsa')

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="wordmark">Dólar hoy</span>
        <Link to="/crm" className="nav-link">
          CRM →
        </Link>
      </header>

      <main className="landing-main">
        {error && !blue && <p className="landing-error">{error}</p>}

        {blue && (
          <section className="blue-hero">
            <h1 className="blue-label">Blue</h1>
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
          </section>
        )}
      </main>

      <footer className="landing-footer">
        {blue && <span>{haceCuanto(blue.fechaActualizacion)}</span>}
        {cotizaciones?.stale && <span className="stale-badge">desactualizado</span>}
      </footer>
    </div>
  )
}
