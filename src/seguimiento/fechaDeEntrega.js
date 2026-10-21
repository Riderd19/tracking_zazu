/**
 * Cuándo se entregó el pedido, en el texto crudo que manda el backend ("d/m/Y H:i").
 *
 * Por orden de confianza: la fecha que reportó Zazu 1, la real de entrega, el hito
 * "entregado" de la línea de tiempo y, en último caso, la última actualización.
 * La comparten DeliveredCard y la vista de entregado de Shalom.
 */
export default function fechaDeEntrega(pedido) {
  const hito = pedido.timeline?.find((item) => item.codigo === 'entregado')
  return pedido.fecha_entregado_zazu1 ?? pedido.fecha_entrega_real ?? hito?.fecha ?? pedido.fecha_actualizacion ?? null
}
