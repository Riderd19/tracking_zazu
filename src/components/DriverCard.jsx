import { Card, Avatar, Button } from 'antd'
import { EnvironmentOutlined, StarFilled, CarOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import { REPARTIDOR_EJEMPLO } from '../constants/repartidorEjemplo'

export default function DriverCard({ className = '' }) {
  const { nombre, rating, entregas, placa, etaMinutos } = REPARTIDOR_EJEMPLO
  const iniciales = nombre
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .slice(0, 2)

  return (
    <Card className={`border-gray-100 h-full ${className}`}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 mb-3">
        <EnvironmentOutlined /> Cerca de tu domicilio
      </span>

      <p className="text-sm font-semibold text-gray-900 mb-0.5">Tu pedido está en camino</p>
      <p className="text-xs text-gray-500 mb-1">Llegada aproximada en</p>
      <p className="text-4xl font-bold text-gray-900 mb-4">{etaMinutos} min</p>

      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <Avatar size={48} className="font-semibold shrink-0" style={{ backgroundColor: '#7c3aed', color: '#fff' }}>
          {iniciales}
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{nombre}</p>
          <p className="text-xs text-gray-500 mb-0.5">
            <StarFilled className="text-amber-400" /> {rating.toFixed(1)} · {entregas} entregas
          </p>
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
