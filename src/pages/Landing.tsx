import { useEffect, useState } from 'react'
import {
  MAX_TASAS,
  TASAS_DISPONIBLES,
  getPrincipal,
  getTasasElegidas,
  porCasa,
  porFuente,
  porMoneda,
  savePrincipal,
  saveTasasElegidas,
  useBolivares,
  useCotizaciones,
  useMonedas,
  useUsdtArs,
  useUsdtVes,
  valorUsdt,
  valorVe,
} from '../lib/cotizaciones'

const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const num2 = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function haceCuanto(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'recién actualizado'
  if (min === 1) return 'hace 1 minuto'
  if (min < 60) return `hace ${min} minutos`
  const h = Math.floor(min / 60)
  return h === 1 ? 'hace 1 hora' : `hace ${h} horas`
}

type MonedaConv = 'ars' | 'usd' | 'usdt' | 'eur' | 'ves'

const MONEDAS_CONV: { id: MonedaConv; nombre: string; corto: string }[] = [
  { id: 'ars', nombre: '🇦🇷 Peso argentino', corto: 'ARS' },
  { id: 'usd', nombre: '🇺🇸 Dólar (blue)', corto: 'USD' },
  { id: 'usdt', nombre: '₮ USDT', corto: 'USDT' },
  { id: 'eur', nombre: '🇪🇺 Euro', corto: 'EUR' },
  { id: 'ves', nombre: '🇻🇪 Bolívar', corto: 'Bs' },
]

// Los cuatro dólares argentinos de la fila principal.
const DOLARES_AR = ['blue', 'oficial', 'mep', 'usdt'] as const

interface RateInfo {
  corto: string
  largo: string
  valor: string | null
  compra?: string | null
}

