import CancelledCard from '../../components/estados/CancelledCard'

/** Pedido anulado. Hoy igual para los dos tipos de envío. */
export default function CanceladoView({ pedido }) {
  return (
    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(300px,390px)_minmax(440px,680px)] md:px-[3%] lg:justify-center lg:gap-12">
      <CancelledCard pedido={pedido} />
      <div className="h-72 w-full md:h-105 lg:h-115">
        <img
          src="/images/pedido-anulado-zazu.png"
          alt="Repartidor de Zazu junto a un teléfono que indica pedido anulado"
          className="h-full w-full object-contain object-center"
        />
      </div>
    </div>
  )
}
