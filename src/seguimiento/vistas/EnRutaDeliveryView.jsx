import DeliveryMap from '../../components/mapas/DeliveryMap'
import ResumenLateral from '../../components/seguimiento/ResumenLateral'
import hayResumen from '../hayResumen'

/**
 * Delivery en ruta: el paquete va con un motorizado propio, así que lo que
 * importa es el punto de entrega. Sin tarjeta de motorizado — hoy no hay GPS
 * en vivo, así que solo se ubica el destino (ver DeliveryMap).
 *
 * Es el único estado donde Delivery y Courier muestran cosas distintas: el
 * equivalente de Courier es EnRutaCourierView, con la agencia en vez del mapa
 * de domicilio.
 */
export default function EnRutaDeliveryView({ pedido, identidad, onPedidoUpdate }) {
  const conResumen = hayResumen(pedido)

  return (
    <div
      className={
        conResumen
          ? 'grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(360px,1fr)_minmax(260px,320px)]'
          : 'grid grid-cols-1 gap-5'
      }
    >
      <DeliveryMap destino={pedido.destino_coordenadas} className="lg:h-105" />
      {conResumen && (
        <ResumenLateral
          pedido={pedido}
          identidad={identidad}
          onPedidoUpdate={onPedidoUpdate}
        />
      )}
    </div>
  )
}
