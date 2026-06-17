const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export class TrackingNoEncontradoError extends Error {}
export class TrackingRateLimitError extends Error {}
export class TrackingValidacionError extends Error {}

// Llama al endpoint público de tracking. Lanza un error tipado según el
// código HTTP para que la UI pueda mostrar un mensaje distinto en cada caso.
export async function buscarPedido(codigo, verificacion) {
  const response = await fetch(`${API_URL}/public/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ codigo, verificacion }),
  })

  if (response.ok) {
    return response.json()
  }

  const body = await response.json().catch(() => ({}))

  if (response.status === 404) {
    // El backend ya da un mensaje claro y seguro (no revela si el pedido existe).
    throw new TrackingNoEncontradoError(
      body.message ?? 'No encontramos un pedido con esos datos.',
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

  throw new Error(body.message ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.')
}
