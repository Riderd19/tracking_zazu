// URLs públicas de rastreo por courier — se matchea por substring
// (case-insensitive) contra el nombre de la agencia. Sin URL conocida para
// un courier, el botón "Rastrear en X" simplemente no se muestra (mejor
// omitirlo que enlazar a una URL adivinada).
const COURIER_TRACKING_URLS = {
  shalom: 'https://shalom.com.pe/rastrea',
}

export function urlRastreoAgencia(agencia) {
  if (!agencia) return null
  const clave = Object.keys(COURIER_TRACKING_URLS).find((k) => agencia.toLowerCase().includes(k))
  return clave ? COURIER_TRACKING_URLS[clave] : null
}
