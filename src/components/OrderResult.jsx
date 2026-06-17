import { Card, Button } from 'antd'
import { ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons'
import OrderTimeline from './OrderTimeline'
import EstadoBadge from './EstadoBadge'

export default function OrderResult({ pedido, onVolver }) {
  const {
    codigo,
    destinatario_nombre,
    estado_actual,
    timeline,
    sede_entrega,
    fecha_pedido,
    fecha_estimada_entrega,
  } = pedido

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in-up">
      <Card className="border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Código de pedido</p>
            <p className="text-base font-semibold text-gray-800 mb-0">{codigo}</p>
          </div>
          <EstadoBadge estado={estado_actual} />
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm border-t border-gray-100 pt-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Destinatario</span>
            <span className="text-gray-700 font-medium">{destinatario_nombre}</span>
          </div>
          {sede_entrega && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Sede</span>
                <span className="text-gray-700 font-medium text-right">
                  <EnvironmentOutlined className="mr-1" />
                  {sede_entrega.nombre}
                </span>
              </div>
              <div className="text-right text-xs text-gray-400">
                {[
                  sede_entrega.direccion,
                  sede_entrega.distrito,
                  sede_entrega.provincia,
                  sede_entrega.departamento,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </>
          )}
          {fecha_pedido && (
            <div className="flex justify-between">
              <span className="text-gray-400">Fecha de pedido</span>
              <span className="text-gray-700 font-medium">{fecha_pedido}</span>
            </div>
          )}
          {fecha_estimada_entrega && (
            <div className="flex justify-between">
              <span className="text-gray-400">Entrega estimada</span>
              <span className="text-gray-700 font-medium">{fecha_estimada_entrega}</span>
            </div>
          )}
        </div>
      </Card>

      <Card title="Estado del pedido" className="border-gray-100">
        <OrderTimeline timeline={timeline} estadoActual={estado_actual} />
      </Card>

      <Button icon={<ArrowLeftOutlined />} onClick={onVolver} block size="large">
        Buscar otro pedido
      </Button>
    </div>
  )
}
