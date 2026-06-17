import { Steps } from 'antd'
import {
  FileTextOutlined,
  InboxOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

const ICONOS = {
  Registrado: <FileTextOutlined />,
  Despachado: <InboxOutlined />,
  'En tránsito': <CarOutlined />,
  Entregado: <CheckCircleOutlined />,
}

function obtenerIcono(estado) {
  return ICONOS[estado] ?? <ClockCircleOutlined />
}

// timeline: [{ estado, color, fecha }] tal como lo entrega el backend.
// Solo incluye los pasos ya ocurridos (no hay un universo fijo de estados
// futuros que mostrar como "pendiente"). Si el backend todavía no generó
// historial (ej. un pedido recién "Pendiente"), se usa estadoActual como
// único paso para no contradecir al badge de estado.
export default function OrderTimeline({ timeline, estadoActual }) {
  const pasos =
    timeline && timeline.length > 0
      ? timeline
      : estadoActual
        ? [{ estado: estadoActual.nombre, color: estadoActual.color, fecha: null }]
        : []

  if (pasos.length === 0) {
    return <p className="text-sm text-gray-400 mb-0">Todavía no hay novedades para este pedido.</p>
  }

  const esEntregado = estadoActual?.codigo === 'entregado'

  const items = pasos.map((paso, i) => {
    const esUltimo = i === pasos.length - 1
    const status = esUltimo && !esEntregado ? 'process' : 'finish'

    return {
      title: paso.estado,
      content: paso.fecha ?? 'Fecha no disponible',
      icon: (
        <span
          className={`inline-flex rounded-full animate-fade-in-up ${status === 'process' ? 'animate-pulse-soft' : ''}`}
          style={{ animationDelay: `${i * 120}ms`, color: paso.color }}
        >
          {obtenerIcono(paso.estado)}
        </span>
      ),
      status,
    }
  })

  return (
    <Steps
      orientation="vertical"
      current={pasos.length - 1}
      items={items}
      className="zazu-timeline"
    />
  )
}
