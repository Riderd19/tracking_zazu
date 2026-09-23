import { useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../../contexts/GoogleMapsContext";
import { HOME_ICON_PATH } from "../../constants/homeIconPath";

// Centro de Lima: solo para abrir el mapa en algún lado cuando el pedido
// todavía no tiene coordenadas. No se toma como la elección del cliente.
const LIMA = { lat: -12.0464, lng: -77.0428 };

// 'greedy' para que dentro del modal, en el celular, un dedo mueva el mapa en
// vez de pedir dos dedos: acá el mapa es lo único que hay que manipular.
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
};

function puntoDelEvento(evento) {
  return { lat: evento.latLng.lat(), lng: evento.latLng.lng() };
}

// Mismo pin violeta con la casa que DeliveryMap, para que el cliente reconozca
// en el editor el mismo punto que ve en el tracking.
function iconoDestino() {
  const url =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="#6d28d9" stroke="#fff" stroke-width="3"/>
        <g transform="translate(22 22) scale(0.8) translate(-15 -15)">
          <path d="${HOME_ICON_PATH}" fill="#F9FAFB"/>
        </g>
      </svg>
    `);

  return {
    url,
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22),
  };
}

// Mapa para elegir el punto de entrega: basado en DeliveryMap, pero con el pin
// arrastrable. También se puede tocar el mapa para llevar el pin ahí, que en
// el celular es más fácil que arrastrar un ícono de 44px.
//
// Controlado: `valor` es el punto elegido ({ lat, lng }) o null si el cliente
// todavía no eligió ninguno (pedido sin coordenadas). En ese caso el pin se
// muestra en `LIMA` solo como referencia, y quien lo usa no debe dejar
// confirmar hasta que llegue un `onChange`.
export default function SelectorUbicacion({ valor, onChange, className = "" }) {
  const { isLoaded, loadError } = useGoogleMaps();
  // Centro y zoom se fijan una vez al abrir: si siguieran a `valor`, el mapa
  // saltaría debajo del dedo en cada arrastre (o desharía el zoom del cliente).
  const [centro] = useState(() => valor ?? LIMA);
  const [zoom] = useState(() => (valor ? 17 : 12));

  if (!isLoaded || loadError) {
    return (
      <div
        className={`flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-500 ${className}`}
      >
        No pudimos cargar el mapa en este momento. Inténtalo más tarde o escríbenos por WhatsApp.
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[360px] rounded-2xl overflow-hidden border border-gray-100 ${className}`}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={centro}
        zoom={zoom}
        options={MAP_OPTIONS}
        onClick={(evento) => onChange(puntoDelEvento(evento))}
      >
        <Marker
          position={valor ?? centro}
          icon={iconoDestino()}
          title="Punto de entrega"
          draggable
          onDragEnd={(evento) => onChange(puntoDelEvento(evento))}
        />
      </GoogleMap>

      {!valor && (
        <div className="pointer-events-none absolute inset-x-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-center text-xs font-medium text-gray-700 shadow-sm">
          Toca el mapa o arrastra el marcador hasta tu dirección.
        </div>
      )}
    </div>
  );
}
