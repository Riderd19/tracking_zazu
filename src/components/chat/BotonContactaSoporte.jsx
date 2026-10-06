import { CustomerServiceOutlined } from '@ant-design/icons'
import { useSoporteChat } from './soporteChatContext'

/**
 * El botón grande que abre el chat en escritorio, debajo de la imagen (o el
 * mapa) de cada estado del pedido.
 *
 * Solo desde `md`: por debajo, la página es de una columna y el chat se abre
 * con el botón flotante de ChatDelPedido.
 */
export default function BotonContactaSoporte({ className = '' }) {
  const soporte = useSoporteChat()

  if (!soporte) return null

  return (
    <button
      type="button"
      onClick={soporte.abrir}
      className={`hidden w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-0 bg-violet-700 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-900/20 transition-colors hover:bg-violet-800 md:flex ${className}`}
    >
      <CustomerServiceOutlined className="text-2xl" />
      Contacta Soporte
      {soporte.noLeidos > 0 && (
        <span
          className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold"
          aria-label={`${soporte.noLeidos} mensajes sin leer`}
        >
          {soporte.noLeidos}
        </span>
      )}
    </button>
  )
}
