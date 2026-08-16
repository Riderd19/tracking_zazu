import { Button } from 'antd'
import TruckFastIcon from './icons/TruckFastIcon'
import { agenciaBase, nombreYAgencia } from '../utils/agencia'
import { urlRastreoAgencia } from '../constants/courierTracking'

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

// Pedidos COURIER en "en_ruta": el paquete ya está en manos del courier
// externo (Shalom, etc.), no de un motorizado propio de Zazu — por eso no
// hay DriverCard/DeliveryMap acá, sino esta tarjeta con los datos de
// seguimiento que sí expone el tracking público (guía/agencia/estado). El
// código/clave del courier ya se muestra arriba, en la barra de info
// (OrderSummaryCard) — no se repite acá.
// `lugar` es el mismo string ya usado para "Destino" en OrderSummaryCard
// (agencia - sucursal - ubicación), del que se derivan agencia/sucursal acá
// para no repetir el parseo. El botón "Rastrear en X" varía según la
// agencia (ver courierTracking.js) y se omite si no hay URL conocida.
export default function CourierTrackingCard({ pedido, lugar, className = '' }) {
  const { guia_courier: guia, estado_actual: estadoActual } = pedido
  const agencia = agenciaBase(lugar) || 'el courier'
  const sucursal = nombreYAgencia(lugar)
  const urlRastreo = urlRastreoAgencia(agencia)

  return (
    <div className={`w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
        <TruckFastIcon className="text-sm" />
        Seguimiento de envío
      </div>

      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">Tu pedido está en manos de {agencia}</h2>
      <p className="mb-3 text-xs leading-5 text-gray-500">
        Consulta el seguimiento de tu envío directamente en {agencia}.
      </p>

      <div className="divide-y divide-gray-100 border-y border-gray-100">
        <Fila label="Guía" valor={guia || 'Pendiente'} />
        <Fila label="Agencia" valor={sucursal || 'Pendiente'} />
        <Fila label={`Estado en ${agencia}`} valor={estadoActual?.nombre ?? 'Pendiente'} destacado />
      </div>

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
