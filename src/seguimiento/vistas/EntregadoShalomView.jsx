import { CheckOutlined } from '@ant-design/icons'
import TarjetaSoporte from '../../components/chat/TarjetaSoporte'
import OrderItemsSummary from '../../components/seguimiento/OrderItemsSummary'
import FilaDato from '../../components/shalom/FilaDato'
import FotoEmpaquetado from '../../components/shalom/FotoEmpaquetado'
import ProgresoShalomMovil from '../../components/shalom/ProgresoShalomMovil'
import ValorClaveRecojo from '../../components/shalom/ClaveRecojo'
import VoucherEnvio from '../../components/shalom/VoucherEnvio'
import { estadoClaveRecojo } from '../../services/claveRecojo'
import { agenciaBase, nombreYAgencia } from '../../utils/agencia'
import { formatearFechaConHora, formatearFechaCorta } from '../../utils/fecha'
import fechaDeEntrega from '../fechaDeEntrega'

const MENSAJE = 'Tu pedido fue entregado correctamente. Gracias por confiar en Zazu Express.'

function InsigniaEntregado() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <CheckOutlined className="text-[10px]" /> Entrega completada
    </span>
  )
}

/**
 * Courier Shalom entregado.
 *
 * Escritorio, tres columnas: el pedido entregado con sus datos y la ayuda; el voucher,
 * que ahora es el comprobante del envío (o la prueba para un reclamo); y el resumen con
 * la foto del empaquetado. Sin mapa ni pagos: ya no queda nada por hacer en la agencia.
 *
 * Celular: las columnas se aplanan (`max-md:contents`) y van en el orden del diseño:
 * progreso, voucher, detalle, resumen con la foto, soporte. El título "Pedido entregado"
 * y el mensaje los da la tarjeta de progreso, así que la de datos queda como "Detalle
 * del pedido".
 */
export default function EntregadoShalomView({ pedido, identidad, destino }) {
  const fecha = fechaDeEntrega(pedido)
  const lugar = nombreYAgencia(destino)
  const agencia = agenciaBase(destino)
  const conClave = Boolean(estadoClaveRecojo(pedido))

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5 md:px-[4%] xl:grid-cols-[minmax(280px,340px)_minmax(380px,560px)_minmax(280px,340px)] xl:justify-center xl:px-0">
      <ProgresoShalomMovil
        paso={4}
        etiqueta="Entregado"
        tono="verde"
        insignia={<InsigniaEntregado />}
        titulo="Pedido entregado"
        descripcion={MENSAJE}
        className="order-0"
      />

      <div className="flex flex-col gap-4 max-md:contents">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm max-md:order-2">
          <p className="mb-1 text-sm font-semibold text-gray-900 md:hidden">Detalle del pedido</p>

          <div className="max-md:hidden">
            <div className="mb-3">
              <InsigniaEntregado />
            </div>
            <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900">Pedido entregado</h2>
            {fecha && <p className="mb-2 text-[13px] text-gray-700">{formatearFechaConHora(fecha)}</p>}
            <p className="mb-3 text-[13px] leading-5 text-gray-600">{MENSAJE}</p>
          </div>

          <div className="divide-y divide-gray-100">
            <FilaDato label="Pedido">{pedido.codigo}</FilaDato>
            <FilaDato label="Código" tono={pedido.codigo_courier ? 'normal' : 'tenue'}>{pedido.codigo_courier || 'No disponible'}</FilaDato>
            <FilaDato label="Guía" tono={pedido.guia_courier ? 'normal' : 'tenue'}>{pedido.guia_courier || 'No disponible'}</FilaDato>
            {conClave && (
              <FilaDato label="Clave de recojo">
                <ValorClaveRecojo pedido={pedido} identidad={identidad} />
              </FilaDato>
            )}
            <FilaDato label="Lugar de entrega">{lugar || 'No disponible'}</FilaDato>
            <FilaDato label="Fecha de entrega">{formatearFechaCorta(fecha) ?? 'No disponible'}</FilaDato>
          </div>
        </div>

        <TarjetaSoporte tambienEnMovil className="max-md:order-4" />
      </div>

      <div className="max-md:order-1">
        <VoucherEnvio pedido={pedido} identidad={identidad} agencia={agencia} lugar={lugar} entregado />
      </div>

      {/* Resumen y foto en una sola tarjeta, separadas por una línea. */}
      {(pedido.articulos?.length > 0 || pedido.foto_packing_url || pedido.foto_packing_url_2) && (
        <div className="flex flex-col divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white max-md:order-3 md:col-span-2 xl:col-span-1">
          <OrderItemsSummary pedido={pedido} soloCabecera className="rounded-none border-0" />
          <FotoEmpaquetado pedido={pedido} className="rounded-none border-0" />
        </div>
      )}
    </div>
  )
}
