import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

// Logo y, con un pedido cargado, "Buscar otro pedido". `onVolver` solo llega
// en ese caso (ver App.jsx). Sin contacto por WhatsApp: con el pedido a la
// vista, la ayuda es el chat del pedido (ChatDelPedido); en la búsqueda, el
// contacto va al pie del formulario.
// `ancho` alinea la barra con el contenido de la pantalla que está debajo.
export default function SiteHeader({ onVolver, ancho }) {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className={`mx-auto flex h-16 items-center justify-between gap-3 px-4 ${ancho}`}>
        <img src="/logo_zazu.svg" alt="Zazu Express" className="h-9 w-auto shrink-0" />

        {onVolver && (
          <Button icon={<ArrowLeftOutlined />} onClick={onVolver}>
            <span className="sm:hidden">Buscar otro</span>
            <span className="hidden sm:inline">Buscar otro pedido</span>
          </Button>
        )}
      </div>
    </nav>
  )
}
