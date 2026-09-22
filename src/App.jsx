import PublicLayout from './layouts/PublicLayout'
import BuscarPedidoPage from './pages/BuscarPedidoPage'
import SeguimientoPage from './pages/SeguimientoPage'
import useSeguimientoPedido from './hooks/useSeguimientoPedido'

/**
 * Dos pantallas y ningún router: mientras no haya pedido se muestra el
 * formulario, y en cuanto hay uno, su seguimiento.
 *
 * No se usa react-router a propósito. Con dos pantallas no aporta, y además
 * chocaría con una decisión deliberada del tracking: la URL se limpia apenas se
 * consume (ver limpiarCodigoDeUrl), para no dejar el código y el DNI del
 * cliente colgados en el historial del navegador.
 */
export default function App() {
  const { pedido, identidad, loading, error, codigoInicial, buscar, volver, actualizarPedido } =
    useSeguimientoPedido()

  return (
    <PublicLayout onVolver={pedido ? volver : undefined}>
      {pedido ? (
        <SeguimientoPage
          pedido={pedido}
          identidad={identidad}
          onPedidoUpdate={actualizarPedido}
        />
      ) : (
        <BuscarPedidoPage
          onBuscar={buscar}
          loading={loading}
          error={error}
          codigoInicial={codigoInicial}
        />
      )}
    </PublicLayout>
  )
}
