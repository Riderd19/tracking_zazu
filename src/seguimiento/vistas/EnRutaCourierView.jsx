import { useState } from 'react'
import { Modal } from 'antd'
import BotonContactaSoporte from '../../components/chat/BotonContactaSoporte'
import TarjetaSoporte from '../../components/chat/TarjetaSoporte'
import CourierTrackingCard from '../../components/estados/CourierTrackingCard'
import AgencyMap from '../../components/mapas/AgencyMap'
import SaldoPendiente from '../../components/pago/SaldoPendiente'
import saldoCobrable from '../../components/pago/saldoCobrable'
import OrderItemsSummary from '../../components/seguimiento/OrderItemsSummary'
import ResumenLateral from '../../components/seguimiento/ResumenLateral'
import FotoEmpaquetado from '../../components/shalom/FotoEmpaquetado'
import ProgresoShalomMovil from '../../components/shalom/ProgresoShalomMovil'
import VoucherEnvio from '../../components/shalom/VoucherEnvio'
import { agenciaBase, nombreYAgencia } from '../../utils/agencia'
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

/** El mapa de la agencia de destino o, en los sub-estados que la tienen, su ilustración. */
function DestinoVisual({ pedido, destino, className }) {
  const ilustracion = ILUSTRACION_SEGUIMIENTO[pedido.seguimiento_courier?.estado]

  if (ilustracion) {
    return (
      <div className={`w-full rounded-2xl ${className}`}>
        <img src={ilustracion.src} alt={ilustracion.alt} className="h-full w-full object-contain object-center" />
      </div>
    )
  }

  return <AgencyMap coordenadas={pedido.destino_coordenadas} lugar={destino} className={className} />
}

/**
 * Courier Shalom en ruta.
 *
 * Escritorio, tres columnas, cada una con un propósito:
 *  - izquierda: dónde está el paquete (seguimiento de la agencia) y ayuda;
 *  - centro: lo que la clienta tiene que llevar a la agencia (el voucher, destacado)
 *    y dónde queda esa agencia;
 *  - derecha: lo que debe y lo que compró.
 *
 * Celular: las columnas se "aplanan" (`max-md:contents`) y cada bloque toma su lugar
 * con `order`: progreso, voucher, saldo, seguimiento, resumen con la foto, soporte. El
 * mapa no ocupa la pantalla: se abre desde "Ver mapa" en la tarjeta de seguimiento. La
 * ficha y la línea de tiempo completas las esconde SeguimientoPage (ver etapaShalomCompacta).
 */
function VistaShalom({ pedido, identidad, onPedidoUpdate, destino }) {
  const [mapaAbierto, setMapaAbierto] = useState(false)
  const agencia = agenciaBase(destino)

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 md:px-[4%] xl:grid-cols-[minmax(280px,340px)_minmax(380px,560px)_minmax(280px,340px)] xl:justify-center xl:px-0">
        <ProgresoShalomMovil
          paso={3}
          etiqueta="En ruta"
          insignia={
            pedido.seguimiento_courier?.mensaje && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                {pedido.seguimiento_courier.mensaje}
              </span>
            )
          }
          titulo={`Tu pedido está en manos de ${(agencia || 'el courier').toUpperCase()}`}
          className="order-0"
        />

        <div className="flex flex-col gap-4 max-md:contents">
          <CourierTrackingCard
            pedido={pedido}
            lugar={destino}
            identidad={identidad}
            compactoMovil
            onVerMapa={() => setMapaAbierto(true)}
            className="max-md:order-3"
          />
          <TarjetaSoporte tambienEnMovil className="max-md:order-6" />
        </div>

        <div className="flex flex-col gap-4 max-md:contents">
          <div className="max-md:order-1">
            <VoucherEnvio pedido={pedido} identidad={identidad} agencia={agencia} />
          </div>
          <DestinoVisual pedido={pedido} destino={destino} className="h-64! min-h-64! max-md:hidden lg:h-72! lg:min-h-72!" />
        </div>

        <div className="flex flex-col gap-4 max-md:contents md:col-span-2 md:grid md:grid-cols-2 xl:col-span-1 xl:flex xl:flex-col">
          {saldoCobrable(pedido) && (
            <div className="max-md:order-2">
              <SaldoPendiente pedido={pedido} identidad={identidad} onPedidoUpdate={onPedidoUpdate} />
            </div>
          )}
          {/* En celular, resumen y foto van en una sola tarjeta separada por una línea. */}
          <div className="flex flex-col gap-4 max-md:order-4 max-md:gap-0 max-md:divide-y max-md:divide-gray-100 max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-gray-200 max-md:bg-white">
            <OrderItemsSummary pedido={pedido} resumido className="max-md:rounded-none max-md:border-0" />
            <FotoEmpaquetado pedido={pedido} className="max-md:rounded-none max-md:border-0" />
          </div>
        </div>
      </div>

      <Modal
        open={mapaAbierto}
        onCancel={() => setMapaAbierto(false)}
        footer={null}
        centered
        title={nombreYAgencia(destino) || 'Agencia de destino'}
        destroyOnHidden
      >
        <DestinoVisual pedido={pedido} destino={destino} className="h-80! min-h-80!" />
      </Modal>
    </>
  )
}

/**
 * Courier en ruta: el paquete está en manos de un courier externo (Shalom,
 * Olva…), no de un motorizado propio — por eso acá no hay mapa de domicilio
 * sino la tarjeta de seguimiento de la agencia y su ubicación.
 *
 * Shalom tiene su propio diseño (VistaShalom), porque además hay un voucher y una
 * clave de recojo que la clienta necesita en la agencia. El resto de couriers usa el
 * de siempre: tres columnas cuando hay resumen (tarjeta + mapa + resumen) para que
 * las tres arranquen alineadas justo debajo de la línea de tiempo.
 */
export default function EnRutaCourierView({ pedido, identidad, onPedidoUpdate, destino }) {
  if (pedido.es_shalom) {
    return (
      <VistaShalom pedido={pedido} identidad={identidad} onPedidoUpdate={onPedidoUpdate} destino={destino} />
    )
  }

  const conResumen = hayResumen(pedido)

  return (
    <div
      className={
        conResumen
          ? 'grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] xl:grid-cols-[minmax(280px,360px)_minmax(360px,700px)_minmax(260px,320px)] xl:justify-center'
          : 'grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] lg:grid-cols-[minmax(300px,360px)_minmax(460px,700px)] lg:justify-center lg:gap-8'
      }
    >
      <CourierTrackingCard pedido={pedido} lugar={destino} identidad={identidad} />
      <div className="flex flex-col gap-4">
        <DestinoVisual pedido={pedido} destino={destino} className="h-64 md:h-95 lg:h-105" />
        <BotonContactaSoporte />
      </div>
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
