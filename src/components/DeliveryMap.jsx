import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { useGoogleMaps } from '../contexts/GoogleMapsContext'
import DeliveryMapIlustrativo from './DeliveryMapIlustrativo'
import { MOTORCYCLE_ICON_PATH } from '../constants/motorcycleIconPath'
import { HOME_ICON_PATH } from '../constants/homeIconPath'

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
}

const RUTA_OPTIONS = {
  suppressMarkers: true, // usamos nuestros propios Marker, no los A/B de Directions
  polylineOptions: { strokeColor: '#6d28d9', strokeWeight: 4 },
}

// "hace 42 seg" / "hace 3 min" / "hace 5 h" / "hace 2 d" — actualizada_hace_segundos
// viene calculado del backend en cada respuesta, no se recalcula en el cliente
// (evita que se desincronice con la hora real del servidor). No hay límite de
// antigüedad para mostrar el mapa real (ver DeliveryMap más abajo), así que esto
// debe poder expresar datos viejos con la misma honestidad que datos recientes.
function formatoAntiguedad(segundos) {
  if (segundos < 60) return `hace ${segundos} seg`
  if (segundos < 3600) return `hace ${Math.round(segundos / 60)} min`
  if (segundos < 86400) return `hace ${Math.round(segundos / 3600)} h`
  return `hace ${Math.round(segundos / 86400)} d`
}

// Rumbo (0-360°, 0 = norte, 90 = este) del punto A al punto B. Fórmula
// estándar de bearing entre dos coordenadas, no depende de ninguna librería.
function calcularRumbo(origen, puntoDestino) {
  const aRad = (deg) => (deg * Math.PI) / 180
  const aGrados = (rad) => (rad * 180) / Math.PI
  const lat1 = aRad(origen.lat)
  const lat2 = aRad(puntoDestino.lat)
  const dLng = aRad(puntoDestino.lng - origen.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (aGrados(Math.atan2(y, x)) + 360) % 360
}

// Cuánto hay que rotar el ícono (sentido horario) para que, con rumbo 0
// (norte), quede mirando hacia arriba. El ícono de motorizado (ver
// motorcycleIconPath.js) mira hacia la izquierda (oeste = 270°) sin rotar —
// verificado renderizándolo grande y comparando contra una flecha de
// referencia, no a ojo sobre el ícono chico del mapa. Rotación necesaria =
// rumbo objetivo - dirección natural (270°), que equivale a sumar 90.
const ICONO_ROTACION_BASE = 90

// Mapa real con la última posición GPS que reportó la app del motorizado (mismo
// dato que usa el mapa interno del admin), sin importar qué tan vieja sea — se
// muestra igual, etiquetada con "actualizada hace X" (ver formatoAntiguedad),
// porque un mapa real con un dato viejo pero honestamente etiquetado es mejor
// que uno completamente inventado. Solo se cae al mapa ilustrativo si el
// motorizado nunca reportó ubicación (ver TrackingPublicController::ultimaUbicacion),
// si no hay coordenadas del destino (destinatario_coordenadas solo se llena al
// rutear, puede faltar en pedidos recién despachados), o si el script de Google
// Maps no cargó.
export default function DeliveryMap({ motorizado, destino, className = '' }) {
  const { isLoaded, loadError } = useGoogleMaps()
  const [ruta, setRuta] = useState(null)
  const mapRef = useRef(null)

  const ubicacion = motorizado.ubicacion
  const ubicacionLat = ubicacion?.lat
  const ubicacionLng = ubicacion?.lng
  const destinoLat = destino?.lat
  const destinoLng = destino?.lng

  // Traza la ruta real (Directions API) entre el motorizado y el destino. Si la
  // API de Directions no está habilitada para la key o falla, se sigue mostrando
  // el mapa con los dos pines, solo sin la línea — no rompe el mapa por esto.
  useEffect(() => {
    if (!isLoaded || ubicacionLat == null || destinoLat == null) {
      setRuta(null)
      return
    }

    let cancelado = false
    new window.google.maps.DirectionsService().route(
      {
        origin: { lat: ubicacionLat, lng: ubicacionLng },
        destination: { lat: destinoLat, lng: destinoLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (resultado, status) => {
        if (cancelado) return
        if (status !== 'OK') {
          setRuta(null)
          return
        }
        setRuta(resultado)
        mapRef.current?.fitBounds(resultado.routes[0].bounds, 56)
      },
    )

    return () => {
      cancelado = true
    }
  }, [isLoaded, ubicacionLat, ubicacionLng, destinoLat, destinoLng])

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map
      if (!ubicacion || !destino) return
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(ubicacion)
      bounds.extend(destino)
      map.fitBounds(bounds, 56)
    },
    [ubicacion, destino],
  )

  if (!ubicacion || !destino || !isLoaded || loadError) {
    return <DeliveryMapIlustrativo motorizado={motorizado} className={className} />
  }

  // Círculo violeta con el ícono de motorizado con marca Zazu adentro,
  // rotado para "mirar" hacia el destino — el círculo de fondo no rota (es
  // simétrico), solo el ícono. El path (viewBox 0 0 30 30) se centra y
  // escala dentro del círculo antes de rotar, para que el pivote de rotación
  // quede en el centro del marker y no en la esquina del dibujo original.
  const rumbo = calcularRumbo(ubicacion, destino)
  const motoIconUrl =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="#6d28d9" stroke="#fff" stroke-width="3"/>
        <g transform="translate(22 22) rotate(${rumbo + ICONO_ROTACION_BASE}) scale(0.8) translate(-15 -15)">
          <path d="${MOTORCYCLE_ICON_PATH}" fill="#F9FAFB"/>
        </g>
      </svg>
    `)
  const motoIcon = {
    url: motoIconUrl,
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22),
  }

  // Mismo círculo violeta que el marker del motorizado, pero con el ícono de
  // casa — para que el destino se vea consistente con el resto del mapa en
  // vez del pin rojo genérico de Google Maps.
  const destinoIconUrl =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="#6d28d9" stroke="#fff" stroke-width="3"/>
        <g transform="translate(22 22) scale(0.8) translate(-15 -15)">
          <path d="${HOME_ICON_PATH}" fill="#F9FAFB"/>
        </g>
      </svg>
    `)
  const destinoIcon = {
    url: destinoIconUrl,
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22),
  }

  return (
    <div
      className={`relative w-full min-h-[320px] h-full rounded-2xl overflow-hidden border border-gray-100 ${className}`}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={ubicacion}
        zoom={14}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        {ruta && <DirectionsRenderer directions={ruta} options={RUTA_OPTIONS} />}
        <Marker position={ubicacion} icon={motoIcon} title={motorizado.nombre} />
        <Marker position={destino} icon={destinoIcon} title="Destino" />
      </GoogleMap>

      <div className="absolute left-3 bottom-3 w-52 rounded-xl bg-white shadow-lg px-3 py-2.5 animate-fade-in-up">
        <p className="text-xs font-semibold text-gray-900 mb-1">
          Motorizado: {motorizado.nombre.split(' ')[0]}
        </p>
        <p className="text-[11px] text-gray-500 mb-0.5">
          Llegada aprox.: {motorizado.hora_llegada_estimada ?? 'no disponible'}
        </p>
        <p className="text-[11px] text-gray-400 mb-0">
          Ubicación actualizada {formatoAntiguedad(ubicacion.actualizada_hace_segundos)}
        </p>
      </div>
    </div>
  )
}
