import {
  SettingOutlined,
  InboxOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import MotorcycleIcon from './icons/MotorcycleIcon'

// Pipeline que ve el cliente: 4 pasos. El código que llega en `estadoActual`
// ahora sale de Empaquetado y Entrega en el backend (tickets.estado /
// tickets.estado_zazu_1, ver TrackingPublicController::determinarEstadoDesdeTicket),
// no de pedidos.estado — "pendiente" ("En espera" del ticket) = En Gestión,
// "despachado" = Despachado, "en_ruta" ("En curso" del courier externo) = En
// Ruta, "entregado" = resultado final. Los códigos viejos de pedidos.estado
// (confirmado, en_preparacion, listo, procesado, registrado, solicitud_portal,
// asignado, recepcionado) se mantienen en EN_GESTION solo como respaldo, para
// pedidos sin ticket vinculado (ver el fallback en el backend).
const EN_GESTION = [
  'pendiente', 'confirmado', 'registrado', 'solicitud_portal', 'procesado',
  'en_preparacion', 'listo', 'asignado', 'recepcionado',
]

const RESULTADOS_FINALES = {
  entregado: { label: 'Entregado', icon: <CheckCircleOutlined /> },
  devuelto: { label: 'Devuelto', icon: <RollbackOutlined /> },
  reprogramado: { label: 'Reprogramado', icon: <CalendarOutlined /> },
}

function construirHitos(estadoActual) {
  const resultado = RESULTADOS_FINALES[estadoActual?.codigo] ?? RESULTADOS_FINALES.entregado

  return [
    { label: 'En Gestión', codigos: EN_GESTION, icon: <SettingOutlined /> },
    { label: 'Despachado', codigos: ['despachado'], icon: <InboxOutlined /> },
    { label: 'En ruta', codigos: ['en_ruta', 'enviado'], icon: <MotorcycleIcon /> },
    { label: resultado.label, codigos: ['entregado', 'devuelto', 'reprogramado'], icon: resultado.icon },
  ]
}

// Estados que quedan totalmente fuera del camino feliz: mostrarlos dentro de
// la barra de pasos daría a entender un avance de ruta que no ocurrió.
const ESTADOS_ESPECIALES = {
  cancelado: { texto: 'Pedido cancelado', color: '#ef4444', icon: <CloseCircleOutlined /> },
  rechazado_portal: { texto: 'Solicitud rechazada', color: '#ef4444', icon: <CloseCircleOutlined /> },
  no_entregado: { texto: 'No se pudo entregar tu pedido', color: '#ef4444', icon: <CloseCircleOutlined /> },
}

function indiceHito(hitos, codigo) {
  return hitos.findIndex((hito) => hito.codigos.includes(codigo))
}

// Toma la fecha más reciente del historial que caiga dentro de este hito.
function fechaParaHito(hito, timeline) {
  const encontrados = timeline.filter((h) => hito.codigos.includes(h.codigo))
  return encontrados.at(-1)?.fecha ?? null
}

function formatearFecha(fecha) {
  if (!fecha) return null

  const soloFecha = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (soloFecha) return `${soloFecha[3]}/${soloFecha[2]}/${soloFecha[1]}`

  return fecha
}

export default function OrderTimeline({
  timeline = [],
  estadoActual,
  fechaPedido,
  fechaDespacho,
  fechaEnRuta,
  fechaEntregado,
}) {
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

  const hitos = construirHitos(estadoActual)
  const indiceActual = estadoActual ? indiceHito(hitos, estadoActual.codigo) : -1

  if (indiceActual === -1) {
    return <p className="text-sm text-gray-400 mb-0">Todavía no hay novedades para este pedido.</p>
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start">
        {hitos.map((hito, i) => {
          const estado = i < indiceActual ? 'completado' : i === indiceActual ? 'actual' : 'pendiente'
          // El historial casi nunca trae fecha por hito. Para "En Gestión" (el
          // hito más cercano a la creación del pedido) usamos la fecha de venta
          // como respaldo. Para los demás pasos NO se usa fecha_actualizacion
          // como respaldo: es la última modificación del pedido en general (se
          // actualiza con cualquier edición, no solo cambios de estado), así que
          // podía mostrar, por ejemplo, la hora de una corrección de dirección
          // como si fuera la hora en que el pedido llegó a "En ruta" — mejor
          // mostrar "Fecha no disponible" que una fecha real pero engañosa.
          const fechasPorPaso = [fechaPedido, fechaDespacho, fechaEnRuta, fechaEntregado]
          const fecha = formatearFecha(fechasPorPaso[i] ?? fechaParaHito(hito, timeline))

          // Colores calcados del inspector de Figma (Dev Mode): línea/círculo
          // completado en #5C009C/#560591, círculo actual en blanco con borde
          // #330753 e ícono #560591, círculo pendiente en blanco con borde
          // #E5E7EB. El texto (título y fecha) usa el mismo gris #374151 en
          // los 3 estados — la diferencia la marcan el círculo y la línea, no
          // el texto.
          return (
            <div key={hito.label} className="relative flex flex-1 flex-col items-center px-1 sm:px-4 min-w-16">
              {i > 0 && (
                <span
                  className="absolute top-[15.5px] h-1 animate-fade-in-up"
                  style={{
                    right: '50%',
                    width: '100%',
                    backgroundColor: estado === 'pendiente' ? '#F3F4F6' : '#560591',
                  }}
                />
              )}
              <span
                className={`relative z-10 flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full text-base animate-fade-in-up ${
                  estado === 'actual' ? 'animate-pulse-soft' : ''
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                  ...(estado === 'pendiente'
                    ? { backgroundColor: '#fff', color: '#E5E7EB', border: '2px solid #E5E7EB' }
                    : estado === 'actual'
                      ? { backgroundColor: '#fff', color: '#560591', border: '2px solid #330753' }
                      : { backgroundColor: '#5C009C', color: '#fff' }),
                }}
              >
                {estado === 'completado' ? <CheckOutlined /> : estado === 'actual' ? hito.icon : null}
              </span>
              <p className="mt-2 mb-0 text-sm font-semibold text-center leading-5" style={{ color: '#374151' }}>
                {hito.label}
              </p>
              <p className="mb-0 text-xs font-normal text-center leading-4" style={{ color: '#374151' }}>
                {estado === 'pendiente' ? 'Pendiente' : (fecha ?? 'Fecha no disponible')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
