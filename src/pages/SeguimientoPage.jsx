import FichaPedido from '../components/seguimiento/FichaPedido'
import OrderTimeline from '../components/seguimiento/OrderTimeline'
import PreguntasFrecuentes from '../components/shared/PreguntasFrecuentes'
import VistaDelEstado from '../seguimiento/VistaDelEstado'
import { destinoDelPedido } from '../utils/destino'

/**
 * La pantalla del pedido encontrado.
 *
 * Siempre muestra lo mismo —ficha, línea de tiempo y preguntas frecuentes— y
 * en el medio deja el hueco para el diseño que le toca a ese pedido según su
 * tipo de envío y su estado. Cuál es ese diseño no se decide acá: lo resuelve
 * vistaDelEstado(), que es el único lugar donde vive esa tabla.
 */
export default function SeguimientoPage({ pedido, identidad, onPedidoUpdate }) {
  const destino = destinoDelPedido(pedido)

  return (
    <div className="w-full max-w-[1600px] min-h-screen mx-auto flex-1 flex flex-col gap-6 px-4 pt-6 pb-10 sm:px-8">
      <div className="w-full flex flex-col gap-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Sigue tu pedido</h1>
          <p className="text-sm text-gray-500 mb-0">
            Consulta el estado y la ubicación de tu pedido en tiempo real.
          </p>
        </div>

        <FichaPedido pedido={pedido} destino={destino} />

        <div className="mt-10 flex flex-col gap-12">
          <OrderTimeline
            timeline={pedido.timeline}
            estadoActual={pedido.estado_actual}
            fechaPedido={pedido.fecha_pedido}
            fechaDespacho={pedido.fecha_despacho}
            fechaEnRuta={pedido.fecha_en_ruta}
            fechaEntregado={pedido.fecha_entregado_zazu1}
            tipoEnvio={pedido.tipo_envio}
          />

          <VistaDelEstado
            pedido={pedido}
            identidad={identidad}
            onPedidoUpdate={onPedidoUpdate}
            destino={destino}
          />
        </div>

        <PreguntasFrecuentes tipoEnvio={pedido.tipo_envio} />
      </div>
    </div>
  )
}
