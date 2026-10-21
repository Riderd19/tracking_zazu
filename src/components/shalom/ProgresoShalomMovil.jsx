const PASOS = ['Registrado', 'Preparando', 'En ruta', 'Entregado']

/**
 * La línea de tiempo condensada para celular (Shalom en ruta y entregado): en qué paso
 * va, una insignia de estado, un título y una barra de cuatro tramos. Reemplaza a la
 * ficha y a OrderTimeline, que en una pantalla angosta empujaban el voucher y el pago
 * hacia abajo.
 *
 * `etiqueta` es el texto junto al número de paso ("En ruta", "Entregado") y `tono`
 * su color: violeta mientras va en camino, verde al entregarse.
 */
export default function ProgresoShalomMovil({
  paso,
  etiqueta,
  insignia = null,
  titulo,
  descripcion = null,
  tono = 'violeta',
  className = '',
}) {
  const colorEtiqueta = tono === 'verde' ? 'text-emerald-700' : 'text-violet-700'

  return (
    <div className={`w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:hidden ${className}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold ${colorEtiqueta}`}>
          Paso {paso} de {PASOS.length} · {etiqueta}
        </span>
        {insignia}
      </div>

      <p className="mb-1 text-base font-bold leading-tight text-gray-900">{titulo}</p>
      {descripcion && <p className="mb-0 text-[13px] leading-5 text-gray-600">{descripcion}</p>}

      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-label={`Paso ${paso} de ${PASOS.length}`}>
        {PASOS.map((nombre, i) => (
          <div key={nombre} className="min-w-0">
            <div className={`mb-1.5 h-1.5 rounded-full ${i < paso ? 'bg-[#560591]' : 'bg-gray-200'}`} />
            <p
              className={`mb-0 truncate text-center text-[10px] ${
                i < paso ? 'font-medium text-gray-700' : 'text-gray-400'
              }`}
            >
              {nombre}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
