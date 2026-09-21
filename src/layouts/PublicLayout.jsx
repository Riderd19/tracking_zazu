import SiteHeader from '../components/shared/SiteHeader'
import SiteFooter from '../components/shared/SiteFooter'

/**
 * El marco de todas las pantallas públicas: cabecera, contenido y pie.
 *
 * No envuelve `children` en ningún contenedor propio a propósito — cada página
 * trae el suyo (el del formulario centra vertical, el del seguimiento limita el
 * ancho y lleva su propio padding), y meter un wrapper intermedio acá obligaría
 * a que las dos compartan un espaciado que hoy no comparten.
 */
export default function PublicLayout({ children, onVolver }) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <SiteHeader onVolver={onVolver} />
      {children}
      <SiteFooter />
    </div>
  )
}
