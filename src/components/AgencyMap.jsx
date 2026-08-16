import { useCallback, useRef } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMaps } from '../contexts/GoogleMapsContext'
import AgencyMapIlustrativo from './AgencyMapIlustrativo'
import { BUILDING_ICON_PATH } from '../constants/buildingIconPath'
import { nombreYAgencia, segmentosAgencia } from '../utils/agencia'

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
}

// Mapa de la agencia de destino (pedidos COURIER en ruta) — a diferencia de
// DeliveryMap, acá no hay un motorizado en vivo que rastrear (el paquete ya
// está en manos del courier externo), solo el punto fijo de la sede. Un solo
// pin, sin ruta ni Directions API. `lugar` es el mismo string que "Destino"
// en OrderSummaryCard (agencia - sucursal - ubicación) — el globo muestra
// agencia+sucursal en la primera línea y la ubicación política en la
// segunda, igual división que ya usa CourierTrackingCard.
export default function AgencyMap({ coordenadas, lugar, className = '' }) {
  const { isLoaded, loadError } = useGoogleMaps()
  const mapRef = useRef(null)
  const titulo = nombreYAgencia(lugar)
  const subtitulo = segmentosAgencia(lugar)[2] ?? null

  const onLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  if (!coordenadas || !isLoaded || loadError) {
    return <AgencyMapIlustrativo titulo={titulo} subtitulo={subtitulo} className={className} />
  }

  // Mismo círculo violeta con marca Zazu que los pines de DeliveryMap, pero
  // con el ícono de edificio en vez de casa/moto — para que se vea
  // consistente con el resto del mapa.
  const iconUrl =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="#6d28d9" stroke="#fff" stroke-width="3"/>
        <g transform="translate(22 22) scale(0.55) translate(-16 -16)">
          <path d="${BUILDING_ICON_PATH}" fill="#F9FAFB"/>
        </g>
      </svg>
    `)
  const icon = {
    url: iconUrl,
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22),
  }

  return (
    <div
      className={`relative w-full min-h-[320px] h-full rounded-2xl overflow-hidden border border-gray-100 ${className}`}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={coordenadas}
        zoom={17}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        <Marker position={coordenadas} icon={icon} title={titulo} />
      </GoogleMap>

      {/* Globo tipo Google Maps info window: centrado sobre el pin (que
          queda al centro del mapa, ya que coordenadas = center), con la
          "colita" apuntando hacia abajo. bottom: 50% + radio del pin (19px)
          + margen, para que el globo no se pegue al círculo. */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        style={{ bottom: 'calc(50% + 27px)' }}
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
