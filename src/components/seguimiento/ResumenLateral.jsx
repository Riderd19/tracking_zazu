import OrderItemsSummary from './OrderItemsSummary'
import SaldoPendiente from '../pago/SaldoPendiente'
import CourierShalomExtras from '../shalom/CourierShalomExtras'

/**
 * La columna que acompaña al mapa mientras el pedido va en camino: qué compró,
 * cuánto debe y —solo en Shalom— su voucher y su clave.
 *
 * La comparten las dos vistas de "en ruta" (Delivery y Courier). Cada bloque
 * decide por su cuenta si aplica: SaldoPendiente solo con saldo por cobrar, y
 * CourierShalomExtras se oculta solo cuando el pedido no es de Shalom.
 */
export default function ResumenLateral({ pedido, identidad, onPedidoUpdate }) {
  const cobrable =
    ['COURIER', 'DELIVERY'].includes(pedido.tipo_envio?.toUpperCase()) &&
    pedido.saldo_pendiente > 0 &&
    pedido.tipo_pago !== 'Pago Completo'

  return (
    <div className="flex flex-col gap-5">
      <OrderItemsSummary pedido={pedido} compactoConModal />
      {cobrable && (
        <SaldoPendiente
          pedido={pedido}
          identidad={identidad}
          onPedidoUpdate={onPedidoUpdate}
        />
      )}
      <CourierShalomExtras pedido={pedido} identidad={identidad} />
    </div>
  )
}
