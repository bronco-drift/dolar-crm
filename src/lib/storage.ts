// Puerta única a la persistencia: cada dominio vive en storage/<dominio>.ts
// y se reexporta acá, así el resto de la app importa siempre desde 'lib/storage'
// y la migración a backend se hace por dominio sin tocar las vistas.
export * from './storage/crm'
export * from './storage/gastos'
export * from './storage/pto'
export * from './storage/habitos'
export * from './storage/tareas'
