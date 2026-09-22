import { useCallback, useEffect, useState } from 'react'
import {
  buscarPedido,
  buscarPedidoPorToken,
  TrackingNoEncontradoError,
  TrackingRateLimitError,
  TrackingValidacionError,
} from '../services/trackingService'
import {
  leerCodigoDeUrl,
  leerTokenDeUrl,
  limpiarCodigoDeUrl,
} from '../utils/codigoUrl'

// Cada cuánto se refresca el pedido mientras está "En Ruta" (posición del
// motorizado, hora estimada). No es push en vivo (eso requeriría un canal de
// broadcast que hoy no existe) — 20s es suficiente para que el mapa se sienta
// actualizado sin acercarse al límite de 10 consultas/min por IP del backend.
const INTERVALO_POLLING_MS = 20000
const CODIGO_EN_RUTA = 'en_ruta'

function clasificarError(err) {
  if (err instanceof TrackingRateLimitError)
    return { tipo: 'rate_limit', mensaje: err.message }
  if (err instanceof TrackingNoEncontradoError)
    return { tipo: 'no_encontrado', mensaje: err.message }
  if (err instanceof TrackingValidacionError)
    return { tipo: 'validacion', mensaje: err.message }
  return {
    tipo: 'desconocido',
    mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  }
}

/**
 * Todo el estado del seguimiento de un pedido: la búsqueda, el token que llega
 * por URL, el refresco automático mientras va en camino y el error tipado.
 *
 * Vive fuera de las páginas para que `BuscarPedidoPage` y `SeguimientoPage`
 * sean sólo presentación: cuál de las dos se muestra lo decide `pedido`, y eso
 * es lo único que App necesita saber.
 */
export default function useSeguimientoPedido() {
  const [pedido, setPedido] = useState(null)
  // Si llega un token en la URL, arranca en loading para no mostrar el
  // formulario vacío un instante antes de que la búsqueda automática resuelva.
  const [loading, setLoading] = useState(() => Boolean(leerTokenDeUrl()))
  const [error, setError] = useState(null)
  const [codigoInicial, setCodigoInicial] = useState(leerCodigoDeUrl)
  // Código + identificador de la última búsqueda exitosa, para poder repetirla
  // en el polling sin pedirle esos datos de nuevo al usuario.
  const [identidad, setIdentidad] = useState(null)

  // El código de la URL (link de WhatsApp) se consume una sola vez: se usa para
  // precargar el formulario y se borra de inmediato, para que un refresh (F5) o
  // volver a abrir la pestaña siempre arranque con los campos limpios.
  useEffect(() => {
    if (codigoInicial) limpiarCodigoDeUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // El link que manda el bot lleva un token en vez de código + DNI/celular (ver
  // leerTokenDeUrl): si llega uno, se busca de una sola vez al abrir, sin que
  // el cliente tenga que tocar el formulario. Si el token ya expiró o es
  // inválido, el error queda visible en el formulario para que lo intente a mano.
  useEffect(() => {
    const token = leerTokenDeUrl()
    if (!token) return

    limpiarCodigoDeUrl()

    buscarPedidoPorToken(token)
      .then((resultado) => {
        setPedido(resultado)
        setIdentidad({ token })
      })
      .catch((err) => setError(clasificarError(err)))
      .finally(() => setLoading(false))
  }, [])

  const buscar = useCallback(async (codigo, identificador) => {
    setLoading(true)
    setError(null)

    try {
      const resultado = await buscarPedido(codigo, identificador)
      setPedido(resultado)
      setIdentidad({ codigo, identificador })
    } catch (err) {
      setError(clasificarError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const volver = useCallback(() => {
    setPedido(null)
    setError(null)
    setCodigoInicial('')
    setIdentidad(null)
    limpiarCodigoDeUrl()
  }, [])

  // Polling: solo mientras el pedido esté "En Ruta" — antes no hay nada que
  // se mueva, y después (entregado/etc.) tampoco. Errores de red durante el
  // polling se ignoran en silencio: no tiene sentido tirar al usuario a una
  // pantalla de error por un refresh de fondo que falló una vez.
  useEffect(() => {
    if (!identidad || pedido?.estado_actual?.codigo !== CODIGO_EN_RUTA) return

    const intervalo = setInterval(async () => {
      try {
        const actualizado = identidad.token
          ? await buscarPedidoPorToken(identidad.token)
          : await buscarPedido(identidad.codigo, identidad.identificador)
        setPedido(actualizado)
      } catch {
        // silencioso a propósito — se reintenta en el siguiente ciclo
      }
    }, INTERVALO_POLLING_MS)

    return () => clearInterval(intervalo)
  }, [identidad, pedido?.estado_actual?.codigo])

  return {
    pedido,
    identidad,
    loading,
    error,
    codigoInicial,
    buscar,
    volver,
    actualizarPedido: setPedido,
  }
}
