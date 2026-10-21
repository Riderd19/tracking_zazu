/** La guía dibujada en gris: el voucher todavía no existe. */
function GuiaEnGris({ className = '' }) {
  return (
    <div aria-hidden className={`flex shrink-0 items-center justify-center rounded-xl bg-gray-100 ${className}`}>
      <div className="w-24 shrink-0 scale-[0.55] rounded-md bg-white p-2.5 shadow-sm sm:scale-100">
        <p className="mb-2 text-[6px] font-bold uppercase tracking-wider text-gray-300">Guía de envío</p>
        <div className="mb-1 h-0.5 w-full rounded bg-gray-200" />
        <div className="mb-1 h-0.5 w-4/5 rounded bg-gray-200" />
        <div className="mb-2.5 h-0.5 w-3/5 rounded bg-gray-200" />
        <div
          className="h-5 w-full opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #6b7280 0 1px, transparent 1px 3px, #6b7280 3px 5px, transparent 5px 6px)',
          }}
        />
      </div>
    </div>
  )
}

/**
 * El lugar del voucher antes de que exista (el pedido todavía no se entregó a la
 * agencia). Avisa qué va a aparecer aquí y cuándo, con el botón deshabilitado, para que
 * la clienta no lo busque en otro lado.
 *
 * Escritorio: la tarjeta completa con borde punteado. Celular: una fila compacta con la
 * insignia "Pendiente".
 */
export default function VoucherPendiente({ agencia, className = '' }) {
  const AGENCIA = (agencia || 'la agencia').toUpperCase()

  return (
    <div className={`w-full rounded-2xl border-2 border-dashed border-gray-200 bg-white ${className}`}>
      {/* Celular */}
      <div className="flex items-center gap-3 p-3.5 md:hidden">
        <GuiaEnGris className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <p className="mb-0 text-sm font-semibold text-gray-500">Voucher de envío</p>
          <p className="mb-0 text-xs leading-snug text-gray-400">Disponible cuando tu pedido llegue a {AGENCIA}</p>
        </div>
        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
          Pendiente
        </span>
      </div>

      {/* Escritorio */}
      <div className="hidden p-5 md:block">
        <div className="flex items-start gap-5">
          <GuiaEnGris className="h-36 w-36" />
          <div className="min-w-0">
            <span className="mb-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
              Disponible al enviar a {AGENCIA}
            </span>
            <h2 className="mb-1.5 text-lg font-bold tracking-tight text-gray-400">Tu voucher de envío</h2>
            <p className="mb-0 text-[13px] leading-5 text-gray-500">
              Aparecerá aquí cuando tu pedido sea entregado a {AGENCIA}. Lo necesitarás junto con tu clave de
              recojo.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="mt-5 h-11 w-full cursor-not-allowed rounded-xl border-0 bg-gray-100 text-sm font-semibold text-gray-400"
        >
          Ver voucher
        </button>
      </div>
    </div>
  )
}
