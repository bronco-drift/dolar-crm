import webpush from 'web-push'

// Recordatorio diario de Hábitos. Lo dispara Vercel Cron (ver vercel.json).
// Sin base de datos: la suscripción del dispositivo vive en la variable de
// entorno PUSH_SUBSCRIPTION (la genera el botón "Activar recordatorio").
const VAPID_PUBLIC = 'BNHTUbVmO4Gt7OJZCUcFZXiU6BbEJsIoZ5_lOd_5BaEwdwKkD7_nlB4Fvdww0Rf7CINpbhTfJAGgPp9wbqQhGhY'

export default async function handler(req, res) {
  // Vercel Cron manda este header; en local no hay secreto y se permite.
  const secreto = process.env.CRON_SECRET
  if (secreto && req.headers.authorization !== `Bearer ${secreto}`) {
    return res.status(401).json({ error: 'no autorizado' })
  }

  const crudo = process.env.PUSH_SUBSCRIPTION
  const privada = process.env.VAPID_PRIVATE
  if (!crudo || !privada) {
    return res.status(200).json({ ok: false, motivo: 'faltan PUSH_SUBSCRIPTION o VAPID_PRIVATE' })
  }

  webpush.setVapidDetails(
    process.env.VAPID_CONTACTO || 'mailto:bronco.drift@outlook.com',
    VAPID_PUBLIC,
    privada,
  )

  const cuerpo = JSON.stringify({
    title: 'Hábitos',
    body: '¿Cómo te fue hoy? Anotalo en un toque.',
    url: '/herramientas',
  })

  try {
    // Admite una suscripción o varias, por si algún día hay más dispositivos.
    const subs = JSON.parse(crudo)
    const lista = Array.isArray(subs) ? subs : [subs]
    await Promise.all(lista.map((s) => webpush.sendNotification(s, cuerpo)))
    return res.status(200).json({ ok: true, enviados: lista.length })
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) })
  }
}
