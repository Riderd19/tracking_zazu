import { useState } from 'react'
import { WhatsAppOutlined, FileTextOutlined } from '@ant-design/icons'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'
import LibroReclamacionesModal from './LibroReclamacionesModal'

export default function SiteFooter() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const anio = new Date().getFullYear()

  return (
    <footer className="w-full bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 flex flex-col sm:flex-row gap-10 sm:gap-24">
        <div>
          <img src="/logo_zazu.svg" alt="Zazu Express" className="h-7 w-auto mb-3 brightness-0 invert" />
          <p className="text-sm leading-relaxed max-w-xs">
            Rastrea tus pedidos en tiempo real, de principio a fin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-200 uppercase mb-4">Ayuda</p>
            <a
              href={WHATSAPP_SOPORTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
            >
              <WhatsAppOutlined /> Contáctanos por WhatsApp
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-200 uppercase mb-4">Legal</p>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
            >
              <FileTextOutlined /> Libro de Reclamaciones
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-5 text-xs text-gray-500 text-center">
          © {anio} Zazu Express. Todos los derechos reservados.
        </div>
      </div>

      <LibroReclamacionesModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </footer>
  )
}
