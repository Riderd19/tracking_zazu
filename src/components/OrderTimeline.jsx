import {
  ClockCircleOutlined,
  CheckOutlined,
  ToolOutlined,
  GiftOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  InboxOutlined,
  CarOutlined,
  SendOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'

// Nombres tal como los entrega el backend para pedidos (tabla `estados`,
// tipo "pedido" — ver EstadosSeeder y las migraciones que agregan
// despachado/en_ruta). "En tránsito" pertenece a otra categoría interna
// (tipo "envio") y nunca aparece aquí, por eso no está en este mapa.
const ICONOS = {
  Pendiente: <ClockCircleOutlined />,
  Confirmado: <CheckOutlined />,
  'En preparación': <ToolOutlined />,
  'Listo para envío': <GiftOutlined />,
  Procesado: <FileDoneOutlined />,
  Registrado: <FileTextOutlined />,
  Despachado: <InboxOutlined />,
  'En Ruta': <CarOutlined />,
  Enviado: <SendOutlined />,
  Entregado: <CheckCircleOutlined />,
  Devuelto: <RollbackOutlined />,
  Cancelado: <CloseCircleOutlined />,
}

// Códigos de estado que ya no avanzan (ver EstadosSeeder): un pedido en
// cualquiera de estos no debe mostrarse como "en proceso" (sin animación
// de pulso), a diferencia de un paso intermedio real.
const CODIGOS_FINALES = ['entregado', 'cancelado', 'devuelto']

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

  const esFinal = CODIGOS_FINALES.includes(estadoActual?.codigo)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start">
        {pasos.map((paso, i) => {
          const esUltimo = i === pasos.length - 1
          const enProceso = esUltimo && !esFinal

          return (
            <div key={i} className="relative flex flex-1 flex-col items-center px-1 sm:px-4 min-w-16">
              {i > 0 && (
                <span
                  className="absolute top-5 h-0.5 bg-violet-500 animate-fade-in-up"
                  style={{ right: '50%', width: '100%' }}
                />
              )}
              <span
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-base shadow-sm animate-fade-in-up ${enProceso ? 'animate-pulse-soft' : ''}`}
                style={{ backgroundColor: paso.color ?? '#6d28d9', animationDelay: `${i * 100}ms` }}
              >
                {obtenerIcono(paso.estado)}
              </span>
              <p className="mt-2 mb-0 text-xs font-semibold text-gray-800 text-center leading-tight">
                {paso.estado}
              </p>
              <p className="mb-0 text-[11px] text-gray-400 text-center leading-tight">
                {paso.fecha ?? 'Fecha no disponible'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
