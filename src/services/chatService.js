import { API_URL, cuerpoDeIdentidad } from './trackingService'

// El chat del pedido (ver TrackingPublicController::chat y ChatTrackingController
// en el backend). Abrirlo prueba la identidad —la misma de la búsqueda: token del
// enlace o código + DNI/celular— y devuelve una sesión; leer y escribir van con
// esa sesión en una cabecera, nunca en la URL.

const CABECERA_SESION = 'X-Chat-Sesion'

// La sesión venció (dura unas horas): quien llama la renueva con la identidad.
export class ChatSesionVencidaError extends Error {}
export class ChatRateLimitError extends Error {}

async function leerRespuesta(response, mensajePorDefecto) {
  const body = await response.json().catch(() => ({}))

  if (response.ok) return body

  if (response.status === 401) {
    throw new ChatSesionVencidaError(body.message ?? 'La sesión del chat venció.')
  }
  if (response.status === 429) {
    throw new ChatRateLimitError('Estás enviando mensajes muy rápido. Espera un momento e inténtalo de nuevo.')
  }
  if (response.status === 422) {
    // El backend ya responde un texto pensado para el cliente (mensaje vacío o largo).
    throw new Error(body.message ?? 'Revisa tu mensaje e inténtalo de nuevo.')
  }
  if (response.status === 413) {
    // Lo corta el servidor web antes de llegar a Laravel, sin cuerpo JSON.
    throw new Error('La foto es muy pesada. Prueba con otra.')
  }

  throw new Error(body.message ?? mensajePorDefecto)
}

// { sesion, atiende, esperando_respuesta, mensajes }
export async function abrirChat(identidad) {
  const response = await fetch(`${API_URL}/public/tracking/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(cuerpoDeIdentidad(identidad)),
  })

  return leerRespuesta(response, 'No pudimos abrir el chat. Inténtalo de nuevo.')
}

// { atiende, esperando_respuesta, mensajes } con los mensajes posteriores a `despuesDe`.
export async function traerMensajes(sesion, despuesDe) {
  const params = despuesDe ? `?despues_de=${encodeURIComponent(despuesDe)}` : ''
  const response = await fetch(`${API_URL}/public/tracking/chat/mensajes${params}`, {
    headers: { Accept: 'application/json', [CABECERA_SESION]: sesion },
  })

  return leerRespuesta(response, 'No pudimos actualizar el chat.')
}

// { atiende, esperando_respuesta, mensaje }
// `opcion` es la clave del mensaje predefinido que tocó el cliente (ver
// MENSAJES_PREDEFINIDOS en ChatDelPedido): con ella el asistente contesta una
// respuesta fija en vez de pasar por la IA.
export async function enviarMensaje(sesion, texto, opcion = null) {
  const response = await fetch(`${API_URL}/public/tracking/chat/mensajes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', [CABECERA_SESION]: sesion },
    body: JSON.stringify(opcion ? { mensaje: texto, opcion } : { mensaje: texto }),
  })

  return leerRespuesta(response, 'No pudimos enviar tu mensaje. Inténtalo de nuevo.')
}

// { atiende, esperando_respuesta, mensaje } — la foto la ve el asesor en el
// módulo Chat (ver ChatTrackingController::enviarImagen).
export async function enviarImagen(sesion, foto) {
  const datos = new FormData()
  datos.append('imagen', foto, 'foto.jpg')

  // Sin Content-Type: el navegador lo pone con el boundary del multipart.
  const response = await fetch(`${API_URL}/public/tracking/chat/imagenes`, {
    method: 'POST',
    headers: { Accept: 'application/json', [CABECERA_SESION]: sesion },
    body: datos,
  })

  return leerRespuesta(response, 'No pudimos enviar tu foto. Inténtalo de nuevo.')
}

// La foto o el documento de un mensaje, como blob. No va en un <img src> ni en
// un enlace directo porque la sesión viaja en una cabecera, y el navegador no la
// manda al pedir una imagen o al seguir un enlace.
export async function traerArchivo(sesion, mensajeId) {
  const response = await fetch(`${API_URL}/public/tracking/chat/mensajes/${mensajeId}/archivo`, {
    headers: { [CABECERA_SESION]: sesion },
  })

  if (!response.ok) await leerRespuesta(response, 'No pudimos cargar el archivo.')
  return response.blob()
}
