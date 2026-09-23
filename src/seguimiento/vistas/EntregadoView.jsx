import DeliveredCard from '../../components/estados/DeliveredCard'

/** Pedido entregado. Hoy igual para los dos tipos de envío. */
export default function EntregadoView({ pedido, identidad }) {
  return <DeliveredCard pedido={pedido} identidad={identidad} />
}
