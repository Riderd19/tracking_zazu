// El backend a veces guarda la dirección con el Plus Code de Google delante
// (ej. "V3P7+HXQ, Huaca del Sol...") — es un código interno de geocodificación,
// no aporta nada al cliente y solo ocupa espacio.
function quitarPlusCode(direccion) {
  return direccion.replace(/^\S+\+\S+,\s*/, '')
}

/**
 * A dónde va el pedido, tal como se le muestra al cliente.
 *
 * Si es recojo en tienda, el "destino" es la sede y no la dirección del
 * destinatario (que puede no aplicar o venir vacía). Lo usan la ficha, el mapa
 * y la tarjeta de courier, así que vive acá y no dentro de un componente.
 */
export function destinoDelPedido(pedido) {
  const completo =
    pedido.sede_entrega?.direccion ?? pedido.destinatario_direccion ?? 'No disponible'

  return quitarPlusCode(completo)
}
