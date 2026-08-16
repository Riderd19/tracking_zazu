// Formato largo en español ("28 de julio de 2026, 8:56 a. m.") para fechas
// ISO/parseables. Si el valor no es una fecha válida (ej. ya viene
// pre-formateado del backend como "d/m/Y"), se devuelve tal cual en vez de
// mostrar "Invalid Date".
export function formatearFecha(fecha) {
  if (!fecha) return null

  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return fecha

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(valor)
}
