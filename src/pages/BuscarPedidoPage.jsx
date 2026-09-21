import { WhatsAppOutlined } from '@ant-design/icons'
import SearchForm from '../components/shared/SearchForm'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'

function IconoPaqueteBuscado() {
  return (
    <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-violet-50 mb-6">
      <svg viewBox="0 0 24 24" fill="none" className="h-11 w-11 text-violet-600">
        <path
          d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M4 7.5 12 12m0 0 8-4.5M12 12v9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 border-4 border-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-violet-600">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  )
}

/** La pantalla inicial: el formulario de código + DNI/celular. */
export default function BuscarPedidoPage({ onBuscar, loading, error, codigoInicial }) {
  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md flex flex-col items-center">
        <IconoPaqueteBuscado />

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Rastrea tu pedido
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
          Ingresa tu número de pedido y tu DNI o celular para consultar el estado
          y la ubicación de tu pedido en tiempo real.
        </p>

        <div className="w-full bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(109,40,217,0.25)] border border-violet-50 p-8">
          <SearchForm
            onSubmit={onBuscar}
            loading={loading}
            error={error}
            codigoInicial={codigoInicial}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            ¿Tienes problemas para rastrear tu pedido?
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Contáctanos por WhatsApp y te ayudaremos a encontrar tu pedido.
          </p>
          <a
            href={WHATSAPP_SOPORTE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <WhatsAppOutlined /> Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
