// estado = { codigo, nombre, color } tal como lo entrega el backend.
// Puede venir null si el pedido aún no tiene un estado asignado.
export default function EstadoBadge({ estado }) {
  const nombre = estado?.nombre ?? 'Sin estado'
  const color = estado?.color ?? '#9ca3af'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {nombre}
    </span>
  )
}
