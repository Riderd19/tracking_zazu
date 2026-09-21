import { EN_GESTION } from '../constants/estadosPedido'
import RegistradoView from './vistas/RegistradoView'
import PreparandoView from './vistas/PreparandoView'
import EnRutaDeliveryView from './vistas/EnRutaDeliveryView'
import EnRutaCourierView from './vistas/EnRutaCourierView'
import EntregadoView from './vistas/EntregadoView'
import CanceladoView from './vistas/CanceladoView'

/**
 * Qué diseño le toca a cada momento del pedido, por tipo de envío.
 *
 * Está escrita entera —con las celdas repetidas y todo— en vez de con
 * "compartidas + excepciones", porque así se lee la matriz de un vistazo: qué
 * comparten Delivery y Courier hoy, y dónde ya divergen. Para que un estado
 * deje de compartirse (p. ej. que Courier tenga su propio "registrado"), se
 * cambia esa celda y nada más.
 *
 * Hoy la única divergencia real es "en ruta", y con razón: en Delivery el
 * paquete va con un motorizado propio y lo que importa es el domicilio; en
 * Courier está en manos de una agencia externa y lo que importa es su
 * seguimiento.
 */
const VISTAS = {
  DELIVERY: {
    registrado: RegistradoView,
    preparando: PreparandoView,
    en_ruta: EnRutaDeliveryView,
    entregado: EntregadoView,
    cancelado: CanceladoView,
  },
  COURIER: {
    registrado: RegistradoView,
    preparando: PreparandoView,
    en_ruta: EnRutaCourierView,
    entregado: EntregadoView,
    cancelado: CanceladoView,
  },
}

/**
 * Los códigos de `estado_actual` que manda el backend son más que los diseños
 * que existen (En Gestión agrupa varios sub-estados previos al despacho), así
 * que primero se traducen a una de las cinco etapas de la tabla.
 */
function etapaDe(estadoCodigo) {
  if (estadoCodigo === 'cancelado') return 'cancelado'
  if (estadoCodigo === 'despachado') return 'preparando'
  if (estadoCodigo === 'en_ruta') return 'en_ruta'
  if (estadoCodigo === 'entregado') return 'entregado'
  if (EN_GESTION.includes(estadoCodigo)) return 'registrado'

  // Un estado que no conocemos (o "no entregado") no tiene diseño propio: se
  // muestra solo la línea de tiempo, que ya lo refleja.
  return null
}

/** El diseño que le corresponde a este pedido, o nada si su estado no tiene uno. */
export default function VistaDelEstado({ pedido, identidad, onPedidoUpdate, destino }) {
  const etapa = etapaDe(pedido.estado_actual?.codigo)
  const tipo = (pedido.tipo_envio ?? '').toUpperCase()
  const Vista = VISTAS[tipo]?.[etapa]

  if (!Vista) return null

  return (
    <Vista
      pedido={pedido}
      identidad={identidad}
      onPedidoUpdate={onPedidoUpdate}
      destino={destino}
    />
  )
}
