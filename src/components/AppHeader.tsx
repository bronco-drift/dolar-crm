import AjustesGlobales from './AjustesGlobales'

// Cabecera única de la app: mismo alto y posición en todas las vistas,
// solo cambia el título.
export default function AppHeader({ titulo }: { titulo: string }) {
  return (
    <header className="app-header">
      <span className="wordmark">{titulo}</span>
      <AjustesGlobales />
    </header>
  )
}
