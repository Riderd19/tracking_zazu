import PreparingCard from '../../components/estados/PreparingCard'
import PreparandoShalomView from './PreparandoShalomView'
import TarjetaConIlustracion from './TarjetaConIlustracion'

/**
 * El pedido se está empaquetando en el almacén. Courier Shalom tiene su propio diseño
 * (con el lugar del voucher y "¿Qué sigue?"); el resto usa la tarjeta con ilustración.
 */
export default function PreparandoView({ pedido, identidad, onPedidoUpdate, destino }) {
  if (pedido.es_shalom && (pedido.tipo_envio ?? '').toUpperCase() === 'COURIER') {
    return (
      <PreparandoShalomView
        pedido={pedido}
        identidad={identidad}
        onPedidoUpdate={onPedidoUpdate}
        destino={destino}
      />
    )
  }

  return (
    <TarjetaConIlustracion
      imagenSrc="/images/pedido-preparando-zazu.png"
      imagenAlt="Repartidor de Zazu empaquetando el pedido en el almacén"
      imagenClassName="md:scale-125"
      gridClassName="lg:grid-cols-[minmax(300px,360px)_minmax(460px,600px)]"
    >
      <PreparingCard
        pedido={pedido}
        lugar={destino}
        identidad={identidad}
        onPedidoUpdate={onPedidoUpdate}
      />
    </TarjetaConIlustracion>
  )
}
