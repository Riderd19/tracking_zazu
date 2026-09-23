// VITE_API_URL se inyecta al compilar. En produccion dejamos un valor seguro
// para que el tracking publicado no intente llamar a localhost si el servidor
// de build no recibio la variable de entorno.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://zazu.com.pe/api' : 'http://127.0.0.1:8000/api' | 'https://dev.zazu.com.pe/api'
  )
).replace(/\/$/, '')
import {
  CODIGO_PEDIDO_ANULADO_DEMO,
  IDENTIFICADOR_PEDIDO_ANULADO_DEMO,
  PEDIDO_ANULADO_DEMO,
} from '../constants/pedidoAnuladoDemo'

export class TrackingNoEncontradoError extends Error {}
export class TrackingRateLimitError extends Error {}
export class TrackingValidacionError extends Error {}

// POST compartido por buscarPedido/buscarPedidoPorToken. Lanza un error
// tipado según el código HTTP para que la UI pueda mostrar un mensaje
// distinto en cada caso.
async function llamarTracking(body) {
  const response = await fetch(`${API_URL}/public/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    return response.json()
  }

  const errBody = await response.json().catch(() => ({}))

  if (response.status === 404) {
    // El backend ya da un mensaje claro y seguro (no revela si el pedido existe).
    throw new TrackingNoEncontradoError(
      errBody.message ?? 'No encontramos un pedido con esos datos.',
    )
  }
  if (response.status === 429) {
    // Copy propio: el mensaje del backend es técnico ("Too Many Attempts.") y en inglés.
    throw new TrackingRateLimitError('Demasiados intentos. Espera un momento e inténtalo de nuevo.')
  }
  if (response.status === 422) {
    // Copy propio: el mensaje del backend referencia nombres de campo internos.
    throw new TrackingValidacionError('Revisa los datos ingresados e inténtalo de nuevo.')
  }

  throw new Error(errBody.message ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.')
}

// Llama al endpoint público de tracking con código + DNI/celular.
export async function buscarPedido(codigo, verificacion) {
  if (
    import.meta.env.DEV &&
    codigo === CODIGO_PEDIDO_ANULADO_DEMO &&
    verificacion === IDENTIFICADOR_PEDIDO_ANULADO_DEMO
  ) {
    return PEDIDO_ANULADO_DEMO
  }

  return llamarTracking({ codigo, verificacion })
}

// Llama al mismo endpoint, pero con el token opaco que manda el bot en vez de
// código + DNI/celular (ver leerTokenDeUrl / TrackingLinkService).
export async function buscarPedidoPorToken(token) {
  return llamarTracking({ token })
}

// Genera (o reutiliza, si ya hay uno vigente) el QR de Ligo Pay para el saldo
// pendiente del pedido — ver TrackingligoQrController en el backend.
export async function generarQrSaldo(codigo, verificacion) {
  const response = await fetch(`${API_URL}/public/trackingligo/qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ codigo, verificacion }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message ?? 'No se pudo generar el QR de pago. Inténtalo nuevamente.')
  }

  return body
}

// El voucher de Shalom del pedido (ver TrackingPublicController::voucher).
// Devuelve { url, nombre } — el frontend abre `url` en una pestaña nueva, no
// hay que descargarlo acá: es el mismo PDF público que ya usa la plantilla
// de WhatsApp.
export async function obtenerVoucherShalom(codigo, verificacion) {
  const response = await fetch(`${API_URL}/public/tracking/voucher`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ codigo, verificacion }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message ?? 'No se pudo obtener el voucher.')
  }

  return body
}

// La clave de recojo de Shalom (ver TrackingPublicController::clave). Responde
// siempre 200: { ok: true, clave } si coincide, { ok: false, mensaje } si no —
// nunca un 403, para no delatarle a quien prueba documentos al azar cuándo
// acertó. Solo tiene sentido pedirla cuando el pedido ya está "Pago Completo".
export async function pedirClaveDeRecojo(codigo, verificacion) {
  const response = await fetch(`${API_URL}/public/tracking/clave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ codigo, verificacion }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message ?? 'No se pudo consultar la clave de recojo.')
  }

  return body
}

// A diferencia de voucher y clave, reprogramar y cambiar la ubicación aceptan
// las mismas dos identidades que /public/tracking: el token del link del bot o
// código + DNI/celular. Quien llegó por el link nunca escribió su DNI, así que
// sin el token no tendría cómo confirmar el cambio.
function cuerpoDeIdentidad(identidad) {
  return identidad?.token
    ? { token: identidad.token }
    : { codigo: identidad?.codigo, verificacion: identidad?.identificador }
}

// POST compartido por reprogramarEntrega/actualizarUbicacion. Como la clave,
// responden 200 con { ok, mensaje } para cualquier desenlace del cambio (fecha
// fuera de plazo, pedido que ya no admite cambios...): solo lanza cuando la
// consulta en sí falla.
async function cambiarEntrega(ruta, identidad, datos, mensajePorDefecto) {
  const response = await fetch(`${API_URL}/public/tracking/${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...cuerpoDeIdentidad(identidad), ...datos }),
  })

  const body = await response.json().catch(() => ({}))

  if (response.status === 429) {
    // El límite es por hora (ver AppServiceProvider): "espera un momento" no alcanza.
    throw new Error('Alcanzaste el límite de cambios por ahora. Inténtalo más tarde o escríbenos por WhatsApp.')
  }
  if (response.status === 422 && body.errors) {
    // Copy propio: el mensaje de validación de Laravel nombra campos internos.
    throw new Error('Revisa los datos ingresados e inténtalo de nuevo.')
  }
  if (!response.ok) {
    throw new Error(body.message ?? mensajePorDefecto)
  }

  return body
}

// Mueve la entrega a otro día (ver TrackingPublicController::reprogramar).
// `fecha` en 'YYYY-MM-DD'.
export async function reprogramarEntrega(identidad, fecha) {
  return cambiarEntrega('reprogramar', identidad, { fecha }, 'No se pudo reprogramar la entrega.')
}

// Cambia el punto de entrega por el que el cliente marcó en el mapa (ver
// TrackingPublicController::ubicacion).
export async function actualizarUbicacion(identidad, lat, lng) {
  return cambiarEntrega('ubicacion', identidad, { lat, lng }, 'No se pudo actualizar la ubicación de entrega.')
}

// Empresas activas para poblar el selector del formulario (ver
// TrackingPublicController::empresas en el backend).
export async function listarEmpresas() {
  const empresaDemo = { label: 'Demo Zazu', value: 'DEMO' }
  let response

  try {
    response = await fetch(`${API_URL}/public/empresas`, {
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (import.meta.env.DEV) return [empresaDemo]
    throw error
  }

  if (!response.ok) {
    if (import.meta.env.DEV) return [empresaDemo]
    throw new Error('No se pudo cargar el listado de empresas.')
  }

  const empresas = await response.json()
  return import.meta.env.DEV ? [empresaDemo, ...empresas] : empresas
}
