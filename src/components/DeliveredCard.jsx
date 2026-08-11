import { CheckCircleFilled, WhatsAppOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'

// Fecha de entrega real: pedido.fecha_entrega_real (columna real que llena el
// operador al marcar la entrega, ver Pedido::fecha_entrega_real en el
// backend). Si por algún motivo no está (pedidos viejos sin ese campo
// completado), cae al hito "entregado" del historial, y de ahí a
// fecha_actualizacion — cada vez menos exacto, pero mejor que dejarlo en blanco.
function fechaEntrega(pedido) {
  const hito = pedido.timeline?.find((h) => h.codigo === 'entregado')
  return pedido.fecha_entregado_zazu1 ?? pedido.fecha_entrega_real ?? hito?.fecha ?? pedido.fecha_actualizacion ?? null
}

// Vista de confirmación cuando el pedido ya llegó — sin mapa ni tarjeta de
// motorizado (ya no tiene sentido, el viaje terminó) y sin inventar datos que
// el backend no expone (foto de entrega, firma, etc.), solo la fecha real.
export default function DeliveredCard({ pedido }) {
  const fecha = fechaEntrega(pedido)

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-8 flex flex-col items-center text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full mb-4"
        style={{ backgroundColor: '#F0FDF4' }}
      >
        <CheckCircleFilled style={{ color: '#15803D', fontSize: 32 }} />
      </span>
      <p className="text-xl font-semibold text-gray-900 mb-1">Tu pedido fue entregado</p>
      <p className="text-sm text-gray-500 mb-6">{fecha ? `Entregado el ${fecha}` : 'Gracias por tu compra.'}</p>
      <a href={WHATSAPP_SOPORTE_LINK} target="_blank" rel="noopener noreferrer">
        <Button icon={<WhatsAppOutlined />}>¿Tuviste un problema con tu pedido?</Button>
      </a>
    </div>
  )
}
