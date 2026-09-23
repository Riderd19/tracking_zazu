import OrderItemsSummary from './OrderItemsSummary'
import SaldoPendiente from '../pago/SaldoPendiente'
import CourierShalomExtras from '../shalom/CourierShalomExtras'
import DeliveryExtras from '../delivery/DeliveryExtras'

/**
 * La columna que acompaña al mapa mientras el pedido va en camino: qué compró,
 * cuánto debe y —solo en Shalom— su voucher y su clave.
 *
 * La comparten las dos vistas de "en ruta" (Delivery y Courier). Cada bloque
 * decide por su cuenta si aplica: SaldoPendiente solo con saldo por cobrar,
 * CourierShalomExtras se oculta solo cuando el pedido no es de Shalom, y
 * DeliveryExtras solo cuando `puede_editar_entrega` es true.
 *
 * `puede_editar_entrega` se calcula sobre `tickets.estado`, no sobre el
 * `estado_actual` que decide qué vista mostrar acá — son dos "carriles" de
 * estado distintos (ver PedidoEditablePorCliente). Un pedido que la página ya
 * pinta como "en ruta" puede seguir siendo editable si Zazu 1 todavía lo
 * reporta "EN CURSO", así que este bloque no se limita a "registrado" o
 * "preparando": deja que el backend decida.
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
      <DeliveryExtras pedido={pedido} identidad={identidad} onPedidoUpdate={onPedidoUpdate} />
    </div>
  )
}
