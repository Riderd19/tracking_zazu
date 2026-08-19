import { Button } from 'antd'
import { CheckOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import TruckFastIcon from './icons/TruckFastIcon'
import { agenciaBase, nombreYAgencia } from '../utils/agencia'
import { urlRastreoAgencia } from '../constants/courierTracking'
import { formatearFecha } from '../utils/fecha'

function Fila({ label, valor, destacado = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {destacado ? (
        <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          {valor}
        </span>
      ) : (
        <span className="text-xs font-semibold text-gray-900">{valor}</span>
      )}
    </div>
  )
}

// Diseño especial por sub-estado de Shalom (mockup propio con ilustración —
// ver ILUSTRACION_SEGUIMIENTO en OrderSummaryCard.jsx para la imagen de cada
// uno). Solo 'origen' y 'transito' tienen mockup por ahora; cualquier otro
// estado (o sin seguimiento_courier) cae al diseño genérico con mini-timeline
// de abajo. mostrarAgenciaDestino existe porque en 'origen' ese campo no
// estaba en el mockup (se decidió no inventarlo ahí), pero en 'transito' sí
// es un dato real que ya tenemos (sucursal).
const VARIANTES_SEGUIMIENTO = {
  origen: {
    titulo: (agencia) => `${agencia} ya recibió tu pedido`,
    pasoFecha: 'origen',
    descripcion:
      'Tu pedido se encuentra en la agencia de origen y está siendo preparado para continuar hacia la agencia de destino.',
    mostrarAgenciaDestino: false,
  },
  transito: {
    badge: 'En tránsito',
    titulo: () => 'Tu pedido está en tránsito',
    pasoFecha: 'transito',
    descripcion: (agencia) => `${agencia} está trasladando tu pedido hacia la agencia de destino.`,
    mostrarAgenciaDestino: true,
  },
}

// Mismo orden que ShalomTrackingService::PASOS en el backend — "alcanzado"
// ya viene resuelto de ahí (true si ese paso tiene fecha), acá solo se pinta.
const PASOS_COURIER = [
  { clave: 'origen', label: 'En origen' },
  { clave: 'transito', label: 'En tránsito' },
  { clave: 'destino', label: 'En destino' },
  { clave: 'entregado', label: 'Entregado' },
]

// Mini-timeline de 4 pasos (mismo patrón visual que OrderTimeline, a menor
// escala) para el sub-estado real dentro de Shalom — más preciso que el
// "Estado en X" genérico que se muestra si no hay seguimiento_courier.
function MiniTimelineCourier({ seguimiento }) {
  return (
    <div className="flex items-start pt-1">
      {PASOS_COURIER.map((paso, i) => {
        const alcanzado = Boolean(seguimiento.pasos?.[paso.clave]?.alcanzado)
        return (
          <div key={paso.clave} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                className="absolute top-[9px] h-0.5"
                style={{
                  right: '50%',
                  width: '100%',
                  backgroundColor: alcanzado ? '#6d28d9' : '#E5E7EB',
                }}
              />
            )}
            <span
              className="relative z-10 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full text-[10px]"
              style={
                alcanzado
                  ? { backgroundColor: '#6d28d9', color: '#fff' }
                  : { backgroundColor: '#fff', border: '2px solid #E5E7EB' }
              }
            >
              {alcanzado && <CheckOutlined style={{ fontSize: 10 }} />}
            </span>
            <p className="mb-0 mt-1.5 px-0.5 text-center text-[10px] font-medium leading-tight text-gray-500">
              {paso.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// Pedidos COURIER en "en_ruta": el paquete ya está en manos del courier
// externo (Shalom, etc.), no de un motorizado propio de Zazu — por eso no
// hay DriverCard/DeliveryMap acá, sino esta tarjeta con los datos de
// seguimiento que sí expone el tracking público (guía/agencia/estado). El
// El código/clave del courier se muestra dentro de esta tarjeta, igual que en
// las tarjetas de los demás estados, y no en la barra de información superior.
// `lugar` es el mismo string ya usado para "Destino" en OrderSummaryCard
// (agencia - sucursal - ubicación), del que se derivan agencia/sucursal acá
// para no repetir el parseo. El botón "Rastrear en X" varía según la
// agencia (ver courierTracking.js) y se omite si no hay URL conocida.
export default function CourierTrackingCard({ pedido, lugar, className = '' }) {
  const {
    codigo_courier: codigo,
    guia_courier: guia,
    estado_actual: estadoActual,
    seguimiento_courier: seguimiento,
  } = pedido
  const agencia = agenciaBase(lugar) || 'el courier'
  const sucursal = nombreYAgencia(lugar)
  const urlRastreo = urlRastreoAgencia(agencia)
  // Sub-estados con mockup propio (sin mapa de destino que mostrar todavía —
  // ver ILUSTRACION_SEGUIMIENTO en OrderSummaryCard.jsx, que reemplaza el
  // mapa por una ilustración para estos mismos casos).
  const variante = seguimiento?.estado ? VARIANTES_SEGUIMIENTO[seguimiento.estado] : null
  const fechaPaso = variante ? formatearFecha(seguimiento.pasos?.[variante.pasoFecha]?.fecha) : null

  return (
    <div className={`w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
        <TruckFastIcon className="text-sm" />
        {variante?.badge ?? 'Seguimiento de envío'}
      </div>

      {variante ? (
        <>
          <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">{variante.titulo(agencia)}</h2>
          {fechaPaso && <p className="mb-2 text-xs font-medium text-gray-500">{fechaPaso}</p>}
          <p className="mb-3 text-xs leading-5 text-gray-500">
            {typeof variante.descripcion === 'function' ? variante.descripcion(agencia) : variante.descripcion}
          </p>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            <Fila label="Guía" valor={guia || 'Pendiente'} />
            <Fila label="Código" valor={codigo || 'No Disponible'} />
            {variante.mostrarAgenciaDestino && <Fila label="Agencia destino" valor={sucursal || 'Pendiente'} />}
            <Fila label={`Estado en ${agencia}`} valor={seguimiento.mensaje ?? 'Pendiente'} destacado />
          </div>
        </>
      ) : (
        <>
          <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">Tu pedido está en manos de {agencia}</h2>
          <p className="mb-3 text-xs leading-5 text-gray-500">
            Consulta el seguimiento de tu envío directamente en {agencia}.
          </p>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            <Fila label="Código" valor={codigo || 'No Disponible'} />
            <Fila label="Guía" valor={guia || 'Pendiente'} />
            <Fila label="Agencia" valor={sucursal || 'Pendiente'} />
            {seguimiento ? (
              <div className="py-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-gray-500">Estado en {agencia}</span>
                  <span className="text-xs font-semibold text-violet-700">
                    {seguimiento.mensaje ?? estadoActual?.nombre ?? 'Pendiente'}
                  </span>
                </div>
                <MiniTimelineCourier seguimiento={seguimiento} />
                {seguimiento.demora && (
                  <p className="mb-0 mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <ExclamationCircleFilled /> Este envío está demorado
                  </p>
                )}
              </div>
            ) : (
              <Fila label={`Estado en ${agencia}`} valor={estadoActual?.nombre ?? 'Pendiente'} destacado />
            )}
          </div>
        </>
      )}

      {urlRastreo && (
        <a className="mt-4 block" href={urlRastreo} target="_blank" rel="noopener noreferrer">
          <Button type="primary" className="h-10! bg-[#5C009C]! text-xs! font-semibold!" block>
            Rastrear en {agencia}
          </Button>
        </a>
      )}
    </div>
  )
}
