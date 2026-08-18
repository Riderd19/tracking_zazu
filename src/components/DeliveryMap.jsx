import { useCallback, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";
import DeliveryMapIlustrativo from "./DeliveryMapIlustrativo";
import { HOME_ICON_PATH } from "../constants/homeIconPath";

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
};

// Mapa real con el pin fijo de destino — sin datos de motorizado (ni GPS en
// vivo ni su tarjeta), solo se ubica el punto de entrega con las coordenadas
// del pedido (destino_coordenadas). Se cae al mapa ilustrativo si no hay esas
// coordenadas o si el script de Google Maps no cargó.
export default function DeliveryMap({ destino, className = "" }) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (!destino || !isLoaded || loadError) {
    return <DeliveryMapIlustrativo className={className} />;
  }

  // Mismo círculo violeta con marca Zazu que el resto de los mapas, con el
  // ícono de casa para el destino.
  const destinoIconUrl =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="#6d28d9" stroke="#fff" stroke-width="3"/>
        <g transform="translate(22 22) scale(0.8) translate(-15 -15)">
          <path d="${HOME_ICON_PATH}" fill="#F9FAFB"/>
        </g>
      </svg>
    `);
  const destinoIcon = {
    url: destinoIconUrl,
    scaledSize: new window.google.maps.Size(44, 44),
    anchor: new window.google.maps.Point(22, 22),
  };

  return (
    <div
      className={`relative w-full min-h-[320px] h-full rounded-2xl overflow-hidden border border-gray-100 ${className}`}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={destino}
        zoom={16}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        <Marker position={destino} icon={destinoIcon} title="Destino" />
      </GoogleMap>
    </div>
  );
}
