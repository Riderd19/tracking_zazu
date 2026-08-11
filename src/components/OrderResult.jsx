import OrderSummaryCard from './OrderSummaryCard'
import DriverCard from './DriverCard'
import DeliveryMap from './DeliveryMap'
import DeliveredCard from './DeliveredCard'

// El repartidor y el mapa solo tienen sentido cuando ya hay alguien en camino
// Y el pedido trae un motorizado asignado (ver TrackingPublicController::mapMotorizado).
// Antes de "En Ruta", o si por algún motivo no hay match de motorizado, mostrarlos
// sería engañoso.
const CODIGO_EN_RUTA = 'en_ruta'
const CODIGO_ENTREGADO = 'entregado'

export default function OrderResult({ pedido }) {
  const enRuta = pedido.estado_actual?.codigo === CODIGO_EN_RUTA && pedido.motorizado
  const entregado = pedido.estado_actual?.codigo === CODIGO_ENTREGADO

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <DriverCard motorizado={pedido.motorizado} className="lg:col-span-1" />
          <DeliveryMap
            motorizado={pedido.motorizado}
            destino={pedido.destino_coordenadas}
            className="lg:col-span-2"
          />
        </div>
      )}

      {entregado && <DeliveredCard pedido={pedido} />}
    </div>
  )
}
