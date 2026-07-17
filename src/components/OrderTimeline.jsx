import {
  FileTextOutlined,
  ToolOutlined,
  InboxOutlined,
  CarOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

// Pipeline fijo de 5 hitos que ve el cliente, independiente de los ~17 estados
// internos que puede tener un pedido (ver tabla `estados`, tipo "pedido"). Cada
// hito agrupa varios códigos internos (ej. "Preparando" cubre en_preparacion/
// listo/procesado/recepcionado) para no exponerle al cliente el detalle
// operativo interno del backoffice.
const HITOS = [
  {
    label: 'Pedido recibido',
    codigos: ['pendiente', 'confirmado', 'registrado', 'solicitud_portal', 'asignado'],
    icon: <FileTextOutlined />,
  },
  {
    label: 'Preparando',
    codigos: ['en_preparacion', 'listo', 'procesado', 'recepcionado'],
    icon: <ToolOutlined />,
  },
  { label: 'Despachado', codigos: ['despachado'], icon: <InboxOutlined /> },
  { label: 'En ruta', codigos: ['en_ruta'], icon: <CarOutlined /> },
  { label: 'Entregado', codigos: ['entregado'], icon: <CheckCircleOutlined /> },
]

// Estados que no son parte del camino feliz de 5 pasos: forzarlos en la barra
// daría a entender un avance que no ocurrió (ej. "cancelado" no es un paso
// más allá de "Entregado").
const ESTADOS_ESPECIALES = {
  cancelado: { texto: 'Pedido cancelado', color: '#ef4444', icon: <CloseCircleOutlined /> },
  devuelto: { texto: 'Pedido devuelto', color: '#f59e0b', icon: <RollbackOutlined /> },
  rechazado_portal: { texto: 'Solicitud rechazada', color: '#ef4444', icon: <CloseCircleOutlined /> },
  reprogramado: { texto: 'Entrega reprogramada', color: '#f59e0b', icon: <ClockCircleOutlined /> },
}

function indiceHito(codigo) {
  return HITOS.findIndex((hito) => hito.codigos.includes(codigo))
}

// Toma la fecha más reciente del historial que caiga dentro de este hito
// (puede haber varios códigos internos por hito, ej. despachado -> en_ruta
// dentro de "Preparando" no aplica, pero en_preparacion -> listo sí).
function fechaParaHito(hito, timeline) {
  const encontrados = timeline.filter((h) => hito.codigos.includes(h.codigo))
  return encontrados.at(-1)?.fecha ?? null
}

export default function OrderTimeline({ timeline = [], estadoActual }) {
  const especial = estadoActual ? ESTADOS_ESPECIALES[estadoActual.codigo] : null

  if (especial) {
    return (
      <div className="flex items-center gap-3 py-1">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-base"
          style={{ backgroundColor: especial.color }}
        >
          {especial.icon}
        </span>
        <p className="text-sm font-semibold text-gray-800 mb-0">{especial.texto}</p>
      </div>
    )
  }

  const indiceActual = estadoActual ? indiceHito(estadoActual.codigo) : -1

  if (indiceActual === -1) {
    return <p className="text-sm text-gray-400 mb-0">Todavía no hay novedades para este pedido.</p>
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start">
        {HITOS.map((hito, i) => {
          const estado = i < indiceActual ? 'completado' : i === indiceActual ? 'actual' : 'pendiente'
          const fecha = fechaParaHito(hito, timeline)

          return (
            <div key={hito.label} className="relative flex flex-1 flex-col items-center px-1 sm:px-4 min-w-16">
              {i > 0 && (
                <span
                  className="absolute top-5 h-0.5 animate-fade-in-up"
                  style={{
                    right: '50%',
                    width: '100%',
                    backgroundColor: estado === 'pendiente' ? '#e5e7eb' : '#6d28d9',
                  }}
                />
              )}
              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base animate-fade-in-up ${
                  estado === 'actual' ? 'shadow-sm animate-pulse-soft' : ''
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                  ...(estado === 'pendiente'
                    ? { backgroundColor: '#fff', color: '#9ca3af', border: '2px solid #e5e7eb' }
                    : { backgroundColor: '#6d28d9', color: '#fff' }),
                }}
              >
                {estado === 'completado' ? <CheckOutlined /> : estado === 'actual' ? hito.icon : null}
              </span>
              <p
                className={`mt-2 mb-0 text-xs font-semibold text-center leading-tight ${
                  estado === 'pendiente' ? 'text-gray-400' : 'text-gray-800'
                }`}
              >
                {hito.label}
              </p>
              <p className="mb-0 text-[11px] text-gray-400 text-center leading-tight">
                {estado === 'pendiente' ? 'Pendiente' : (fecha ?? 'Fecha no disponible')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
