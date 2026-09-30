import { Button } from 'antd'
import { ArrowLeftOutlined, WhatsAppOutlined } from '@ant-design/icons'
import { WHATSAPP_SOPORTE_LINK } from '../../constants/soporte'

// El contacto por WhatsApp vive acá arriba, siempre a mano, en vez de debajo
// del formulario. `onVolver` solo llega cuando hay un pedido cargado (ver
// App.jsx): ahí "Buscar otro pedido" ocupa el lugar de la pregunta.
// En móvil el botón se acorta a "Ayuda", como en el diseño: ahí no entra la
// frase completa, y la búsqueda repite el contacto al pie del formulario.
// `ancho` alinea la barra con el contenido de la pantalla que está debajo.
export default function SiteHeader({ onVolver, ancho }) {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className={`mx-auto flex h-16 items-center justify-between gap-3 px-4 ${ancho}`}>
        <img src="/logo_zazu.svg" alt="Zazu Express" className="h-9 w-auto shrink-0" />

        <div className="flex items-center gap-2 sm:gap-4">
          {onVolver ? (
            // En un celular no entran logo, "Buscar otro pedido" y "Ayuda" juntos.
            <Button icon={<ArrowLeftOutlined />} onClick={onVolver}>
              <span className="sm:hidden">Buscar otro</span>
              <span className="hidden sm:inline">Buscar otro pedido</span>
            </Button>
          ) : (
            <span className="hidden text-[15px] text-gray-600 lg:inline">
              ¿Problemas para rastrear tu pedido?
            </span>
          )}
          <a
            href={WHATSAPP_SOPORTE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border-[1.5px] border-[#560591] bg-white px-4 text-[15px] text-[#560591] transition-colors hover:bg-[#560591]/5 lg:h-9 lg:font-semibold"
          >
            <span className="lg:hidden">Ayuda</span>
            <span className="hidden items-center gap-2 lg:inline-flex">
              <WhatsAppOutlined /> Escríbenos por WhatsApp
            </span>
          </a>
        </div>
      </div>
    </nav>
  )
}
