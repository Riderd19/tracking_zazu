import { Card, Button } from 'antd'
import { EnvironmentOutlined, CarOutlined, CustomerServiceOutlined } from '@ant-design/icons'

// motorizado = { nombre, placa, hora_llegada_estimada } — datos reales del backend
// (ver TrackingPublicController::mapMotorizado). hora_llegada_estimada puede venir
// null si el pedido todavía no tiene ese dato calculado.
export default function DriverCard({ motorizado, className = '' }) {
  const { nombre, placa, hora_llegada_estimada: horaLlegadaEstimada } = motorizado

  return (
    <Card className={`border-gray-100 h-full ${className}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 mb-3">
        <EnvironmentOutlined /> Tu pedido está en camino
      </span>

      <p className="text-xs text-gray-500 mb-1">Llegada aproximada</p>
      <p className="text-4xl font-bold text-gray-900 mb-4">
        {horaLlegadaEstimada ?? 'No disponible'}
      </p>

      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 p-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">
          🛵
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{nombre}</p>
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 font-medium">
            <CarOutlined /> {placa}
          </span>
        </div>
      </div>

      <Button icon={<CustomerServiceOutlined />} block className="mt-4">
        ¿Necesitas ayuda?
      </Button>
    </Card>
  )
}
