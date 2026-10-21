/**
 * "¿Qué sigue?": los tres pasos de un envío por agencia, con el actual resaltado y su
 * insignia "En proceso". Responde la pregunta que más llega a soporte mientras el pedido
 * se prepara: cuándo aparece el voucher y qué hay que llevar a la agencia.
 *
 * `actual` es el número de paso (1, 2 o 3).
 */
export default function QueSigue({ agencia, actual = 1, className = '' }) {
  const AGENCIA = (agencia || 'la agencia').toUpperCase()
  const pasos = [
    { titulo: 'Preparamos tu pedido', detalle: 'Lo organizamos y validamos para el envío' },
    { titulo: `Lo enviamos a ${AGENCIA}`, detalle: 'Aquí aparecerá tu voucher de envío' },
    { titulo: 'Recoges en la agencia', detalle: 'Con tu voucher y tu clave de recojo' },
  ]

  return (
    <div className={`w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 ${className}`}>
      <p className="mb-3 text-base font-bold text-gray-900">¿Qué sigue?</p>

      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {pasos.map((paso, i) => {
          const numero = i + 1
          const activo = numero === actual
          const hecho = numero < actual

          return (
            <li key={paso.titulo} className="flex items-start gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  activo || hecho ? 'bg-[#560591] text-white' : 'border border-gray-200 bg-white text-gray-400'
                }`}
              >
                {numero}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`mb-0 text-sm font-semibold ${activo || hecho ? 'text-gray-900' : 'text-gray-400'}`}>
                  {paso.titulo}
                </p>
                <p className={`mb-0 text-xs ${activo || hecho ? 'text-gray-600' : 'text-gray-400'}`}>{paso.detalle}</p>
              </div>
              {activo && (
                <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  En proceso
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
