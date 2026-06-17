// Permite compartir un link de WhatsApp que precargue el código de pedido.
// El DNI/celular NUNCA va en la URL (quedaría expuesto en el historial de chat).
const PARAM = 'codigo'

export function leerCodigoDeUrl() {
  return new URLSearchParams(window.location.search).get(PARAM) ?? ''
}

export function escribirCodigoEnUrl(codigo) {
  const url = new URL(window.location.href)
  url.searchParams.set(PARAM, codigo)
  window.history.replaceState({}, '', url)
}

export function limpiarCodigoDeUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete(PARAM)
  window.history.replaceState({}, '', url)
}
