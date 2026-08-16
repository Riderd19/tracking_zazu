import BuildingIcon from './icons/BuildingIcon'

// Respaldo cuando no hay coordenadas de la agencia, o el mapa real (Google
// Maps) no cargó. A diferencia de DeliveryMapIlustrativo, acá no hay
// motorizado ni ruta que dibujar — solo el punto fijo de la agencia, así
// que el pin queda centrado sin animación de recorrido.
export default function AgencyMapIlustrativo({ titulo, subtitulo, className = '' }) {
  return (
    <div
      className={`relative w-full min-h-[320px] h-full rounded-2xl overflow-hidden border border-gray-100 bg-[#e9edf5] ${className}`}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 320" preserveAspectRatio="none">
        <rect width="400" height="320" fill="#e9edf5" />
        {/* "manzanas" para simular bloques urbanos, no direcciones reales */}
        <g fill="#dde3ee">
          <rect x="8" y="8" width="64" height="44" rx="4" />
          <rect x="90" y="8" width="100" height="44" rx="4" />
          <rect x="210" y="8" width="80" height="44" rx="4" />
          <rect x="8" y="66" width="64" height="76" rx="4" />
          <rect x="210" y="66" width="80" height="76" rx="4" />
          <rect x="8" y="160" width="64" height="60" rx="4" />
          <rect x="90" y="160" width="100" height="60" rx="4" />
          <rect x="8" y="238" width="64" height="74" rx="4" />
          <rect x="90" y="238" width="100" height="74" rx="4" />
          <rect x="210" y="238" width="80" height="74" rx="4" />
        </g>
        <g stroke="#c7cfe0" strokeWidth="7">
          <line x1="0" y1="60" x2="400" y2="60" />
          <line x1="0" y1="150" x2="400" y2="150" />
          <line x1="0" y1="230" x2="400" y2="230" />
          <line x1="80" y1="0" x2="80" y2="320" />
          <line x1="200" y1="0" x2="200" y2="320" />
          <line x1="300" y1="0" x2="300" y2="320" />
        </g>
      </svg>

      <div
        className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white text-sm shadow-lg"
        style={{ left: '50%', top: '48%', transform: 'translate(-50%, -50%)' }}
      >
        <BuildingIcon className="h-4 w-4" />
      </div>

      <div
        className="absolute flex flex-col items-center"
        style={{ left: '50%', top: '48%', transform: 'translate(-50%, calc(-100% - 27px))' }}
      >
        <div className="max-w-60 rounded-xl bg-white px-4 py-3 shadow-lg animate-fade-in-up">
          <p className="mb-0.5 text-sm font-semibold text-gray-900">{titulo}</p>
          {subtitulo && <p className="mb-0 text-xs text-gray-500">{subtitulo}</p>}
        </div>
        <div className="-mt-1.5 h-3 w-3 rotate-45 bg-white shadow-md" />
      </div>
    </div>
  )
}
