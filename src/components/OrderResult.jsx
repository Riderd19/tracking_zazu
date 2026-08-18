import OrderSummaryCard from './OrderSummaryCard'
import DriverCard from './DriverCard'
import DeliveryMap from './DeliveryMap'
import OrderItemsSummary from './OrderItemsSummary'
import SaldoPendiente from './SaldoPendiente'

// El repartidor y el mapa solo tienen sentido cuando ya hay alguien en camino
// Y el pedido trae un motorizado asignado (ver TrackingPublicController::mapMotorizado).
// Antes de "En Ruta", o si por algún motivo no hay match de motorizado, mostrarlos
// sería engañoso.
const CODIGO_EN_RUTA = 'en_ruta'

export default function OrderResult({ pedido }) {
  const enRuta = pedido.estado_actual?.codigo === CODIGO_EN_RUTA && pedido.motorizado
  // Mismo criterio que OrderSummaryCard para el courier en ruta: sin artículos
  // ni saldo pendiente, la columna de resumen no tiene nada que mostrar.
  const hayResumen = pedido.saldo_pendiente > 0 || pedido.articulos?.length > 0

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Sigue tu pedido</h1>
        <p className="text-sm text-gray-500 mb-0">
          Consulta el estado y la ubicación de tu pedido en tiempo real.
        </p>
      </div>

      <OrderSummaryCard pedido={pedido} />

      {enRuta && (
        <div
          className={
            hayResumen
              ? 'grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(280px,360px)_minmax(360px,1fr)_minmax(260px,320px)]'
              : 'grid grid-cols-1 gap-5 lg:grid-cols-3'
          }
        >
          <DriverCard motorizado={pedido.motorizado} className={hayResumen ? '' : 'lg:col-span-1'} />
          <DeliveryMap
            motorizado={pedido.motorizado}
            destino={pedido.destino_coordenadas}
            className={hayResumen ? '' : 'lg:col-span-2'}
          />
          {hayResumen && (
            <div className="flex flex-col gap-5">
              <OrderItemsSummary pedido={pedido} compactoConModal />
              {pedido.saldo_pendiente > 0 && pedido.tipo_pago !== 'Pago Completo' && (
                <SaldoPendiente monto={pedido.saldo_pendiente} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
