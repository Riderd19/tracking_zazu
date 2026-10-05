// El backend manda las fechas pre-formateadas como "d/m/Y" o "d/m/Y H:i".
// `new Date()` las leería como m/d/Y (04/10 → 10 de abril), así que se parsean
// a mano. Las "Y-m-d" sin hora también se arman en hora local: `new Date()` las
// toma como UTC y en Perú caerían el día anterior.
function parsearFecha(fecha) {
  const texto = String(fecha).trim()

  const dmy = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/)
  if (dmy) {
    const [, d, m, y, hh, mm] = dmy
    const conHora = hh !== undefined
    return { valor: new Date(+y, +m - 1, +d, conHora ? +hh : 0, conHora ? +mm : 0), conHora }
  }

  const ymd = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) {
    const [, y, m, d] = ymd
    return { valor: new Date(+y, +m - 1, +d), conHora: false }
  }

  return { valor: new Date(texto), conHora: true }
}

// Formato largo en español ("28 de julio de 2026, 8:56 a. m."). La hora solo se
// muestra si el valor la trae. Si no es una fecha válida se devuelve tal cual en
// vez de mostrar "Invalid Date".
export function formatearFecha(fecha) {
  if (!fecha) return null

  const { valor, conHora } = parsearFecha(fecha)
  if (Number.isNaN(valor.getTime())) return fecha

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(conHora && { hour: 'numeric', minute: '2-digit' }),
  }).format(valor)
}
