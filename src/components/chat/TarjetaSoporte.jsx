import { useSoporteChat } from './soporteChatContext'

/**
 * La versión compacta de "Contacta Soporte": una tarjeta con texto y un botón de
 * contorno, para las vistas donde el chat no es lo principal (Courier Shalom en ruta).
 *
 * Por defecto solo desde `md`, igual que BotonContactaSoporte: en móvil el chat se abre
 * con el botón flotante de ChatDelPedido. `tambienEnMovil` la muestra también en
 * celular (el diseño móvil de Shalom en ruta la pone al final de la página).
 */
export default function TarjetaSoporte({ className = '', tambienEnMovil = false }) {
  const soporte = useSoporteChat()

  if (!soporte) return null

  return (
    <div
      className={`${tambienEnMovil ? 'flex' : 'hidden md:flex'} items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="min-w-0">
        <p className="mb-0 text-sm font-semibold text-gray-900">¿Algún problema?</p>
        <p className="mb-0 whitespace-nowrap text-xs text-gray-500">Nuestro equipo te ayuda</p>
      </div>
      <button
        type="button"
        onClick={soporte.abrir}
        className="relative flex shrink-0 cursor-pointer items-center rounded-xl border border-[#560591] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#560591] transition-colors hover:bg-violet-50"
      >
        Contacta Soporte
        {soporte.noLeidos > 0 && (
          <span
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white"
            aria-label={`${soporte.noLeidos} mensajes sin leer`}
          >
            {soporte.noLeidos}
          </span>
        )}
      </button>
    </div>
  )
}
