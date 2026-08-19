import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, OverlayView } from '@react-google-maps/api'
import { useGoogleMaps } from '../contexts/GoogleMapsContext'
import AgencyMapIlustrativo from './AgencyMapIlustrativo'
import { BUILDING_ICON_PATH } from '../constants/buildingIconPath'
import { nombreYAgencia, segmentosAgencia } from '../utils/agencia'

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
}

// Cache en memoria (dura lo que dura la pestaña) para no volver a geocodificar
// la misma dirección si el componente se re-renderiza. No reemplaza cachear
// esto en el backend junto a la agencia — eso evitaría el round-trip y el
// consumo de cuota de Geocoding API en cada visita de cada usuario, esto solo
// evita repetirlo dentro de la misma sesión.
const cacheGeocodificacion = new Map()

// Arma un string geocodificable a partir de "agencia - sucursal/dirección -
// departamento/provincia/distrito" (ver segmentosAgencia). Se invierte el
// tercer segmento (dept/prov/distrito -> distrito, prov, dept) porque así es
// como se escriben las direcciones para el geocoder, de más específico a más
// general.
function direccionParaGeocodificar(lugar) {
  const segmentos = segmentosAgencia(lugar)
  if (segmentos.length < 2) return null
  const calle = segmentos[1]
  const ubicacionPolitica = segmentos[2]
    ? segmentos[2]
        .split('/')
        .map((s) => s.trim())
        .reverse()
        .join(', ')
    : ''
  return [calle, ubicacionPolitica, 'Perú'].filter(Boolean).join(', ')
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
  // Lazy init: si ya geocodificamos esta dirección antes en la sesión, se lee
  // del cache en el primer render en vez de disparar un efecto solo para eso.
  const [coordenadasGeocodificadas, setCoordenadasGeocodificadas] = useState(() => {
    if (coordenadas) return null
    const direccion = direccionParaGeocodificar(lugar)
    return direccion ? (cacheGeocodificacion.get(direccion) ?? null) : null
  })

  // Solo se dispara cuando el backend no trajo coordenadas y no había cache —
  // la agencia no está geocodificada ahí todavía. Resuelve la dirección de
  // texto (siempre presente) a lat/lng en el cliente para no depender de esa
  // carga previa.
  useEffect(() => {
    if (coordenadas || coordenadasGeocodificadas || !isLoaded || loadError) return

    const direccion = direccionParaGeocodificar(lugar)
    if (!direccion) return

    let cancelado = false
    new window.google.maps.Geocoder().geocode(
      { address: direccion, region: 'pe' },
      (resultados, status) => {
        if (cancelado || status !== 'OK' || !resultados?.[0]) return
        const punto = resultados[0].geometry.location
        const resuelto = { lat: punto.lat(), lng: punto.lng() }
        cacheGeocodificacion.set(direccion, resuelto)
        setCoordenadasGeocodificadas(resuelto)
      },
    )

    return () => {
      cancelado = true
    }
  }, [coordenadas, coordenadasGeocodificadas, lugar, isLoaded, loadError])

  const coordenadasFinal = coordenadas ?? coordenadasGeocodificadas

  const onLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  if (!coordenadasFinal || !isLoaded || loadError) {
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
        center={coordenadasFinal}
        zoom={17}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        <Marker position={coordenadasFinal} icon={icon} title={titulo} />

        {/* Globo tipo Google Maps info window, anclado a la coordenada real
            (no al centro del contenedor) — así se mueve junto con el pin al
            hacer pan/zoom en vez de quedar pegado en el mismo punto de la
            pantalla. getPixelPositionOffset centra el globo horizontalmente
            y lo sube por su alto + 27px, para que quede justo encima del pin
            con la "colita" apuntando hacia abajo, sin tocar el círculo. */}
        <OverlayView
          position={coordenadasFinal}
          mapPaneName={OverlayView.FLOAT_PANE}
          getPixelPositionOffset={(width, height) => ({ x: -width / 2, y: -height - 27 })}
        >
          <div className="flex flex-col items-center">
            <div className="max-w-60 rounded-xl bg-white px-4 py-3 shadow-lg animate-fade-in-up">
              <p className="mb-0.5 text-sm font-semibold text-gray-900">{titulo}</p>
              {subtitulo && <p className="mb-0 text-xs text-gray-500">{subtitulo}</p>}
            </div>
            <div className="-mt-1.5 h-3 w-3 rotate-45 bg-white shadow-md" />
          </div>
        </OverlayView>
      </GoogleMap>
    </div>
  )
}
