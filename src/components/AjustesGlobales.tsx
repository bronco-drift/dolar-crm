import { useEffect, useRef, useState } from 'react'
import { PAISES_ENVIO, getPaisUsuario, savePaisUsuario } from '../lib/cotizaciones'
import { aplicarTema, temaInicial } from '../lib/tema'

// Ajustes que valen para toda la app: tema y país del usuario.
// El país define después qué cotizaciones son las relevantes.
export default function AjustesGlobales() {
  const [oscuro, setOscuro] = useState(temaInicial)
  const [pais, setPais] = useState(getPaisUsuario)
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [abierto])

  const actual = PAISES_ENVIO.find((p) => p.id === pais) ?? PAISES_ENVIO[0]

  return (
    <div className="ajustes-globales" ref={ref}>
      <button
        type="button"
        className="tema-btn"
        title={`País: ${actual.nombre}`}
        onClick={() => setAbierto((a) => !a)}
      >
        {actual.bandera}
      </button>
      <button
        type="button"
        className="tema-btn"
        title={oscuro ? 'Tema claro' : 'Tema oscuro'}
        onClick={() => {
          setOscuro((o) => {
            aplicarTema(!o)
            return !o
          })
        }}
      >
        {oscuro ? '☀' : '☾'}
      </button>

      {abierto && (
        <div className="pais-menu">
          {PAISES_ENVIO.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`pais-opcion ${p.id === pais ? 'is-current' : ''}`}
              onClick={() => {
                setPais(p.id)
                savePaisUsuario(p.id)
                // Avisar a las vistas que dependen del país (landing).
                window.dispatchEvent(new Event('pais-usuario'))
                setAbierto(false)
              }}
            >
              {p.bandera} {p.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
