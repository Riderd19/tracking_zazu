import RegisteredCard from '../../components/estados/RegisteredCard'
import TarjetaConIlustracion from './TarjetaConIlustracion'

/** Pedido recién registrado, todavía sin preparar. Hoy igual para los dos tipos de envío. */
export default function RegistradoView({ pedido, destino }) {
  return (
    <TarjetaConIlustracion
      imagenSrc="/images/pedido-registrado-zazu.png"
      imagenAlt="Pedido de Zazu recién registrado, listo para preparar"
      gridClassName="lg:grid-cols-[minmax(300px,360px)_minmax(460px,700px)]"
    >
      <RegisteredCard pedido={pedido} lugar={destino} />
    </TarjetaConIlustracion>
  )
}
