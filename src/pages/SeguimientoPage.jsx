import ChatDelPedido from '../components/chat/ChatDelPedido'
import FichaPedido from '../components/seguimiento/FichaPedido'
import OrderTimeline from '../components/seguimiento/OrderTimeline'
import PreguntasFrecuentes from '../components/shared/PreguntasFrecuentes'
import VistaDelEstado from '../seguimiento/VistaDelEstado'
import etapaShalomCompacta from '../seguimiento/etapaShalomCompacta'
import { agenciaBase, nombreYAgencia, segmentosAgencia } from '../utils/agencia'
import { destinoDelPedido } from '../utils/destino'

/** "SAN MARTIN / SAN MARTIN / MORALES" → "Morales": el distrito, para la cabecera móvil. */
function ciudadDestino(destino) {
  const distrito = (segmentosAgencia(destino)[2] ?? '').split('/').pop()?.trim() ?? ''
  return distrito.toLowerCase().replace(/(^|\s)\p{L}/gu, (letra) => letra.toUpperCase())
}

/**
 * La pantalla del pedido encontrado.
 *
 * Siempre muestra lo mismo —ficha, línea de tiempo y preguntas frecuentes— y
 * en el medio deja el hueco para el diseño que le toca a ese pedido según su
 * tipo de envío y su estado. Cuál es ese diseño no se decide acá: lo resuelve
 * vistaDelEstado(), que es el único lugar donde vive esa tabla.
 *
 * Excepción: Shalom preparando, en ruta o entregado, en celular. Ahí la ficha y la línea de
 * tiempo se resumen en la cabecera y en la tarjeta de progreso de la propia vista,
 * para que el voucher y lo importante queden arriba (ver etapaShalomCompacta).
 *
 * Todo va dentro de ChatDelPedido para que cada vista pueda ofrecer el chat
 * con su botón "Contacta Soporte" (ver BotonContactaSoporte).
 */
export default function SeguimientoPage({ pedido, identidad, onPedidoUpdate }) {
  const destino = destinoDelPedido(pedido)
  const etapaCompacta = etapaShalomCompacta(pedido)
  const compactoMovil = Boolean(etapaCompacta)
  const soloEscritorio = compactoMovil ? 'max-md:hidden' : ''

  let subtituloMovil = null
  if (etapaCompacta === 'preparando') {
    subtituloMovil = `Pedido ${pedido.codigo} · Entrega en agencia ${agenciaBase(destino).toUpperCase()}`
  } else if (etapaCompacta === 'entregado') {
    subtituloMovil = `Pedido ${pedido.codigo} · Entregado en agencia ${nombreYAgencia(destino).toUpperCase()}`
  } else if (etapaCompacta === 'en_ruta') {
    const ciudad = ciudadDestino(destino)
    subtituloMovil = `Pedido ${pedido.codigo} · Envío por ${agenciaBase(destino).toUpperCase()}${ciudad ? ` a ${ciudad}` : ''}`
  }

  return (
    // Con `key` por pedido: al buscar otro, el chat empieza de cero con su
    // propia conversación en vez de arrastrar la del anterior.
    <ChatDelPedido key={pedido.codigo} pedido={pedido} identidad={identidad}>
      <div className="w-full max-w-[1600px] min-h-screen mx-auto flex-1 flex flex-col gap-6 px-4 pt-6 pb-10 sm:px-8">
        <div className={`w-full flex flex-col gap-8 animate-fade-in-up ${compactoMovil ? 'max-md:gap-4' : ''}`}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Sigue tu pedido</h1>
            <p className={`text-sm text-gray-500 mb-0 ${soloEscritorio}`}>
              Consulta el estado y la ubicación de tu pedido en tiempo real.
            </p>
            {subtituloMovil && <p className="mb-0 text-sm text-gray-500 md:hidden">{subtituloMovil}</p>}
          </div>

          <div className={soloEscritorio}>
            <FichaPedido pedido={pedido} destino={destino} />
          </div>

          <div className={`mt-10 flex flex-col gap-12 ${compactoMovil ? 'max-md:mt-0' : ''}`}>
            <div className={soloEscritorio}>
              <OrderTimeline
                timeline={pedido.timeline}
                estadoActual={pedido.estado_actual}
                fechaPedido={pedido.fecha_pedido}
                fechaDespacho={pedido.fecha_despacho}
                fechaEnRuta={pedido.fecha_en_ruta}
                fechaEntregado={pedido.fecha_entregado_zazu1}
                tipoEnvio={pedido.tipo_envio}
              />
            </div>

            <VistaDelEstado
              pedido={pedido}
              identidad={identidad}
              onPedidoUpdate={onPedidoUpdate}
              destino={destino}
            />
          </div>

          <div className={soloEscritorio}>
            <PreguntasFrecuentes tipoEnvio={pedido.tipo_envio} />
          </div>
        </div>
      </div>
    </ChatDelPedido>
  )
}
