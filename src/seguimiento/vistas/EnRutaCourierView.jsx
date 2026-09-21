import CourierTrackingCard from '../../components/estados/CourierTrackingCard'
import AgencyMap from '../../components/mapas/AgencyMap'
import ResumenLateral from '../../components/seguimiento/ResumenLateral'
import hayResumen from '../hayResumen'

// Ilustración que reemplaza al mapa de destino para los sub-estados de Shalom
// que tienen su propio mockup (ver VARIANTES_SEGUIMIENTO en
// CourierTrackingCard.jsx). Los estados sin entrada acá siguen mostrando
// AgencyMap normalmente.
const ILUSTRACION_SEGUIMIENTO = {
  origen: {
    src: '/images/pedido-en-origen-zazu.png',
    alt: 'Paquete recibido en la agencia de origen, listo para continuar hacia destino',
  },
  transito: {
    src: '/images/pedido-en-transito-zazu.png',
    alt: 'Camión de Zazu trasladando el pedido hacia la agencia de destino',
  },
}

/**
 * Courier en ruta: el paquete está en manos de un courier externo (Shalom,
 * Olva…), no de un motorizado propio — por eso acá no hay mapa de domicilio
 * sino la tarjeta de seguimiento de la agencia y su ubicación.
 *
 * Tres columnas cuando hay resumen (tarjeta + mapa + resumen) para que las tres
 * arranquen alineadas justo debajo de la línea de tiempo.
 */
export default function EnRutaCourierView({ pedido, identidad, onPedidoUpdate, destino }) {
  const conResumen = hayResumen(pedido)
  const ilustracion = ILUSTRACION_SEGUIMIENTO[pedido.seguimiento_courier?.estado]

  return (
    <div
      className={
        conResumen
          ? 'grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] xl:grid-cols-[minmax(280px,360px)_minmax(360px,700px)_minmax(260px,320px)] xl:justify-center'
          : 'grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] lg:grid-cols-[minmax(300px,360px)_minmax(460px,700px)] lg:justify-center lg:gap-8'
      }
    >
      <CourierTrackingCard pedido={pedido} lugar={destino} />
      {ilustracion ? (
        <div className="h-64 w-full rounded-2xl md:h-95 lg:h-105">
          <img
            src={ilustracion.src}
            alt={ilustracion.alt}
            className="h-full w-full object-contain object-center"
          />
        </div>
      ) : (
        <AgencyMap
          coordenadas={pedido.destino_coordenadas}
          lugar={destino}
          className="md:h-95 lg:h-105"
        />
      )}
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
