import { createContext, useContext } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

const GoogleMapsContext = createContext({ isLoaded: false, loadError: undefined })

export function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'zazu-tracking-google-maps',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '',
  })

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext)
}
