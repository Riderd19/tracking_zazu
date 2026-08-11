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
// Ninguna línea trunca por defecto: un código de pedido o una dirección
// larga se cortaban con "..." sin forma de leerlos completos. Excepción:
// `abajoUnaLinea` (usado en Destino) para direcciones largas que deben caber
// en una sola línea con "..." en vez de partirse en dos.
function Campo({ icon, arriba, abajo, enfasisArriba = false, abajoUnaLinea = false }) {
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
        <p
          className={`mb-0 text-sm leading-5 ${abajoUnaLinea ? 'truncate' : 'break-words'} ${
            enfasisArriba ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
          }`}
          title={abajoUnaLinea ? abajo : undefined}
        >
          {abajo}
        </p>
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
    estado_actual,
    timeline,
    fecha_pedido,
    fecha_envio,
    sede_entrega,
    saldo_pendiente,
  } = pedido

  // Si el pedido es de recojo en tienda, el "destino" es la sede, no la
  // dirección del destinatario (que puede no aplicar o venir vacía).
  const destinoCompleto = sede_entrega?.direccion ?? destinatario_direccion ?? 'No disponible'
  const destino = quitarPlusCode(destinoCompleto)

  return (
    <div>
      <div className="rounded bg-gray-50 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_1.4fr_0.9fr] gap-x-8 gap-y-5 lg:items-start lg:divide-x lg:divide-gray-200">
        <Campo
          icon={<InboxOutlined className="text-xl" />}
          arriba={`Pedido ${codigo}`}
          abajo={`Cliente: ${destinatario_nombre}`}
          enfasisArriba
        />
        <Campo icon={<BuildingIcon className="w-6 h-6" />} arriba="Empresa" abajo={empresa ?? 'No disponible'} />
        <Campo icon={<LocationDotIcon className="w-6 h-6" />} arriba="Destino" abajo={destino} abajoUnaLinea />
        <Campo icon={<ClockIcon className="w-6 h-6" />} arriba="Fecha de envío" abajo={fecha_envio ?? 'No disponible'} />
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <OrderTimeline timeline={timeline} estadoActual={estado_actual} fechaPedido={fecha_pedido} />
        </div>
        {/* Oculto por ahora a pedido del usuario — ver SaldoPendiente.jsx, no se eliminó el componente. */}
        {false && saldo_pendiente > 0 && <SaldoPendiente monto={saldo_pendiente} />}
      </div>
    </div>
  )
}
