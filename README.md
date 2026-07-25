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

## Recordatorio diario (push en iOS)

Sin base de datos: la suscripción del dispositivo vive en una variable de entorno.

1. Instalar la app en el iPhone (Safari → Compartir → Agregar a inicio). En iOS el push
   solo funciona con la PWA instalada.
2. Abrirla, ir a Herramientas → Hábitos → **Recordatorio diario** y aceptar el permiso.
   El botón copia la suscripción al portapapeles.
3. En Vercel → Settings → Environment Variables, cargar:
   - `PUSH_SUBSCRIPTION`: el JSON copiado (admite también un array de varios dispositivos).
   - `VAPID_PRIVATE`: la clave privada (no va al repo).
   - `VAPID_CONTACTO` (opcional): `mailto:tu@correo` — Apple exige mailto o URL https.
4. Redeployar. `vercel.json` ya programa el cron diario a las 00:00 UTC (21:00 en Argentina).

Para probar sin esperar al cron: `GET /api/recordatorio` desde el navegador.

## Roadmap

1. ✅ MVP localStorage
2. Histórico de cotizaciones + sparkline
3. Congelar cotización al cerrar un deal
4. Backend propio (Neon Postgres + Drizzle) + auth
