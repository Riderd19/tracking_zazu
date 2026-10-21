import DeliveredCard from '../../components/estados/DeliveredCard'
import EntregadoShalomView from './EntregadoShalomView'

/**
 * Pedido entregado. Courier Shalom tiene su propio diseño (con el voucher como
 * comprobante del envío); el resto de envíos usa la tarjeta de siempre.
 */
export default function EntregadoView({ pedido, identidad, destino }) {
  if (pedido.es_shalom && (pedido.tipo_envio ?? '').toUpperCase() === 'COURIER') {
    return <EntregadoShalomView pedido={pedido} identidad={identidad} destino={destino} />
  }

  return <DeliveredCard pedido={pedido} identidad={identidad} />
}
