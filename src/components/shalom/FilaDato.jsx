const TONOS = {
  normal: 'font-semibold text-gray-900',
  // Un dato que todavía no existe ("No disponible", "Pendiente"): gris, sin peso.
  tenue: 'font-normal text-gray-400',
  // Un dato que es una acción o un estado a destacar ("En ruta").
  acento: 'font-semibold text-violet-700',
}

/** Una fila etiqueta / valor de las tarjetas de datos de Shalom. */
export default function FilaDato({ label, children, tono = 'normal' }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="shrink-0 text-[13px] text-gray-500">{label}</span>
      <span className={`text-right text-[13px] leading-snug ${TONOS[tono]}`}>{children}</span>
    </div>
  )
}
