/**
 * ¿Hay algo que mostrar en la columna de resumen que acompaña al mapa?
 *
 * `es_shalom` cuenta también: la foto de packing, el voucher y la clave de
 * recojo viven en esa columna y deben asomar aunque el pedido no tenga saldo
 * pendiente ni artículos que listar.
 *
 * Vive aparte de ResumenLateral porque las vistas de "en ruta" lo necesitan
 * antes de renderizarlo: de él depende si el grid va a dos columnas o a tres.
 */
export default function hayResumen(pedido) {
  return pedido.saldo_pendiente > 0 || pedido.articulos?.length > 0 || pedido.es_shalom
}
