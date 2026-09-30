import SiteHeader from '../components/shared/SiteHeader'
import SiteFooter from '../components/shared/SiteFooter'

// El ancho útil de cada pantalla, para que cabecera y pie queden alineados con
// su contenido: la búsqueda es una tarjeta de 1200px; el seguimiento, más ancho.
const ANCHO_BUSQUEDA = 'max-w-[1232px]'
const ANCHO_SEGUIMIENTO = 'max-w-[1600px] sm:px-8'

/**
 * El marco de todas las pantallas públicas: cabecera, contenido y pie.
 *
 * No envuelve `children` en ningún contenedor propio a propósito — cada página
 * trae el suyo (el del formulario centra vertical, el del seguimiento limita el
 * ancho y lleva su propio padding), y meter un wrapper intermedio acá obligaría
 * a que las dos compartan un espaciado que hoy no comparten.
 */
export default function PublicLayout({ children, onVolver, amplio = false }) {
  const ancho = amplio ? ANCHO_SEGUIMIENTO : ANCHO_BUSQUEDA

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <SiteHeader onVolver={onVolver} ancho={ancho} />
      {children}
      <SiteFooter ancho={ancho} />
    </div>
  )
}
