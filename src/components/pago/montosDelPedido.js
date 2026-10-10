/**
 * Total, pagado y por pagar del pedido.
 *
 * `total_pagado` fue durante un tiempo el monto total tal cual (un Contra
 * Entrega sin pagar figuraba "pagado" entero). El backend nuevo manda
 * `total_pedido` / `total_pagado` / `por_pagar`; con el anterior se reconstruye
 * igual: su `total_pagado` es el total, y lo que falta es `saldo_pendiente`
 * salvo que el pedido ya sea Pago Completo.
 *
 * Vive aparte para que el resumen del pedido y la tarjeta de SaldoPendiente
 * saquen el total de la misma regla.
 */
export default function montosDelPedido(pedido) {
  const total = Number(pedido.total_pedido ?? pedido.total_pagado ?? 0);
  const porPagar =
    pedido.por_pagar !== undefined
      ? Number(pedido.por_pagar)
      : pedido.tipo_pago === "Pago Completo"
        ? 0
        : Math.min(total, Math.max(0, Number(pedido.saldo_pendiente ?? 0)));

  return { total, porPagar, pagado: Math.max(0, total - porPagar) };
}
