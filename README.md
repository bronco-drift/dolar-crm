# dolar-crm

Una app web con dos caras:

- **`/`** — Landing pública de cotizaciones del dólar (blue, oficial, MEP) vía [DolarAPI](https://dolarapi.com).
- **`/crm`** — El CRM más simple del mundo: una pantalla, una entidad, guardado en localStorage.

## Stack

React 19 + TypeScript + Vite. Sin backend (por ahora): los contactos viven en el navegador y las cotizaciones se piden directo a DolarAPI con caché local de 5 minutos.

Dos módulos encapsulan todo lo que va a migrar a backend en la fase 2 (Neon + Drizzle):

- `src/lib/cotizaciones.ts` — única fuente de cotizaciones.
- `src/lib/storage.ts` — única puerta a la persistencia de contactos.

## Desarrollo

```bash
npm install
npm run dev
```

## Roadmap

1. ✅ MVP localStorage
2. Histórico de cotizaciones + sparkline
3. Congelar cotización al cerrar un deal
4. Backend propio (Neon Postgres + Drizzle) + auth