export default function Landing() {
  const { cotizaciones, error } = useCotizaciones()
  const { bolivares: ve } = useBolivares()
  const { monedas } = useMonedas()
  const { usdtArs } = useUsdtArs()
  const { usdtVes } = useUsdtVes()
  const [tasas, setTasas] = useState<string[]>(getTasasElegidas)
  const [principal, setPrincipal] = useState<string>(getPrincipal)
  const [editando, setEditando] = useState(false)
  const [convirtiendo, setConvirtiendo] = useState(false)
  const [mostrandoInfo, setMostrandoInfo] = useState(false)
  const [monto, setMonto] = useState('100')
  const [moneda, setMoneda] = useState<MonedaConv>('usd')
  const [destino, setDestino] = useState<MonedaConv>('ars')
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
  const eurArs = porMoneda(monedas, 'EUR')
  const paralelo = valorVe(porFuente(ve, 'paralelo'))
  const usdtEnPesos = valorUsdt(usdtArs) ?? cripto?.venta ?? null
  const usdtEnBs = valorUsdt(usdtVes)

  const rateInfo = (id: string): RateInfo | null => {
    switch (id) {
      case 'blue':
        return blue
          ? {
              corto: 'Blue',
              largo: '🇦🇷 Dólar blue',
              valor: pesos.format(blue.venta),
              compra: pesos.format(blue.compra),
            }
          : null
      case 'oficial':
        return oficial
          ? {
              corto: 'Oficial',
              largo: '🇦🇷 Dólar oficial',
              valor: pesos.format(oficial.venta),
              compra: pesos.format(oficial.compra),
            }
          : null
      case 'mep':
        return mep
          ? {
              corto: 'MEP',
              largo: '🇦🇷 Dólar MEP',
              valor: pesos.format(mep.venta),
              compra: pesos.format(mep.compra),
            }
          : null
      case 'usdt':
        return usdtEnPesos != null
          ? { corto: 'USDT', largo: '🇦🇷 USDT', valor: pesos.format(usdtEnPesos) }
          : null
      case 've-bcv': {
        const v = valorVe(porFuente(ve, 'oficial'))
        return v != null
          ? { corto: '🇻🇪 BCV', largo: '🇻🇪 BCV', valor: `Bs ${num2.format(v)}` }
          : null
      }
      case 've-paralelo':
        return paralelo != null
          ? {
              corto: '🇻🇪 Dólar paralelo',
              largo: '🇻🇪 Dólar paralelo',
              valor: `Bs ${num2.format(paralelo)}`,
            }
          : null
      case 've-usdt':
        return usdtEnBs != null
          ? { corto: '🇻🇪 USDT', largo: '🇻🇪 USDT', valor: `Bs ${num2.format(usdtEnBs)}` }
          : null
      case 'ars-eur':
        return eurArs
          ? { corto: '🇦🇷 Euro', largo: '🇦🇷 Euro', valor: pesos.format(eurArs.venta) }
          : null
      case 'ars-brl': {
        const c = porMoneda(monedas, 'BRL')
        return c ? { corto: '🇦🇷 Real', largo: '🇦🇷 Real', valor: pesos.format(c.venta) } : null
      }
      default:
        return null
    }
  }

  const elegirPrincipal = (id: string) => {
    setPrincipal(id)
    savePrincipal(id)
  }

  // Si la elegida todavía no tiene datos, el hero cae al blue.
  const heroId = rateInfo(principal)?.valor != null ? principal : 'blue'
  const hero = rateInfo(heroId)

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

  // Conversor: todo pivotea por USD. usdPor[x] = cuántos USD vale 1 unidad de x.
  const usdPor: Partial<Record<MonedaConv, number>> = { usd: 1 }
  if (blue) {
    usdPor.ars = 1 / blue.venta
    if (eurArs) usdPor.eur = eurArs.venta / blue.venta
    if (usdtEnPesos != null) usdPor.usdt = usdtEnPesos / blue.venta
  }
  if (paralelo != null) usdPor.ves = 1 / paralelo

  const montoNum = Number(monto.replace(',', '.'))
  const usdBase =
    usdPor[moneda] != null && Number.isFinite(montoNum) ? montoNum * usdPor[moneda] : null

  const convertir = (id: MonedaConv): number | null => {
    const factor = usdPor[id]
    return usdBase != null && factor != null ? usdBase / factor : null
  }

  // Origen y destino nunca pueden coincidir: el otro select se corre solo.
  const cambiarOrigen = (m: MonedaConv) => {
    setMoneda(m)
    if (m === destino) setDestino(m === 'usd' ? 'ars' : 'usd')
  }
  const cambiarDestino = (m: MonedaConv) => {
    setDestino(m)
    if (m === moneda) setMoneda(m === 'usd' ? 'ars' : 'usd')
  }

  const formatearConv = (id: MonedaConv, valor: number): string => {
    switch (id) {
      case 'ars':
        return `$ ${num2.format(valor)}`
      case 'usd':
        return `US$ ${num2.format(valor)}`
      case 'eur':
        return `€ ${num2.format(valor)}`
      case 'ves':
        return `Bs ${num2.format(valor)}`
      case 'usdt':
        return `₮ ${num2.format(valor)}`
    }
  }

  const cardTasa = (id: string) => {
    const t = rateInfo(id)
    return (
      t && (
        <button
          type="button"
          className="cotiz-card"
          key={id}
          title="Fijar como principal"
          onClick={() => elegirPrincipal(id)}
        >
          <span className="cotiz-nombre">{t.corto}</span>
          <span className="cotiz-valor">{t.valor}</span>
        </button>
      )
    )
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="wordmark">Dólar hoy</span>
      </header>

      <main className="landing-main">
        {error && !hero && <p className="landing-error">{error}</p>}

        {hero && (
          <section className="blue-hero" key={heroId}>
            <h1 className="blue-label">{hero.largo}</h1>
            <p className="blue-venta">{hero.valor}</p>
            {hero.compra && <p className="blue-compra">compra {hero.compra}</p>}
          </section>
        )}

        {hero && (
          <button type="button" className="btn btn-ghost" onClick={() => setConvirtiendo(true)}>
            ⇄ Convertir
          </button>
        )}

        {cotizaciones && (
          <section className="secundarias">
            {DOLARES_AR.filter((id) => id !== heroId).map(cardTasa)}
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
              <p className="tasas-limite">Hasta {MAX_TASAS} tasas. Tocá una tarjeta para hacerla principal.</p>
            </div>
          )}

          {tasas.length > 0 && (
            <div className="secundarias">
              {tasas.filter((id) => id !== heroId).map(cardTasa)}
            </div>
          )}

          <button type="button" className="info-btn" onClick={() => setMostrandoInfo(true)}>
            Info
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        {blue && <span>{haceCuanto(blue.fechaActualizacion)}</span>}
        {cotizaciones?.stale && <span className="stale-badge">desactualizado</span>}
      </footer>

      {mostrandoInfo && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setMostrandoInfo(false)}
        >
          <div className="modal">
            <h2>Fuentes de datos</h2>
            <ul className="info-lista">
              <li>
                <strong>DolarAPI</strong>
                <span>
                  Dólares argentinos (blue, oficial, MEP) y monedas en pesos (euro, real).{' '}
                  <a href="https://dolarapi.com" target="_blank" rel="noreferrer">
                    dolarapi.com
                  </a>
                </span>
              </li>
              <li>
                <strong>DolarAPI Venezuela</strong>
                <span>
                  BCV y dólar paralelo en bolívares.{' '}
                  <a href="https://ve.dolarapi.com" target="_blank" rel="noreferrer">
                    ve.dolarapi.com
                  </a>
                </span>
              </li>
              <li>
                <strong>CriptoYa</strong>
                <span>
                  USDT real vía Binance P2P, en pesos y en bolívares.{' '}
                  <a href="https://criptoya.com" target="_blank" rel="noreferrer">
                    criptoya.com
                  </a>
                </span>
              </li>
            </ul>
            <p className="conv-nota">
              Los datos se actualizan cada 5 minutos. Son valores de referencia, no cotizaciones
              operables.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setMostrandoInfo(false)}
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {convirtiendo && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setConvirtiendo(false)}
        >
          <div className="modal">
            <h2>Convertir</h2>
            <label>
              Monto
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={monto}
                autoFocus
                onChange={(e) => setMonto(e.target.value)}
              />
            </label>
            <div className="field-row conv-par">
              <label>
                De
                <select value={moneda} onChange={(e) => cambiarOrigen(e.target.value as MonedaConv)}>
                  {MONEDAS_CONV.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="conv-swap"
                title="Invertir monedas"
                onClick={() => {
                  const m = moneda
                  setMoneda(destino)
                  setDestino(m)
                }}
              >
                ⇄
              </button>
              <label>
                A
                <select
                  value={destino}
                  onChange={(e) => cambiarDestino(e.target.value as MonedaConv)}
                >
                  {MONEDAS_CONV.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="conv-resultado">
              {convertir(destino) != null ? formatearConv(destino, convertir(destino)!) : '—'}
            </div>
            <ul className="conv-lista conv-lista-menor">
              {MONEDAS_CONV.filter((m) => m.id !== moneda && m.id !== destino).map((m) => {
                const valor = convertir(m.id)
                return (
                  <li key={m.id} className="conv-item">
                    <span className="conv-moneda">{m.nombre}</span>
                    <span className="conv-valor">
                      {valor != null ? formatearConv(m.id, valor) : '—'}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="conv-nota">
              Al blue, paralelo y USDT Binance P2P. Valores de referencia.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setConvirtiendo(false)}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
