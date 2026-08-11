import { Card, Button } from 'antd'
import {
  EnvironmentOutlined,
  CustomerServiceOutlined,
  StarFilled,
  UserOutlined,
  IdcardOutlined,
} from '@ant-design/icons'
import { MOTORIZADO_RATING_EJEMPLO, MOTORIZADO_ENTREGAS_EJEMPLO } from '../constants/motorizadoEjemplo'

// motorizado = { nombre, placa, foto_url, hora_llegada_estimada } — datos reales
// del backend (ver TrackingPublicController::mapMotorizado). foto_url es la foto
// real subida al registrar al motorizado en el admin (MotorizadosPage.jsx),
// mismo endpoint público /media que ya usa el admin — no un placeholder. Si el
// motorizado no tiene foto subida, cae a una ilustración genérica en vez de un
// hueco vacío. Rating/entregas son dato de ejemplo (ver
// constants/motorizadoEjemplo.js) — decisión explícita del producto de
// mostrarlos aunque no existan en el backend.
// Colores/tamaños calcados del inspector de Figma (Dev Mode): badge verde con
// borde, hora en 40px, línea divisoria, y sobre todo la foto mucho más grande
// y enmarcada (antes 64x64 perdida junto al texto) para que se aprecie bien.
export default function DriverCard({ motorizado, className = '' }) {
  const { nombre, placa, foto_url: fotoUrl, hora_llegada_estimada: horaLlegadaEstimada } = motorizado

  return (
    <Card className={`border-[#E4E7EC] h-full ${className}`}>


      <p className="text-xl font-semibold text-gray-900 mb-1 leading-7">Tu pedido está en camino</p>
      <p className="text-sm text-gray-700 mb-1">Llegada aproximada: </p>
      <p className="text-[40px] leading-[48px] font-bold text-gray-900 mb-4">
        {horaLlegadaEstimada ?? 'No disponible'}
      </p>

      <div className="border-t border-gray-200 pt-4 flex items-start gap-4">
        <span className="flex w-28 h-32 shrink-0 items-center justify-center rounded-xl overflow-hidden p-1.5" style={{ backgroundColor: '#FAF6FC' }}>
          {fotoUrl ? (
            <img src={fotoUrl} alt={nombre} className="h-full w-full object-cover object-top rounded-lg" />
          ) : (
            <svg viewBox="0 0 64 64" className="h-full w-auto" aria-hidden>
              <rect width="64" height="64" fill="#ede9fe" />
              <circle cx="32" cy="25" r="12" fill="#a78bfa" />
              <path d="M6 63c0-13.8 11.6-23 26-23s26 9.2 26 23" fill="#a78bfa" />
            </svg>
          )}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <StarFilled style={{ color: '#FCD34D' }} /> {MOTORIZADO_RATING_EJEMPLO.toFixed(1)}
            </span>
            <span className="h-4 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-700">{MOTORIZADO_ENTREGAS_EJEMPLO} entregas</span>
          </div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 truncate">
            <UserOutlined /> {nombre}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <IdcardOutlined /> {placa}
          </span>
        </div>
      </div>

      <Button
        icon={<CustomerServiceOutlined />}
        block
        className="mt-4 !bg-gray-50 !border-gray-200 !text-gray-900 !font-medium"
      >
        ¿Necesitas ayuda?
      </Button>
    </Card>
  )
}
