import { InboxOutlined } from '@ant-design/icons'
import ClockIcon from './icons/ClockIcon'
import LocationDotIcon from './icons/LocationDotIcon'
import BuildingIcon from './icons/BuildingIcon'
import OrderTimeline from './OrderTimeline'
import SaldoPendiente from './SaldoPendiente'

// Bloque ícono + 2 líneas de texto. `enfasisArriba` decide cuál línea va en
// negrita: el primer campo (Pedido/Cliente) destaca el código arriba, los
// demás destacan el valor abajo (igual patrón que ya usaba "Entrega estimada").
// Colores, tamaños y tipografía calcados del inspector de Figma (Dev Mode):
// círculo bg gray-100/ícono gray-700 a 58px, texto 14px/20px, valores peso 600
// en gray-900, etiquetas peso 500 en gray-700 (peso 400 solo para "Cliente: ...").
// Ninguna línea trunca con "...": un código de pedido o una dirección larga se
// cortaban sin forma de leerlos completos. Por defecto se ajustan a varias
// líneas; `abajoSinAjuste` (Destino) en cambio fuerza una sola fila completa —
// el scroll horizontal queda aislado a esa línea (no al campo entero ni al
// grid completo), así funciona igual sin importar el ancho de pantalla o
// cuántas columnas tenga el grid en cada breakpoint.
function Campo({ icon, arriba, abajo, enfasisArriba = false, abajoSinAjuste = false }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
        {icon}
      </span>
      <div className="min-w-0 flex flex-col gap-2">
        <p
          className={`mb-0 break-words text-sm leading-5 ${
            enfasisArriba ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
          }`}
        >
          {arriba}
        </p>
        {abajoSinAjuste ? (
          <div className="overflow-x-auto">
            <p
              className={`mb-0 whitespace-nowrap text-sm leading-5 ${
                enfasisArriba ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
              }`}
            >
              {abajo}
            </p>
          </div>
        ) : (
          <p
            className={`mb-0 break-words text-sm leading-5 ${
              enfasisArriba ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
            }`}
          >
            {abajo}
          </p>
        )}
      </div>
    </div>
  )
}

// El backend a veces guarda la dirección con el Plus Code de Google delante
// (ej. "V3P7+HXQ, Huaca del Sol...") — es un código interno de geocodificación,
// no aporta nada al cliente y solo ocupa espacio.
function quitarPlusCode(direccion) {
  return direccion.replace(/^\S+\+\S+,\s*/, '')
}

export default function OrderSummaryCard({ pedido }) {
  const {
    codigo,
    destinatario_nombre,
    destinatario_direccion,
    empresa,
    tipo_envio,
    estado_actual,
    timeline,
    fecha_pedido,
    fecha_envio,
    codigo_courier,
    guia_courier,
    fecha_despacho,
    fecha_en_ruta,
    fecha_entregado_zazu1,
    sede_entrega,
    saldo_pendiente,
  } = pedido

  // Si el pedido es de recojo en tienda, el "destino" es la sede, no la
  // dirección del destinatario (que puede no aplicar o venir vacía).
  const destinoCompleto = sede_entrega?.direccion ?? destinatario_direccion ?? 'No disponible'
  const destino = quitarPlusCode(destinoCompleto)

  return (
    <div>
      <div className="rounded bg-gray-50 p-6 grid grid-cols-1 sm:grid-cols-[repeat(2,max-content)] sm:justify-between gap-x-5 gap-y-5 lg:flex lg:flex-nowrap lg:items-start lg:[&>*:last-child]:-translate-x-4">
        <Campo
          icon={<InboxOutlined className="text-xl" />}
          arriba={`Pedido ${codigo}`}
          abajo={`Cliente: ${destinatario_nombre}`}
          enfasisArriba
        />
        {/* Línea divisoria como elemento propio, con el mismo gap-x-8 fijo a
            cada lado (ver flex arriba) — queda centrada en el hueco entre
            campos, y los 3 huecos miden exactamente lo mismo sin importar el
            largo del contenido de cada campo. */}
        <span className="hidden lg:block w-px shrink-0 bg-gray-200 self-stretch" />
        <Campo icon={<BuildingIcon className="w-6 h-6" />} arriba="Empresa" abajo={empresa ?? 'No disponible'} />
        <span className="hidden lg:block w-px shrink-0 bg-gray-200 self-stretch" />
        <Campo icon={<LocationDotIcon className="w-6 h-6" />} arriba="Destino" abajo={destino} abajoSinAjuste />
        <span className="hidden lg:block w-px shrink-0 bg-gray-200 self-stretch" />
        <div className="flex min-w-0 flex-col gap-2">
          <Campo icon={<ClockIcon className="w-6 h-6" />} arriba="Fecha de envío" abajo={fecha_envio ?? 'No disponible'} />
          {(codigo_courier || guia_courier) && (
            <div className="ml-14 flex min-w-0 gap-x-4 text-xs leading-4 text-gray-700">
              {codigo_courier && (
                <p className="mb-0 whitespace-nowrap"><span className="font-medium">Código:</span> {codigo_courier}</p>
              )}
              {guia_courier && (
                <p className="mb-0 whitespace-nowrap"><span className="font-medium">Guía:</span> {guia_courier}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <OrderTimeline
            timeline={timeline}
            estadoActual={estado_actual}
            fechaPedido={fecha_pedido}
            fechaDespacho={fecha_despacho}
            fechaEnRuta={fecha_en_ruta}
            fechaEntregado={fecha_entregado_zazu1}
          />
        </div>
        {['COURIER', 'DELIVERY'].includes(tipo_envio?.toUpperCase()) && saldo_pendiente > 0 && (
          <SaldoPendiente monto={saldo_pendiente} />
        )}
      </div>
    </div>
  )
}
