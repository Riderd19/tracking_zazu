import { pedirClaveDeRecojo } from './trackingService'

// La clave ya pedida, por pedido, mientras la pestaña siga abierta. Las tarjetas
// se vuelven a montar cuando cambia el estado del pedido, y el endpoint de la
// clave admite pocos intentos por hora (throttle `tracking-clave`): sin esto,
// cada vuelta de montaje gastaba uno. Se guarda la promesa para que la fila de la
// tarjeta y la ventana del pago, que la piden en el mismo momento, compartan una
// sola consulta.
const clavesPedidas = new Map()

/**
 * 'bloqueada' | 'liberada', o null si el pedido no tiene clave de recojo.
 *
 * Lo decide el backend (`clave_recojo.estado`, con la misma regla que libera la
 * clave en el bot: Ligo, cobro validado o ERP). Si el backend todavía no manda ese
 * campo —una versión anterior desplegada—, se deduce de lo que sí manda: pedido de
 * Shalom, y "Pago Completo" o no. Así la fila no desaparece por desplegar el
 * tracking antes que el backend.
 */
export function estadoClaveRecojo(pedido) {
  if (pedido.clave_recojo !== undefined) return pedido.clave_recojo?.estado ?? null
  if (!pedido.es_shalom || pedido.clave_disponible === false) return null
  return pedido.tipo_pago === 'Pago Completo' ? 'liberada' : 'bloqueada'
}

/**
 * La clave de recojo del pedido de `identidad`, consultada una sola vez.
 *
 * Solo se recuerda la clave entregada: "se está generando" o un fallo de red se
 * vuelven a consultar la próxima vez que alguien la pida.
 */
export function pedirClaveUnaVez(identidad) {
  // Por código o, si entró por el enlace del bot, por su token.
  const codigo = identidad.codigo ?? `token:${identidad.token}`
  if (!clavesPedidas.has(codigo)) {
    const pedido = pedirClaveDeRecojo(identidad)
      .catch((err) => ({ ok: false, mensaje: err.message }))
      .then((resultado) => {
        if (!resultado.ok) clavesPedidas.delete(codigo)
        return resultado
      })
    clavesPedidas.set(codigo, pedido)
  }
  return clavesPedidas.get(codigo)
}
