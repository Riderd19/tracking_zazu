import TarjetaSoporte from '../../components/chat/TarjetaSoporte'
import SaldoPendiente from '../../components/pago/SaldoPendiente'
import saldoCobrable from '../../components/pago/saldoCobrable'
import OrderItemsSummary from '../../components/seguimiento/OrderItemsSummary'
import FilaDato from '../../components/shalom/FilaDato'
import FotoEmpaquetado from '../../components/shalom/FotoEmpaquetado'
import ProgresoShalomMovil from '../../components/shalom/ProgresoShalomMovil'
import QueSigue from '../../components/shalom/QueSigue'
import ValorClaveRecojo from '../../components/shalom/ClaveRecojo'
import VoucherPendiente from '../../components/shalom/VoucherPendiente'
import { ESTADOS_ID_CON_PAGO } from '../../constants/estadosPedido'
import { estadoClaveRecojo } from '../../services/claveRecojo'
import { agenciaBase } from '../../utils/agencia'
import { formatearFechaConHora } from '../../utils/fecha'

const TITULO = 'Estamos preparando tu pedido'
const MENSAJE = 'Estamos organizando y validando tu pedido para dejarlo listo para el envío.'

function InsigniaPreparando() {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
      Preparando pedido
    </span>
  )
}

/**
 * Courier Shalom, preparando pedido (despachado / picking).
 *
 * Escritorio, tres columnas: el pedido con sus datos y la ayuda; el lugar del voucher
 * (todavía pendiente) y "¿Qué sigue?"; el saldo por pagar y el resumen con la foto.
 *
 * Celular: las columnas se aplanan (`max-md:contents`) y van en el orden del diseño:
 * progreso, saldo, voucher pendiente, detalle, ¿qué sigue?, resumen con la foto, soporte.
 *
 * El saldo se ofrece con la misma regla que la tarjeta anterior de este estado: solo en
 * los `estado_id` en que ya se puede pagar antes de salir en ruta (ESTADOS_ID_CON_PAGO).
 */
export default function PreparandoShalomView({ pedido, identidad, onPedidoUpdate, destino }) {
  const agencia = agenciaBase(destino)
  const AGENCIA = (agencia || 'Shalom').toUpperCase()
  const fecha = formatearFechaConHora(pedido.fecha_despacho)
  const conSaldo = ESTADOS_ID_CON_PAGO.includes(Number(pedido.estado_id)) && saldoCobrable(pedido)
  const conResumen = pedido.articulos?.length > 0 || pedido.foto_packing_url || pedido.foto_packing_url_2

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 md:px-[4%] xl:grid-cols-[minmax(280px,340px)_minmax(380px,560px)_minmax(280px,340px)] xl:justify-center xl:px-0">
      <ProgresoShalomMovil
        paso={2}
        etiqueta="Preparando"
        insignia={<InsigniaPreparando />}
        titulo={TITULO}
        descripcion={MENSAJE}
        className="order-0"
      />

      <div className="flex flex-col gap-4 max-md:contents">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm max-md:order-3">
          <p className="mb-1 text-sm font-semibold text-gray-900 md:hidden">Detalle del pedido</p>

          <div className="max-md:hidden">
            <div className="mb-3">
              <InsigniaPreparando />
            </div>
            <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900">{TITULO}</h2>
            {fecha && <p className="mb-2 text-[13px] text-gray-700">{fecha}</p>}
            <p className="mb-3 text-[13px] leading-5 text-gray-600">{MENSAJE}</p>
          </div>

          <div className="divide-y divide-gray-100">
            <FilaDato label="Pedido">{pedido.codigo}</FilaDato>
            <FilaDato label="Código" tono={pedido.codigo_courier ? 'normal' : 'tenue'}>
              {pedido.codigo_courier || 'No disponible'}
            </FilaDato>
            <FilaDato label="Guía" tono={pedido.guia_courier ? 'normal' : 'tenue'}>
              {pedido.guia_courier || 'Pendiente'}
            </FilaDato>
            {estadoClaveRecojo(pedido) && (
              <FilaDato label="Clave de recojo">
                <ValorClaveRecojo pedido={pedido} identidad={identidad} />
              </FilaDato>
            )}
            <FilaDato label="Tipo de entrega">Agencia {AGENCIA}</FilaDato>
            <FilaDato label="Próximo paso" tono="acento">
              En ruta
            </FilaDato>
          </div>
        </div>

        <TarjetaSoporte tambienEnMovil className="max-md:order-6" />
      </div>

      <div className="flex flex-col gap-4 max-md:contents">
        <VoucherPendiente agencia={agencia} className="max-md:order-2" />
        <QueSigue agencia={agencia} actual={1} className="max-md:order-4" />
      </div>

      <div className="flex flex-col gap-4 max-md:contents md:col-span-2 md:grid md:grid-cols-2 xl:col-span-1 xl:flex xl:flex-col">
        {conSaldo && (
          <div className="max-md:order-1">
            <SaldoPendiente pedido={pedido} identidad={identidad} onPedidoUpdate={onPedidoUpdate} />
          </div>
        )}
        {conResumen && (
          <div className="flex flex-col divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white max-md:order-5">
            <OrderItemsSummary pedido={pedido} soloCabecera className="rounded-none border-0" />
            <FotoEmpaquetado pedido={pedido} className="rounded-none border-0" />
          </div>
        )}
      </div>
    </div>
  )
}
