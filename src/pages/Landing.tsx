import { useEffect, useState } from 'react'
import AjustesGlobales from '../components/AjustesGlobales'
import {
  MAX_TASAS,
  PAISES_ENVIO,
  TASAS_DISPONIBLES,
  getOrdenPizarra,
  getPaisEnvio,
  getPaisUsuario,
  getPrincipal,
  getTasasElegidas,
  heroSugerido,
  porCasa,
  porFuente,
  porMoneda,
  saveOrdenPizarra,
  savePaisEnvio,
  savePrincipal,
  saveTasasElegidas,
  useBolivares,
  useCotizaciones,
  useMonedas,
  useUsdtArs,
  useUsdtEur,
  useUsdtFiat,
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

const num0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

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

// Filas siempre presentes en la pizarra (las extra se eligen en "Editar").
const FILAS_FIJAS = [...DOLARES_AR, 'ars-eur', 've-eur', 'usd-cop', 'cop-ves']

interface RateInfo {
  corto: string
  largo: string
  par: string // par de cambio explícito, estilo casa de cambio
  valor: string | null
  compra?: string | null
}

export default function Landing() {
  const { cotizaciones, error } = useCotizaciones()
  const { bolivares: ve } = useBolivares()
  const { monedas } = useMonedas()
  const { usdtArs } = useUsdtArs()
  const { usdtVes } = useUsdtVes()
  const { usdtEur } = useUsdtEur()
  const { usdtFiat: usdtCop } = useUsdtFiat('cop')
  // País del usuario: define cuál es "su" cotización relevante.
  const [paisUsuarioId, setPaisUsuarioId] = useState(getPaisUsuario)
  useEffect(() => {
    const onCambio = () => setPaisUsuarioId(getPaisUsuario())
    window.addEventListener('pais-usuario', onCambio)
    return () => window.removeEventListener('pais-usuario', onCambio)
  }, [])
  const paisUsuario = PAISES_ENVIO.find((p) => p.id === paisUsuarioId) ?? PAISES_ENVIO[0]
  const { usdtFiat: usdtLocal } = useUsdtFiat(paisUsuario.fiat ?? 'ars')
  const usdEnLocal = paisUsuario.fiat ? valorUsdt(usdtLocal) : null

  const [paisEnvioId, setPaisEnvioId] = useState(getPaisEnvio)
  const paisEnvio = PAISES_ENVIO.find((p) => p.id === paisEnvioId) ?? PAISES_ENVIO[0]
  const { usdtFiat: usdtDestino } = useUsdtFiat(paisEnvio.fiat ?? 'ves')
  const [tasas, setTasas] = useState<string[]>(getTasasElegidas)
  const [orden, setOrden] = useState<string[]>(getOrdenPizarra)
  const [principal, setPrincipal] = useState<string | null>(getPrincipal)
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
  // Euro en Bs: cross vía USDT (Bs por USDT ÷ EUR por USDT)
  const eurPorUsdt = valorUsdt(usdtEur)
  const eurEnBs = usdtEnBs != null && eurPorUsdt ? usdtEnBs / eurPorUsdt : null
  // Peso colombiano: USD→COP directo y cross COP→Bs
  const usdEnCop = valorUsdt(usdtCop)
  const copEnBs = usdtEnBs != null && usdEnCop ? usdtEnBs / usdEnCop : null

  // Enviar US$ 100 a Venezuela: costo en pesos y llegada en Bs, por canal
  const envio = {
    costoDolar: blue ? 100 * blue.venta : null,
    llegaDolar: paralelo != null ? 100 * paralelo : null,
    costoUsdt: usdtEnPesos != null ? 100 * usdtEnPesos : null,
    llegaUsdt: usdtEnBs != null ? 100 * usdtEnBs : null,
  }
  let conviene: 'dolar' | 'usdt' | null = null
  if (blue && paralelo != null && usdtEnPesos != null && usdtEnBs != null) {
    conviene = paralelo / blue.venta >= usdtEnBs / usdtEnPesos ? 'dolar' : 'usdt'
  }

  const esVe = paisEnvio.id === 've'
  const usdtEnDestino = paisEnvio.fiat ? valorUsdt(usdtDestino) : null
  const llegaUsdtDestino =
    paisEnvio.fiat == null ? 100 : usdtEnDestino != null ? 100 * usdtEnDestino : null
  const fmtMonto = (v: number) => (v >= 1000 ? num0.format(v) : num2.format(v))

  const rateInfo = (id: string): RateInfo | null => {
    switch (id) {
      case 'blue':
        return blue
          ? {
              corto: 'Blue',
              largo: '🇦🇷 Dólar blue',
              par: '🇺🇸 → 🇦🇷',
              valor: pesos.format(blue.venta),
              compra: pesos.format(blue.compra),
            }
          : null
      case 'oficial':
        return oficial
          ? {
              corto: 'Oficial',
              largo: '🇦🇷 Dólar oficial',
              par: '🇺🇸 → 🇦🇷',
              valor: pesos.format(oficial.venta),
              compra: pesos.format(oficial.compra),
            }
          : null
      case 'mep':
        return mep
          ? {
              corto: 'MEP',
              largo: '🇦🇷 Dólar MEP',
              par: '🇺🇸 → 🇦🇷',
              valor: pesos.format(mep.venta),
              compra: pesos.format(mep.compra),
            }
          : null
      case 'usdt':
        return usdtEnPesos != null
          ? {
              corto: 'USDT',
              largo: '🇦🇷 USDT',
              par: '₮ → 🇦🇷',
              valor: pesos.format(usdtEnPesos),
            }
          : null
      case 've-bcv': {
        const v = valorVe(porFuente(ve, 'oficial'))
        return v != null
          ? { corto: 'BCV', largo: '🇻🇪 BCV', par: '🇺🇸 → 🇻🇪', valor: `Bs ${num2.format(v)}` }
          : null
      }
      case 've-paralelo':
        return paralelo != null
          ? {
              corto: 'Paralelo',
              largo: '🇻🇪 Dólar paralelo',
              par: '🇺🇸 → 🇻🇪',
              valor: `Bs ${num2.format(paralelo)}`,
            }
          : null
      case 've-usdt':
        return usdtEnBs != null
          ? {
              corto: 'USDT',
              largo: '🇻🇪 USDT',
              par: '₮ → 🇻🇪',
              valor: `Bs ${num2.format(usdtEnBs)}`,
            }
          : null
      case 'ars-eur':
        return eurArs
          ? {
              corto: 'Euro',
              largo: '🇦🇷 Euro',
              par: '🇪🇺 → 🇦🇷',
              valor: pesos.format(eurArs.venta),
            }
          : null
      case 've-eur':
        return eurEnBs != null
          ? {
              corto: 'Euro',
              largo: '🇻🇪 Euro',
              par: '🇪🇺 → 🇻🇪',
              valor: `≈ Bs ${num2.format(eurEnBs)}`,
            }
          : null
      case 'ars-brl': {
        const c = porMoneda(monedas, 'BRL')
        return c
          ? { corto: 'Real', largo: '🇦🇷 Real', par: '🇧🇷 → 🇦🇷', valor: pesos.format(c.venta) }
          : null
      }
      // Fila genérica: el dólar en la moneda del país del usuario.
      case 'local':
        return usdEnLocal != null
          ? {
              corto: 'Dólar',
              largo: `${paisUsuario.bandera} Dólar`,
              par: `🇺🇸 → ${paisUsuario.bandera}`,
              valor: `≈ ${paisUsuario.prefijo} ${
                usdEnLocal >= 1000 ? num0.format(usdEnLocal) : num2.format(usdEnLocal)
              }`,
            }
          : null
      case 'usd-cop':
        return usdEnCop != null
          ? {
              corto: 'Dólar',
              largo: '🇨🇴 Dólar',
              par: '🇺🇸 → 🇨🇴',
              valor: `≈ COP ${num0.format(usdEnCop)}`,
            }
          : null
      case 'cop-ves':
        return copEnBs != null
          ? {
              corto: 'Peso col.',
              largo: '🇨🇴 Peso en Bs',
              par: '🇨🇴 → 🇻🇪',
              valor: `≈ Bs ${num2.format(copEnBs)}`,
            }
          : null
      default:
        return null
    }
  }

  const elegirPrincipal = (id: string) => {
    setPrincipal(id)
    savePrincipal(id)
  }

  // Sin elección explícita manda el país; si esa tasa no tiene datos, blue.
  const candidato = principal ?? heroSugerido(paisUsuarioId)
  const heroId = rateInfo(candidato)?.valor != null ? candidato : 'blue'
  const hero = rateInfo(heroId)

  // Filas visibles: primero la del país del usuario, después el resto.
  const visibles = [
    ...new Set([heroSugerido(paisUsuarioId), ...FILAS_FIJAS, ...tasas]),
  ].filter((id) => id !== 'local' || usdEnLocal != null)
  const filasOrdenadas = [
    ...orden.filter((id) => visibles.includes(id)),
    ...visibles.filter((id) => !orden.includes(id)),
  ]

  const moverFila = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= filasOrdenadas.length) return
    const arr = [...filasOrdenadas]
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setOrden(arr)
    saveOrdenPizarra(arr)
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

  // Fila estilo pizarra de casa de cambio: par explícito, nombre y valor.
  const filaTasa = (id: string) => {
    const t = rateInfo(id)
    return (
      t && (
        <button
          type="button"
          className="pz-fila"
          key={id}
          title="Fijar como principal"
          onClick={() => elegirPrincipal(id)}
        >
          <span className="pz-par">{t.par}</span>
          <span className="pz-nombre">{t.corto}</span>
          <span className="pz-valor">{t.valor}</span>
        </button>
      )
    )
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="wordmark">Dólar hoy</span>
        <AjustesGlobales />
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

        {envio.costoDolar != null && (
          <section
            className={`envio-block ${esVe ? 'is-tap' : ''}`}
            role={esVe ? 'button' : undefined}
            title={esVe ? 'Abrir el conversor' : undefined}
            onClick={() => {
              if (!esVe) return
              setMonto('100')
              setMoneda('usd')
              setDestino('ves')
              setConvirtiendo(true)
            }}
          >
            <div className="envio-head">
              <h2 className="envio-titulo">Enviar US$ 100 a</h2>
              <select
                className="envio-select"
                value={paisEnvio.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setPaisEnvioId(e.target.value)
                  savePaisEnvio(e.target.value)
                }}
              >
                {PAISES_ENVIO.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.bandera} {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {esVe && envio.llegaDolar != null && (
              <div className="envio-fila">
                <span className="envio-via">
                  Vía dólar {conviene === 'dolar' && <span className="envio-badge">conviene</span>}
                </span>
                <span className="envio-datos">
                  pagás {pesos.format(envio.costoDolar)} · llegan Bs {num0.format(envio.llegaDolar)}
                </span>
              </div>
            )}
            {esVe && envio.costoUsdt != null && envio.llegaUsdt != null && (
              <div className="envio-fila">
                <span className="envio-via">
                  Vía USDT {conviene === 'usdt' && <span className="envio-badge">conviene</span>}
                </span>
                <span className="envio-datos">
                  pagás {pesos.format(envio.costoUsdt)} · llegan Bs {num0.format(envio.llegaUsdt)}
                </span>
              </div>
            )}
            {!esVe && (
              <div className="envio-fila">
                <span className="envio-via">Vía USDT</span>
                <span className="envio-datos">
                  {envio.costoUsdt != null && llegaUsdtDestino != null
                    ? `pagás ${pesos.format(envio.costoUsdt)} · llegan ${paisEnvio.prefijo} ${fmtMonto(llegaUsdtDestino)}`
                    : 'sin datos por ahora'}
                </span>
              </div>
            )}
          </section>
        )}

        {cotizaciones && (
          <section className="pizarra">
            {filasOrdenadas.filter((id) => id !== heroId).map(filaTasa)}
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
              <p className="tasas-sub">Orden</p>
              {filasOrdenadas.map((id, i) => {
                const info = rateInfo(id)
                return (
                  <div key={id} className="orden-fila">
                    <span className="orden-nombre">
                      {info ? `${info.par} ${info.corto}` : id}
                    </span>
                    <button
                      type="button"
                      className="kbc-btn"
                      title="Subir"
                      disabled={i === 0}
                      onClick={() => moverFila(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="kbc-btn"
                      title="Bajar"
                      disabled={i === filasOrdenadas.length - 1}
                      onClick={() => moverFila(i, 1)}
                    >
                      ↓
                    </button>
                  </div>
                )
              })}
              <p className="tasas-sub">Tasas extra</p>
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
              <p className="tasas-limite">
                Hasta {MAX_TASAS} tasas extra en la pizarra. Tocá una fila para hacerla principal.
              </p>
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
