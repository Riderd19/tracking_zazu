import { useState } from 'react'
import { WhatsAppOutlined, FacebookFilled, InstagramFilled, CheckOutlined } from '@ant-design/icons'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'
import LibroReclamacionesModal from './LibroReclamacionesModal'

// No hay ícono de TikTok en @ant-design/icons — se dibuja a mano, mismo trazo
// que el logo oficial de la red social (silueta genérica, no una marca inventada).
function TikTokIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.58h-3.06v13.98c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.28 0 .55.04.8.12V10.4a5.8 5.8 0 0 0-.8-.06 5.78 5.78 0 1 0 5.78 5.78V9.4a8.6 8.6 0 0 0 4.8 1.46V7.8a5.6 5.6 0 0 1-3.4-1.98Z" />
    </svg>
  )
}

// "Navegación" y "Servicios" son enlaces de vitrina — este micrositio solo tiene
// esta página (nav real está oculto, ver SiteHeader), y no hay páginas de
// Servicios/Nosotros para enlazar todavía, así que quedan como texto, sin href.
// WhatsApp y Libro de Reclamaciones sí son reales/funcionales (mismos que ya
// usa el resto del sitio). Los íconos de redes sociales tampoco enlazan a
// ningún lado real: no tenemos URLs reales de las cuentas de Zazu.
const ENLACES_NAVEGACION = ['Inicio', 'Servicios', 'Nosotros']
const ENLACES_SERVICIOS = ['Ruteo inteligente', 'Recepción gratuita', 'Recaudación en tiempo real', 'Choferes certificados']
const DESTACADOS = ['Cobertura creciente', 'Soporte en tiempo real', 'Tecnología propia']

export default function SiteFooter() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const anio = new Date().getFullYear()

  return (
    <footer className="w-full bg-white border-t-2 border-violet-600 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <img src="/logo_zazu.svg" alt="Zazu Express" className="h-7 w-auto mb-3" />
          <p className="text-sm text-violet-600 leading-relaxed max-w-xs">
            Soluciones inteligentes para una operación de transporte más eficiente.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Navegación</p>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            {ENLACES_NAVEGACION.map((texto) => (
              <li key={texto} className="text-sm text-gray-500">
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Servicios</p>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            {ENLACES_SERVICIOS.map((texto) => (
              <li key={texto} className="text-sm text-gray-500">
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Contacto</p>
          <p className="text-sm text-gray-500 mb-3">¿Necesitas ayuda?</p>
          <a
            href={WHATSAPP_SOPORTE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-violet-200 text-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-50 transition-colors mb-4"
          >
            <WhatsAppOutlined /> Escríbenos por WhatsApp
          </a>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {DESTACADOS.map((texto) => (
              <li key={texto} className="flex items-center gap-2 text-sm text-gray-500">
                <CheckOutlined className="text-emerald-500 text-xs" /> {texto}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
            <p className="text-xs text-gray-400 mb-0">© {anio} Zazu. Todos los derechos reservados.</p>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-violet-600"
            >
              Libro de Reclamaciones
            </button>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <FacebookFilled className="text-base" />
            <TikTokIcon className="h-4 w-4" />
            <InstagramFilled className="text-base" />
            <WhatsAppOutlined className="text-base" />
          </div>
        </div>
      </div>

      <LibroReclamacionesModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </footer>
  )
}
