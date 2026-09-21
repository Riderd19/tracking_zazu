// Permite compartir un link de WhatsApp que precargue el código de pedido.
// El DNI/celular NUNCA va en la URL en claro (quedaría expuesto en el
// historial de chat) — cuando el bot ya sabe de qué pedido se trata, en vez
// de codigo/DNI manda un token opaco (`t`) que el backend resuelve
// (ver TrackingLinkService en el backend): no revela nada si el link se
// reenvía o queda guardado para siempre en el chat.
const PARAM_CODIGO = 'codigo'
const PARAM_TOKEN = 't'

export function leerCodigoDeUrl() {
  return new URLSearchParams(window.location.search).get(PARAM_CODIGO) ?? ''
}

export function leerTokenDeUrl() {
  return new URLSearchParams(window.location.search).get(PARAM_TOKEN) ?? ''
}

export function limpiarCodigoDeUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete(PARAM_CODIGO)
  url.searchParams.delete(PARAM_TOKEN)
  window.history.replaceState({}, '', url)
}
