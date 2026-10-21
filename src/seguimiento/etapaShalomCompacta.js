/**
 * Si el pedido es de Courier Shalom en una etapa con diseño móvil propio, cuál:
 * 'preparando', 'en_ruta' o 'entregado'. null en cualquier otro caso.
 *
 * 'preparando' agrupa despachado y picking, igual que VistaDelEstado.
 *
 * En esas etapas, en celular, la ficha y la línea de tiempo completas se reemplazan por
 * una cabecera y una tarjeta de progreso compactas (ver ProgresoShalomMovil), para que
 * el voucher y lo importante queden arriba. Vive aparte porque lo necesitan la página
 * (para esconder la ficha y armar el subtítulo) y las vistas.
 */
export default function etapaShalomCompacta(pedido) {
  if (!pedido?.es_shalom || (pedido.tipo_envio ?? '').toUpperCase() !== 'COURIER') return null

  const estado = pedido.estado_actual?.codigo
  if (estado === 'despachado' || estado === 'picking') return 'preparando'
  return estado === 'en_ruta' || estado === 'entregado' ? estado : null
}
