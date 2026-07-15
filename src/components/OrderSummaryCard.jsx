import { Card } from 'antd'
import { InboxOutlined, ClockCircleOutlined } from '@ant-design/icons'
import EstadoBadge from './EstadoBadge'
import OrderTimeline from './OrderTimeline'

// Texto de apoyo bajo el badge de estado. Se indexa por nombre (igual que
// los íconos del timeline) porque el backend entrega nombres libres, no un
// enum fijo de códigos. Cubre los 12 estados de tipo "pedido" que existen
// hoy (ver EstadosSeeder + migraciones de despachado/en_ruta).
const LEYENDAS_ESTADO = {
  Pendiente: 'Tu pedido está pendiente de confirmación.',
  Confirmado: 'Tu pedido fue confirmado.',
  'En preparación': 'Tu pedido se está preparando.',
  'Listo para envío': 'Tu pedido está listo para ser enviado.',
  Procesado: 'Tu pedido fue procesado.',
  Registrado: 'Tu pedido fue registrado y pronto será preparado.',
  Despachado: 'Tu pedido fue despachado y espera asignación de repartidor.',
  'En Ruta': 'Tu pedido está en camino con un repartidor asignado.',
  Enviado: 'Tu pedido fue enviado.',
  Entregado: 'Tu pedido fue entregado con éxito.',
  Devuelto: 'Tu pedido fue devuelto.',
  Cancelado: 'Tu pedido fue cancelado.',
}

function obtenerLeyenda(estado) {
  return LEYENDAS_ESTADO[estado?.nombre] ?? 'Sigue el detalle de tu pedido más abajo.'
}

export default function OrderSummaryCard({ pedido }) {
  const { codigo, destinatario_nombre, estado_actual, timeline, fecha_estimada_entrega } = pedido

  return (
    <Card className="border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 text-lg">
            <InboxOutlined />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Pedido {codigo}</p>
            <p className="text-xs text-gray-500 mb-0">Cliente: {destinatario_nombre}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 text-lg">
            <ClockCircleOutlined />
          </span>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Entrega estimada</p>
            <p className="text-sm font-semibold text-gray-900 mb-0">
              {fecha_estimada_entrega ?? 'No disponible'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <EstadoBadge estado={estado_actual} />
          <p className="text-xs text-gray-500 mb-0 sm:text-right">{obtenerLeyenda(estado_actual)}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-5">
        <OrderTimeline timeline={timeline} estadoActual={estado_actual} />
      </div>
    </Card>
  )
}
