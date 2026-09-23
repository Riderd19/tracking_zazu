import PreparingCard from '../../components/estados/PreparingCard'
import TarjetaConIlustracion from './TarjetaConIlustracion'

/** El pedido se está empaquetando en el almacén. Hoy igual para los dos tipos de envío. */
export default function PreparandoView({ pedido, identidad, onPedidoUpdate, destino }) {
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
