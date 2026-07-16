import { HomeFilled } from '@ant-design/icons'

// Mapa ilustrativo: todavía no existe infraestructura de GPS en vivo para
// motorizados ni coordenadas del destinatario expuestas por el backend
// público (ver TrackingPublicController). El nombre del motorizado y la hora
// estimada sí son reales (vienen del pedido); la ruta punteada y la posición
// del pin son decorativas. Cuando exista GPS real, reemplazar por un mapa
// real (Google Maps / Mapbox) posicionado con las coordenadas reales.
export default function DeliveryMap({ motorizado, className = '' }) {
  const { nombre, hora_llegada_estimada: horaLlegadaEstimada } = motorizado
  const primerNombre = nombre.split(' ')[0]

  return (
    <div
      className={`relative w-full min-h-[320px] h-full rounded-2xl overflow-hidden border border-gray-100 bg-[#eef1f6] ${className}`}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 320" preserveAspectRatio="none">
        <rect width="400" height="320" fill="#eef1f6" />
        <g stroke="#dfe3ee" strokeWidth="6">
          <line x1="0" y1="60" x2="400" y2="60" />
          <line x1="0" y1="150" x2="400" y2="150" />
          <line x1="0" y1="250" x2="400" y2="250" />
          <line x1="80" y1="0" x2="80" y2="320" />
          <line x1="200" y1="0" x2="200" y2="320" />
          <line x1="320" y1="0" x2="320" y2="320" />
        </g>
        <path
          d="M 68 250 C 68 190, 140 190, 140 150 S 258 112, 258 90 S 322 52, 332 42"
          fill="none"
          stroke="#6d28d9"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1 10"
        />
      </svg>

      <div
        className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white text-base shadow-lg animate-pulse-soft"
        style={{ left: '17%', top: '78%', transform: 'translate(-50%, -50%)' }}
      >
        🛵
      </div>

      <div
        className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white text-base shadow-lg"
        style={{ left: '83%', top: '13%', transform: 'translate(-50%, -50%)' }}
      >
        <HomeFilled />
      </div>

      <div
        className="absolute w-48 rounded-xl bg-white shadow-lg px-3 py-2.5 animate-fade-in-up"
        style={{ left: '17%', top: '78%', transform: 'translate(8%, -175%)' }}
      >
        <p className="text-xs font-semibold text-gray-900 mb-1">Motorizado: {primerNombre}</p>
        <p className="text-[11px] text-gray-500 mb-0">
          Llegada aprox.: {horaLlegadaEstimada ?? 'no disponible'}
        </p>
      </div>
    </div>
  )
}
