import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

// Nav oculto por ahora — este micrositio de tracking solo tiene esta página.
// `onVolver` solo llega cuando hay un pedido cargado (ver App.jsx) — ahí se
// muestra "Buscar otro" a la derecha, en vez de repetirlo abajo del mapa.
export default function SiteHeader({ onVolver }) {
  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <img src="/logo_zazu.svg" alt="Zazu Express" className="h-8 w-auto shrink-0" />
        {onVolver && (
          <Button icon={<ArrowLeftOutlined />} onClick={onVolver}>
            Buscar otro pedido
          </Button>
        )}
      </div>
    </header>
  )
}
