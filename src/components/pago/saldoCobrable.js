/**
 * ¿Le toca a este pedido la tarjeta de "Saldo pendiente"? Solo Courier y
 * Delivery cobran por Ligo, y solo con saldo por cobrar.
 *
 * Pagado por Ligo sigue a la vista: al confirmarse el pago el saldo baja a 0,
 * y sin esto la tarjeta —con la ventana del QR abierta adentro— desaparecía
 * justo cuando tenía que mostrar "Pago realizado" y la clave de recojo.
 *
 * Vive aparte de SaldoPendiente para no romper Fast Refresh (un archivo de
 * componente solo puede exportar componentes): la usan ResumenLateral y las
 * tarjetas de Registrado/Preparando.
 */
export default function saldoCobrable(pedido) {
  const pagadoPorLigo = pedido.ligo_payment?.status === 'pagado'

  return (
    ['COURIER', 'DELIVERY'].includes(pedido.tipo_envio?.toUpperCase()) &&
    ((pedido.saldo_pendiente > 0 && pedido.tipo_pago !== 'Pago Completo') || pagadoPorLigo)
  )
}
