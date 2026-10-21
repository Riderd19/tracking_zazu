import { ArrowRightOutlined, ExclamationCircleFilled, RightOutlined } from '@ant-design/icons'
import { agenciaBase, nombreYAgencia } from '../../utils/agencia'
import { urlRastreoAgencia } from '../../constants/courierTracking'
import { formatearFecha } from '../../utils/fecha'
import { campoClaveRecojo } from '../shalom/campoClaveRecojo'

function Fila({ label, valor, destacado = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="shrink-0 text-[13px] text-gray-500">{label}</span>
      {destacado ? (
        <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          {valor}
        </span>
      ) : (
        <span className="text-right text-[13px] font-semibold leading-snug text-gray-900">{valor}</span>
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
// `compactoMovil` (Shalom en ruta): en celular el título grande ya lo da la tarjeta de
// progreso de arriba, así que aquí queda solo "Seguimiento de envío" y el enlace al
// mapa (`onVerMapa`), que en esa pantalla no se muestra entero.
export default function CourierTrackingCard({
  pedido,
  lugar,
  identidad,
  className = '',
  compactoMovil = false,
  onVerMapa,
}) {
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
  const claveRecojo = campoClaveRecojo(pedido, identidad)
  const filaClave = claveRecojo && <Fila label={claveRecojo.label} valor={claveRecojo.valor} />
  const soloEscritorio = compactoMovil ? 'max-md:hidden' : ''

  return (
    <div className={`w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {compactoMovil && (
        <div className="mb-1 flex items-center justify-between gap-2 md:hidden">
          <p className="mb-0 text-sm font-semibold text-gray-900">Seguimiento de envío</p>
          {onVerMapa && (
            <button
              type="button"
              onClick={onVerMapa}
              className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-semibold text-violet-700"
            >
              Ver mapa <RightOutlined className="text-[10px]" />
            </button>
          )}
        </div>
      )}

      <div className={`mb-3 inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ${soloEscritorio}`}>
        {variante?.badge ?? 'Seguimiento de envío'}
      </div>

      {variante ? (
        <>
          <h2 className={`mb-2 text-xl font-bold leading-tight tracking-tight text-gray-900 ${soloEscritorio}`}>{variante.titulo(agencia)}</h2>
          {fechaPaso && <p className={`mb-2 text-xs font-semibold text-gray-500 ${soloEscritorio}`}>{fechaPaso}</p>}
          <p className={`mb-3 text-[13px] leading-5 text-gray-600 ${soloEscritorio}`}>
            {typeof variante.descripcion === 'function' ? variante.descripcion(agencia) : variante.descripcion}
          </p>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            <Fila label="Guía" valor={guia || 'Pendiente'} />
            <Fila label="Código" valor={codigo || 'No Disponible'} />
            {filaClave}
            {variante.mostrarAgenciaDestino && <Fila label="Agencia destino" valor={sucursal || 'Pendiente'} />}
            <Fila label={`Estado en ${agencia}`} valor={seguimiento.mensaje ?? 'Pendiente'} destacado />
          </div>
        </>
      ) : (
        <>
          <h2 className={`mb-2 text-xl font-bold leading-tight tracking-tight text-gray-900 ${soloEscritorio}`}>Tu pedido está en manos de {agencia}</h2>
          <p className={`mb-3 text-[13px] leading-5 text-gray-600 ${soloEscritorio}`}>
            Consulta el seguimiento de tu envío directamente en {agencia}.
          </p>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            <Fila label="Código" valor={codigo || 'No Disponible'} />
            <Fila label="Guía" valor={guia || 'Pendiente'} />
            {filaClave}
            <Fila label="Agencia" valor={sucursal || 'Pendiente'} />
            <Fila
              label={`Estado en ${agencia}`}
              valor={seguimiento?.mensaje ?? estadoActual?.nombre ?? 'Pendiente'}
              destacado
            />
          </div>
          {seguimiento?.demora && (
            <p className="mb-0 mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <ExclamationCircleFilled /> Este envío está demorado
            </p>
          )}
        </>
      )}

      {urlRastreo && (
        <a
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#560591] text-sm font-semibold text-[#560591]! transition-colors hover:bg-violet-50"
          href={urlRastreo}
          target="_blank"
          rel="noopener noreferrer"
        >
          Rastrear en {agencia}
          <ArrowRightOutlined className="-rotate-45 text-xs" />
        </a>
      )}
    </div>
  )
}
